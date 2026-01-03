
import React, { useState, useEffect, useRef } from 'react';
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
      amount: { type: Type.NUMBER, description: 'The rebate amount in dollars.' },
      sourceType: { type: Type.STRING, description: 'The customer heating source (Gas, Oil, or Electric).' },
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
      issue: { type: Type.STRING, description: 'Brief description of the HVAC issue.' },
      guaranteeTime: { type: Type.STRING, description: 'The promised response window (4 hours).' },
    },
    required: ['issue', 'guaranteeTime'],
  },
};

type AgentType = 'SARAH' | 'MIKE';

interface AgentConfig {
  name: string;
  role: string;
  instruction: string;
  voice: string;
  theme: string;
  accent: string;
}

const AGENTS: Record<AgentType, AgentConfig> = {
  SARAH: {
    name: 'Sarah',
    role: 'Reception Specialist',
    instruction: "Role: You are Sarah, Reception Specialist for Dr. HVAC. Tone: Warm, professional, helpful. Focus: General inquiries, furnace/AC quotes, and identifying $7,500 rebate eligibility.",
    voice: 'Kore',
    theme: 'bg-[#004a99]',
    accent: 'text-[#f37021]',
  },
  MIKE: {
    name: 'Mike',
    role: 'Emergency Dispatch',
    instruction: "Role: You are Mike, Emergency Dispatcher for Dr. HVAC. Tone: Calm, decisive, urgent. Focus: Handling critical failures (no heat in winter, leaks). Emphasize the 4-hour response guarantee.",
    voice: 'Puck',
    theme: 'bg-[#1a2333]',
    accent: 'text-red-500',
  }
};

interface RebateInfo { amount: number; sourceType: string; }
interface EmergencyInfo { issue: string; guaranteeTime: string; }

