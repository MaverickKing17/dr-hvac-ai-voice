import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, base64ToArrayBuffer, decodeAudioData } from '../utils/audio-utils';
import Visualizer from './Visualizer';

// --- Configuration ---
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

const SYSTEM_INSTRUCTION = `
Role: You are Sarah, the AI Lead Specialist for Dr. HVAC in Toronto. You are warm, professional, and efficient.

Knowledge Base:
- Response: 4-hour emergency response guarantee.
- Financing: 6 months 0% interest on new installs.
- Rebates: Up to $7,500 (HRS Program) for electric/oil homes; up to $2,000 for gas homes.
- Maintenance: $9.99/month Service Club includes priority 24-hour booking and 15% repair discounts.

Call Flow:
1. Identify: "Hi! Thanks for calling Dr. HVAC. This is Sarah. Are you calling for an emergency repair or to claim your $7,500 heat pump rebate?"
2. Qualify: 
   - If they ask about the rebate, ask: "To get you the right information, what is your current heating source? Is it Gas, Oil, or Electric?"
   - If Gas: Inform them they qualify for the $2,000 rebate tier.
   - If Electric or Oil: Inform them they qualify for the massive $7,500 HRS rebate.
3. Address Risks: For repairs, say: "Our tech will give you a fixed-price quote before any work starts so you're in total control".
4. Close: Collect Name and Phone. Say: "I've locked in your spot. Expect a call from our dispatcher within the hour."

Negative Constraints (The "Don'ts"):
- Do Not Guarantee Pricing: Never give a specific dollar amount for a repair or installation. Say: "Only a technician can provide an exact fixed-price quote after seeing the unit."
- Do Not Promise "Today" Appointments: Do not tell a customer a tech will be there today unless the dispatcher has confirmed it. Say: "I can confirm we have a 4-hour response window, and our dispatcher will call you shortly to give you the exact arrival time."
- Do Not Give Technical Diagnoses: If a customer describes a noise or a leak, do not guess what’s wrong. Say: "That sounds like something we should have a pro look at immediately to prevent further damage."
- Do Not Mention Competitors: Never compare Dr. HVAC to other Toronto companies like Reliance or Enercare.
- No "Robot" Talk: Avoid phrases like "As an AI language model" or "I am processing your request." Stay in character as Sarah at all times.
`;

const DrHVACVoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Playback Timing Refs
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Session Ref
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeRef = useRef(false);

  // Initialize Audio Contexts
  const initAudioContexts = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 }); // Input required at 16kHz
    }
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 }); // Gemini output is 24kHz
    }
  };

  const connectToGemini = async () => {
    try {
      setIsError(false);
      setErrorMessage('');
      initAudioContexts();
      
      // Resume contexts if suspended (browser policy)
      if (inputAudioContextRef.current?.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current?.state === 'suspended') await outputAudioContextRef.current.resume();

      // Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Connect to Live API
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
            setIsConnected(true);
            activeRef.current = true;
            startAudioInput(stream);
          },
          onmessage: async (message: LiveServerMessage) => {
            await handleServerMessage(message);
          },
          onclose: (e) => {
            console.log('Gemini Live Connection Closed', e);
            setIsConnected(false);
            activeRef.current = false;
            stopAudio();
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            setIsError(true);
            setErrorMessage('Connection error. Please try again.');
            setIsConnected(false);
            activeRef.current = false;
            stopAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Female, warm voice
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Failed to connect:", err);
      setIsError(true);
      setErrorMessage(err.message || 'Failed to access microphone or connect to API.');
    }
  };

  const startAudioInput = (stream: MediaStream) => {
    if (!inputAudioContextRef.current) return;

    const source = inputAudioContextRef.current.createMediaStreamSource(stream);
    inputSourceRef.current = source;

    // Use ScriptProcessor for capturing raw PCM (Standard for this API demo)
    // Buffer size 4096 gives a good balance of latency and stability
    const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!activeRef.current) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);

      // Send to Gemini
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => console.error("Error sending audio:", err));
      }
    };

    source.connect(processor);
    processor.connect(inputAudioContextRef.current.destination);
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    if (!outputAudioContextRef.current) return;
    
    // Handle Text Transcription (Debugging or UI display could go here)
    if (message.serverContent?.modelTurn?.parts[0]?.text) {
       // console.log("Sarah: ", message.serverContent.modelTurn.parts[0].text);
    }

    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio) {
      const audioData = new Uint8Array(base64ToArrayBuffer(base64Audio));
      
      try {
        const audioBuffer = await decodeAudioData(
          audioData,
          outputAudioContextRef.current,
          24000,
          1
        );
        
        playAudioBuffer(audioBuffer);
      } catch (err) {
        console.error("Error decoding audio:", err);
      }
    }

    // Handle Interruption
    if (message.serverContent?.interrupted) {
      console.log("Interrupted by user");
      stopAllPlayingSources();
      nextStartTimeRef.current = 0;
    }
  };

  const playAudioBuffer = (buffer: AudioBuffer) => {
    if (!outputAudioContextRef.current) return;

    const ctx = outputAudioContextRef.current;
    
    // Schedule playback to be gapless
    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      sourcesRef.current.delete(source);
    };
    
    source.start(startTime);
    sourcesRef.current.add(source);
    
    // Advance time cursor
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  const stopAllPlayingSources = () => {
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) { /* ignore already stopped */ }
    });
    sourcesRef.current.clear();
  };

  const stopAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    stopAllPlayingSources();
  };

  const disconnect = async () => {
    activeRef.current = false;
    if (sessionPromiseRef.current) {
       // We can't strictly cancel the promise, but we can stop sending and close connection if exposed
       // The SDK's session object has a close method?
       // Based on examples, we usually just stop sending and handle onclose.
       // However, to force disconnect:
       sessionPromiseRef.current.then(session => {
         // Assuming session has a close method based on standard WebSocket behavior in SDKs
         // If not, we just stop the stream on our end.
         // @ts-ignore - The type definition might not expose close explicitly in all versions, but typically it exists
         if(session.close) session.close(); 
       });
    }
    stopAudio();
    setIsConnected(false);
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 max-w-lg w-full mx-auto mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white text-center">
        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
           {/* Dr HVAC Logo Placeholder */}
           <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold mb-1">Talk to Sarah</h2>
        <p className="text-blue-100 text-sm font-medium">Dr. HVAC AI Specialist</p>
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col items-center space-y-8">
        
        {/* Visualizer Area */}
        <div className="w-full relative">
          <Visualizer 
            isActive={isConnected} 
            audioContext={inputAudioContextRef.current}
            sourceNode={inputSourceRef.current}
          />
          {isConnected && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full animate-pulse">
               <div className="w-2 h-2 bg-red-500 rounded-full"></div>
               <span className="text-xs text-red-600 font-bold uppercase">Live</span>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <div className="text-center h-8">
           {isError ? (
             <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
           ) : isConnected ? (
             <p className="text-emerald-600 text-sm font-medium animate-fade-in">Listening... Speak naturally.</p>
           ) : (
             <p className="text-slate-500 text-sm">Tap the button below to start the call.</p>
           )}
        </div>

        {/* Controls */}
        <div className="w-full flex justify-center pb-4">
          {!isConnected ? (
            <button
              onClick={connectToGemini}
              className="group relative flex items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
               </svg>
               <span className="absolute -bottom-8 text-slate-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Call</span>
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="group relative flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L8.28 2.385A1 1 0 007.32 1H4a2 2 0 00-2 2z" />
               </svg>
               <span className="absolute -bottom-8 text-slate-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Hang Up</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
         <p className="text-xs text-slate-400">Dr. HVAC | 2026 Home Renovation Savings Program</p>
      </div>
    </div>
  );
};

export default DrHVACVoiceAgent;