
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { createPcmBlob, base64ToArrayBuffer, decodeAudioData } from '../utils/audio-utils';
import Visualizer from './Visualizer';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

const updateRebateDisplayDeclaration: FunctionDeclaration = {
  name: 'updateRebateDisplay',
  parameters: {
    type: Type.OBJECT,
    description: 'Update the visual display with the qualified rebate amount and heating source.',
    properties: {
      amount: {
        type: Type.NUMBER,
        description: 'The rebate amount in dollars.',
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
        description: 'Brief description of the HVAC issue.',
      },
      guaranteeTime: {
        type: Type.STRING,
        description: 'The promised response window (4 hours).',
      },
    },
    required: ['issue', 'guaranteeTime'],
  },
};

const SYSTEM_INSTRUCTION = `
Role: You are Sarah, the AI Lead Specialist for Dr. HVAC. You are warm and professional.
Tone: Helpful, efficient, local expert.
Rebates: Up to $7,500 (Oil/Electric switching to Heat Pump) or $2,000 (Gas).
Emergency: 4-hour response guarantee.
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
          onclose: () => {
            setIsConnected(false);
            activeRef.current = false;
            stopAudio();
          },
          onerror: () => {
            setIsError(true);
            setErrorMessage('Connection lost.');
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
      sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
    };
    source.connect(processor);
    processor.connect(inputAudioContextRef.current.destination);
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'updateRebateDisplay') {
          setQualifiedRebate(fc.args as any);
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "OK" } } }));
        }
        if (fc.name === 'confirmEmergencyBooking') {
          setEmergencyBooking(fc.args as any);
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "OK" } } }));
        }
      }
    }
    
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current) {
      const audioBuffer = await decodeAudioData(new Uint8Array(base64ToArrayBuffer(base64Audio)), outputAudioContextRef.current, 24000, 1);
      const ctx = outputAudioContextRef.current;
      const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;
    }

    if (message.serverContent?.interrupted) {
      sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
      nextStartTimeRef.current = 0;
    }
  };

  const stopAudio = () => {
    processorRef.current?.disconnect();
    inputSourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-200 max-w-xl w-full mx-auto flex flex-col transition-all duration-300">
      
      {/* Dr. HVAC Branded Header */}
      <div className="bg-[#004a99] p-12 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
        <div className="w-28 h-28 bg-white/10 backdrop-blur-2xl rounded-full mx-auto flex items-center justify-center mb-8 border-2 border-white/30 relative z-10 shadow-2xl">
           <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
           </svg>
        </div>
        <h2 className="text-4xl font-black mb-2 tracking-tight relative z-10 uppercase">Talk to Sarah</h2>
        <p className="text-white text-[14px] font-black uppercase tracking-[0.4em] relative z-10 drop-shadow-md">Reception & Lead Specialist</p>
      </div>

      <div className="p-10 flex flex-col items-center space-y-10">
        {/* Dynamic Coupon Boxes */}
        <div className="w-full space-y-6">
          {qualifiedRebate && (
            <div className="dashed-card p-8 flex items-center justify-between animate-slide-up-fade bg-[#fcfdfe] border-2 border-[#004a99]/10">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-[#f37021] rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                   <p className="text-[13px] text-slate-700 font-black uppercase tracking-widest">Rebate Offer</p>
                   <p className="text-5xl font-black text-slate-900 tracking-tighter">${qualifiedRebate.amount.toLocaleString()}</p>
                 </div>
               </div>
               <div className="text-right">
                  <span className="inline-block px-5 py-3 bg-blue-100 text-[#004a99] text-[13px] font-black rounded-xl border-2 border-blue-200 uppercase tracking-wider">{qualifiedRebate.sourceType} Home</span>
               </div>
            </div>
          )}

          {emergencyBooking && (
            <div className="dashed-card p-8 flex items-center justify-between animate-slide-up-fade bg-red-50 border-2 border-red-100">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/30">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <div>
                   <p className="text-[13px] text-red-700 font-black uppercase tracking-widest">Priority Dispatch</p>
                   <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{emergencyBooking.issue}</p>
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-[14px] font-black text-white bg-red-600 px-5 py-3 rounded-xl shadow-lg uppercase tracking-tight">{emergencyBooking.guaranteeTime}</p>
               </div>
            </div>
          )}
        </div>

        <Visualizer 
          isActive={isConnected} 
          audioContext={inputAudioContextRef.current}
          sourceNode={inputSourceRef.current}
        />

        <div className="text-center h-6">
           {isConnected ? (
             <div className="flex items-center gap-3">
               <span className="w-3 h-3 bg-[#f37021] rounded-full animate-pulse"></span>
               <p className="text-[#f37021] text-[14px] font-black uppercase tracking-[0.3em]">Live Conversation</p>
             </div>
           ) : (
             <p className="text-slate-600 text-[14px] font-black uppercase tracking-[0.2em]">System Ready</p>
           )}
        </div>

        {/* Action Button - Dr. HVAC Orange */}
        {!isConnected ? (
          <button
            onClick={connectToGemini}
            className="group relative flex items-center justify-center w-32 h-32 bg-[#f37021] hover:bg-[#e05e1a] text-white rounded-full shadow-[0_25px_50px_rgba(243,112,33,0.4)] transition-all transform hover:scale-105 active:scale-95"
          >
             <div className="absolute inset-0 rounded-full bg-[#f37021] animate-ping opacity-20 group-hover:hidden"></div>
             <svg className="w-14 h-14 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          </button>
        ) : (
          <button
            onClick={() => setIsConnected(false)}
            className="flex items-center justify-center w-28 h-28 bg-slate-900 text-white rounded-full shadow-2xl transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
          >
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      
      <div className="bg-slate-100/50 px-12 py-8 border-t border-slate-200 flex items-center justify-between">
         <span className="text-[13px] text-slate-700 font-black uppercase tracking-[0.4em]">Dr. HVAC & Plumbing</span>
         <span className="text-[13px] text-slate-700 font-black uppercase tracking-widest">Toronto / GTA</span>
      </div>
    </div>
  );
};

export default DrHVACVoiceAgent;