const DrHVACVoiceAgent: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
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
    // We create them with basic settings first to avoid constructor-level hardware rejection
    if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
    if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
  };

  const connectToGemini = async (agentKey: AgentType) => {
    try {
      setIsError(false);
      setErrorMessage('');

      // Check for mediaDevices support explicitly
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser environment. Please use a modern browser (Chrome, Edge, Safari) over HTTPS.');
      }

      // Try to list devices first to see if any exist (doesn't require permission yet)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');
      
      if (!hasAudioInput && devices.length > 0) {
         // Some browsers don't show kind until permission is granted, but if devices.length > 0 we can proceed
      }

      setActiveAgent(agentKey);
      
      // Requesting audio with minimal constraints. 
      // If {audio: true} fails, the hardware or OS is likely blocking the request.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      initAudioContexts();
      
      const agent = AGENTS[agentKey];
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
          onclose: () => resetConnection(),
          onerror: (e) => {
            console.error('Gemini Live error:', e);
            setIsError(true);
            setErrorMessage('Network connection lost. Please try again.');
            resetConnection();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: agent.instruction,
          tools: [{ functionDeclarations: [updateRebateDisplayDeclaration, confirmEmergencyBookingDeclaration] }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voice } }
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error('Mic/Connection Error:', err);
      setIsError(true);
      setActiveAgent(null);
      
      // Map specific browser error names to human-friendly advice
      const errorName = err.name || '';
      const lowerMsg = (err.message || '').toLowerCase();

      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError' || lowerMsg.includes('not found')) {
        setErrorMessage('Requested Device Not Found. Please plug in a microphone or headset and try again.');
      } else if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || lowerMsg.includes('permission')) {
        setErrorMessage('Microphone access denied. Please click the "lock" icon in your URL bar and allow microphone access.');
      } else if (errorName === 'OverconstrainedError') {
        setErrorMessage('Your microphone does not support the required settings. Please try a different device.');
      } else {
        setErrorMessage(err.message || 'Unable to start the session. Please check your microphone settings.');
      }
    }
  };

  const resetConnection = () => {
    setIsConnected(false);
    activeRef.current = false;
    stopAudio();
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
      sourcesRef.current.add(source);
      source.onended = () => sourcesRef.current.delete(source);
    }

    if (message.serverContent?.interrupted) {
      sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
      sourcesRef.current.clear();
      nextStartTimeRef.current = 0;
    }
  };

  const stopAudio = () => {
    processorRef.current?.disconnect();
    inputSourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleDisconnect = () => {
    sessionPromiseRef.current?.then(s => s.close());
    resetConnection();
    setActiveAgent(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-12">
      
      {!isConnected ? (
        <div className="grid md:grid-cols-2 gap-8 animate-slide-up-fade">
          {/* Sarah Selector */}
          <button 
            onClick={() => connectToGemini('SARAH')}
            className="group bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 text-left transition-all hover:border-[#004a99] hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-[#004a99] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Speak to Sarah</h3>
            <p className="text-[#004a99] text-[11px] font-black uppercase tracking-[0.3em] mb-4">Reception Specialist</p>
            <p className="text-slate-600 font-medium leading-relaxed mb-8 flex-grow">
              Expert in new installations, general quotes, and 2026 Energy Savings rebates up to $7,500.
            </p>
            <div className="flex items-center gap-3 text-[#f37021] font-black uppercase text-[12px] tracking-widest">
              <span>Start Conversation</span>
              <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>

          {/* Mike Selector */}
          <button 
            onClick={() => connectToGemini('MIKE')}
            className="group bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 text-left transition-all hover:border-red-600 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-[#1a2333] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Speak to Mike</h3>
            <p className="text-red-600 text-[11px] font-black uppercase tracking-[0.3em] mb-4">Emergency Dispatch</p>
            <p className="text-slate-600 font-medium leading-relaxed mb-8 flex-grow">
              Handling urgent repairs with our 4-hour response guarantee. No heat? Leaking pipes? Talk to Mike.
            </p>
            <div className="flex items-center gap-3 text-red-600 font-black uppercase text-[12px] tracking-widest">
              <span>Priority Dispatch</span>
              <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.12)] overflow-hidden border-2 border-slate-100 max-w-2xl w-full mx-auto animate-slide-up-fade">
          {/* Active Agent Header */}
          <div className={`${activeAgent ? AGENTS[activeAgent].theme : 'bg-slate-800'} p-10 text-white text-center relative`}>
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full mx-auto flex items-center justify-center mb-6 border-2 border-white/20">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {activeAgent === 'SARAH' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  )}
               </svg>
            </div>
            <h2 className="text-3xl font-black mb-1 uppercase tracking-tight">Talking to {activeAgent && AGENTS[activeAgent].name}</h2>
            <p className="text-white/60 text-[12px] font-black uppercase tracking-[0.4em]">{activeAgent && AGENTS[activeAgent].role}</p>
          </div>

          <div className="p-10 space-y-8">
            {/* Visual Feedback Area */}
            <div className="w-full min-h-[100px] flex flex-col gap-4">
              {qualifiedRebate && activeAgent === 'SARAH' && (
                <div className="dashed-card p-6 flex items-center justify-between animate-slide-up-fade bg-blue-50/50 border-2 border-blue-100">
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-[#f37021] rounded-full flex items-center justify-center text-white shadow-lg">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                       <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Rebate Qualification</p>
                       <p className="text-3xl font-black text-black tracking-tighter">${qualifiedRebate.amount.toLocaleString()}</p>
                     </div>
                   </div>
                   <span className="px-3 py-1 bg-blue-100 text-[#004a99] text-[11px] font-black rounded-lg uppercase tracking-widest">{qualifiedRebate.sourceType}</span>
                </div>
              )}

              {emergencyBooking && (
                <div className="dashed-card p-6 flex items-center justify-between animate-slide-up-fade bg-red-50 border-2 border-red-100">
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     <div>
                       <p className="text-[10px] text-red-800/50 font-black uppercase tracking-widest">Priority Dispatch</p>
                       <p className="text-lg font-black text-black tracking-tight">{emergencyBooking.issue}</p>
                     </div>
                   </div>
                   <p className="text-[12px] font-black text-white bg-red-700 px-3 py-1 rounded-lg uppercase tracking-widest">{emergencyBooking.guaranteeTime}</p>
                </div>
              )}
            </div>

            <Visualizer 
              isActive={isConnected} 
              audioContext={inputAudioContextRef.current}
              sourceNode={inputSourceRef.current}
            />

            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-3">
                 <span className={`w-3 h-3 rounded-full animate-pulse ${activeAgent === 'MIKE' ? 'bg-red-500' : 'bg-[#f37021]'}`}></span>
                 <p className={`${activeAgent === 'MIKE' ? 'text-red-600' : 'text-[#f37021]'} text-[13px] font-black uppercase tracking-[0.4em]`}>Conversation Live</p>
              </div>

              <button
                onClick={handleDisconnect}
                className="flex items-center justify-center w-24 h-24 bg-black text-white rounded-full shadow-2xl transition-all hover:bg-red-700 hover:scale-110 active:scale-95 group"
              >
                 <svg className="w-10 h-10 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex items-center justify-between">
             <span className="text-[10px] text-black/40 font-black uppercase tracking-[0.4em]">Dr. HVAC Secure Line</span>
             <span className="text-[10px] text-black/40 font-black uppercase tracking-[0.2em]">Toronto & GTA</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="max-w-md mx-auto bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] text-center shadow-xl animate-slide-up-fade">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-red-800 font-black text-[13px] uppercase tracking-widest leading-relaxed mb-6">{errorMessage}</p>
          <button 
            onClick={() => setIsError(false)} 
            className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border-b-2 border-slate-200 transition-all"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default DrHVACVoiceAgent;
