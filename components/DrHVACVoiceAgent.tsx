import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { createPcmBlob, base64ToArrayBuffer, decodeAudioData } from '../utils/audio-utils';
import Visualizer from './Visualizer';

// --- Configuration ---
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

const updateRebateDisplayDeclaration: FunctionDeclaration = {
  name: 'updateRebateDisplay',
  parameters: {
    type: Type.OBJECT,
    description: 'Update the visual display with the qualified rebate amount and heating source.',
    properties: {
      amount: {
        type: Type.NUMBER,
        description: 'The rebate amount in dollars (e.g., 2000 or 7500).',
      },
      sourceType: {
        type: Type.STRING,
        description: 'The customer heating source (Gas, Oil, or Electric).',
      },
    },
    required: ['amount', 'sourceType'],
  },
};

const confirmEmergencyBookingDeclaration: FunctionDeclaration = {
  name: 'confirmEmergencyBooking',
  parameters: {
    type: Type.OBJECT,
    description: 'Visually confirm an emergency repair booking on the interface.',
    properties: {
      issue: {
        type: Type.STRING,
        description: 'Brief description of the HVAC issue (e.g., No Heat, Leaking AC).',
      },
      guaranteeTime: {
        type: Type.STRING,
        description: 'The promised response window (always 4 hours).',
      },
    },
    required: ['issue', 'guaranteeTime'],
  },
};

const SYSTEM_INSTRUCTION = `
Role: You are Sarah, the AI Lead Specialist for Dr. HVAC in Toronto. You are warm, professional, and efficient.

Knowledge Base:
- Response: 4-hour emergency response guarantee.
- Financing: 6 months 0% interest on new installs.
- Rebates: Up to $7,500 (HRS Program) for electric/oil homes; up to $2,000 for gas homes.
- Maintenance: $9.99/month Service Club includes priority 24-hour booking and 15% repair discounts.

Call Flow for Rebates:
1. When a user mentions "rebates", "savings", or "heat pumps", acknowledge and ask: "Is your current heating source Gas, Oil, or Electric?"
2. Call updateRebateDisplay based on their answer.

Call Flow for Emergencies (CRITICAL):
1. Identification: If the user says "emergency", "broken", "no heat", "leaking", or sounds urgent, pivot immediately.
2. Reassurance: "I'm so sorry to hear you're dealing with that. Don't worry, Dr. HVAC offers a 4-hour emergency response guarantee."
3. Details: Ask: "What exactly is happening with your unit?" and "Could I have your address and phone number for the dispatcher?"
4. Confirmation: Once they provide the issue, CALL confirmEmergencyBooking(issue: [description], guaranteeTime: '4 Hours').
5. Closing: "I've flagged this as a priority. Our dispatcher will call you within the hour to confirm our technician's arrival time."

Negative Constraints:
- Do not mention $7,500 unless it is an Oil or Electric home.
- Stay in character as Sarah at all times.
- If they ask for pricing, say: "Only a technician can provide an exact fixed-price quote after seeing the unit."
`;

interface RebateInfo {
  amount: number;
  sourceType: string;
}

interface EmergencyInfo {
  issue: string;
  guaranteeTime: string;
}

const DrHVACVoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qualifiedRebate, setQualifiedRebate] = useState<RebateInfo | null>(null);
  const [emergencyBooking, setEmergencyBooking] = useState<EmergencyInfo | null>(null);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeRef = useRef(false);

  const initAudioContexts = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
    if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
  };

  const connectToGemini = async () => {
    try {
      setIsError(false);
      setErrorMessage('');
      setQualifiedRebate(null);
      setEmergencyBooking(null);
      initAudioContexts();
      
      if (inputAudioContextRef.current?.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current?.state === 'suspended') await outputAudioContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 } 
      });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            activeRef.current = true;
            startAudioInput(stream);
          },
          onmessage: async (message: LiveServerMessage) => {
            await handleServerMessage(message);
          },
          onclose: (e) => {
            setIsConnected(false);
            activeRef.current = false;
            stopAudio();
          },
          onerror: (e) => {
            setIsError(true);
            setErrorMessage('Connection lost. Please retry.');
            setIsConnected(false);
            activeRef.current = false;
            stopAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [updateRebateDisplayDeclaration, confirmEmergencyBookingDeclaration] }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Failed to start call.');
    }
  };

  const startAudioInput = (stream: MediaStream) => {
    if (!inputAudioContextRef.current) return;
    const source = inputAudioContextRef.current.createMediaStreamSource(stream);
    inputSourceRef.current = source;
    const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;
    processor.onaudioprocess = (e) => {
      if (!activeRef.current) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => console.error("Stream error:", err));
      }
    };
    source.connect(processor);
    processor.connect(inputAudioContextRef.current.destination);
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    if (!outputAudioContextRef.current) return;

    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'updateRebateDisplay') {
          const args = fc.args as any;
          setQualifiedRebate({ amount: args.amount, sourceType: args.sourceType });
          sessionPromiseRef.current?.then(session => {
            session.sendToolResponse({
              functionResponses: { id: fc.id, name: fc.name, response: { result: "Display updated" } }
            });
          });
        }
        if (fc.name === 'confirmEmergencyBooking') {
          const args = fc.args as any;
          setEmergencyBooking({ issue: args.issue, guaranteeTime: args.guaranteeTime });
          sessionPromiseRef.current?.then(session => {
            session.sendToolResponse({
              functionResponses: { id: fc.id, name: fc.name, response: { result: "Emergency UI confirmed" } }
            });
          });
        }
      }
    }
    
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio) {
      const audioData = new Uint8Array(base64ToArrayBuffer(base64Audio));
      try {
        const audioBuffer = await decodeAudioData(audioData, outputAudioContextRef.current, 24000, 1);
        playAudioBuffer(audioBuffer);
      } catch (err) {
        console.error("Audio error:", err);
      }
    }

    if (message.serverContent?.interrupted) {
      stopAllPlayingSources();
      nextStartTimeRef.current = 0;
    }
  };

  const playAudioBuffer = (buffer: AudioBuffer) => {
    if (!outputAudioContextRef.current) return;
    const ctx = outputAudioContextRef.current;
    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => sourcesRef.current.delete(source);
    source.start(startTime);
    sourcesRef.current.add(source);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  const stopAllPlayingSources = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { }
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
       sessionPromiseRef.current.then(session => {
         if(session.close) session.close(); 
       });
    }
    stopAudio();
    setIsConnected(false);
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-100 max-w-lg w-full mx-auto mt-8 flex flex-col transition-all duration-300">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,1),transparent)]"></div>
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-inner border border-white/20 relative z-10 transition-transform hover:scale-105 duration-300">
           <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
           </svg>
        </div>
        <h2 className="text-2xl font-black mb-1 tracking-tight relative z-10">Talk to Sarah</h2>
        <p className="text-blue-100/80 text-xs font-bold uppercase tracking-[0.2em] relative z-10">AI Lead Specialist</p>
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col items-center space-y-6">
        
        {/* Dynamic Context UI */}
        <div className="w-full space-y-3">
          {qualifiedRebate && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-center justify-between shadow-[0_8px_20px_rgba(16,185,129,0.05)] animate-slide-up-fade">
               <div>
                 <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Qualified Rebate</p>
                 <p className="text-4xl font-black text-emerald-700 tracking-tighter leading-none">${qualifiedRebate.amount.toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">{qualifiedRebate.sourceType}</span>
               </div>
            </div>
          )}

          {emergencyBooking && (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-5 flex items-center justify-between shadow-[0_8px_20px_rgba(239,68,68,0.05)] animate-slide-up-fade">
               <div>
                 <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-1">Emergency Dispatch</p>
                 <p className="text-xl font-black text-red-800 tracking-tight leading-tight">{emergencyBooking.issue}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-red-600 uppercase mb-1">Response</p>
                  <p className="text-xs font-black text-white bg-red-600 px-4 py-1.5 rounded-xl shadow-lg shadow-red-500/30">{emergencyBooking.guaranteeTime}</p>
               </div>
            </div>
          )}
        </div>

        {/* Visualizer Area */}
        <div className="w-full relative px-1">
          <Visualizer 
            isActive={isConnected} 
            audioContext={inputAudioContextRef.current}
            sourceNode={inputSourceRef.current}
          />
        </div>

        {/* Status Messages */}
        <div className="text-center h-6 flex items-center justify-center">
           {isError ? (
             <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errorMessage}</p>
           ) : isConnected ? (
             <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
               <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">Sarah is Listening</p>
             </div>
           ) : (
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">Ready to assist you</p>
           )}
        </div>

        {/* Controls */}
        <div className="w-full flex justify-center pt-2 pb-2">
          {!isConnected ? (
            <button
              onClick={connectToGemini}
              className="relative group flex items-center justify-center w-24 h-24 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 active:scale-95 focus:outline-none"
            >
               <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-10 group-hover:hidden"></div>
               <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="relative group flex items-center justify-center w-24 h-24 bg-slate-900 hover:bg-red-600 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none"
            >
               <svg className="w-10 h-10 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50/30 px-10 py-6 border-t border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm rotate-12 shadow-sm"></div>
           <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">Sarah AI v1.2</span>
         </div>
         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Channel</span>
      </div>
    </div>
  );
};

export default DrHVACVoiceAgent;