
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

const switchAgentDeclaration: FunctionDeclaration = {
  name: 'switchAgent',
  parameters: {
    type: Type.OBJECT,
    description: 'Transfer the call to the other specialist (e.g., Sarah to Mike for emergencies, or Mike to Sarah for rebates).',
    properties: {
      targetAgent: { 
        type: Type.STRING, 
        enum: ['SARAH', 'MIKE'],
        description: 'The agent to hand over to.' 
      },
      reason: { type: Type.STRING, description: 'Brief reason for the handover.' }
    },
    required: ['targetAgent'],
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
    instruction: "Role: You are Sarah, Reception Specialist for Dr. HVAC. Tone: Warm, professional, helpful. Focus: General inquiries, furnace/AC quotes, and identifying $7,500 rebate eligibility. HANDOVER PROTOCOL: If the user has an emergency (leaks, no heat, urgent repair), tell them 'I'm handing you over to Mike, our emergency coordinator' and call switchAgent(targetAgent='MIKE').",
    voice: 'Kore',
    theme: 'bg-[#004a99]',
    accent: 'text-[#f37021]',
  },
  MIKE: {
    name: 'Mike',
    role: 'Emergency Dispatch',
    instruction: "Role: You are Mike, Emergency Dispatcher for Dr. HVAC. Tone: Calm, decisive, urgent. Focus: Handling critical failures (no heat in winter, leaks). Emphasize the 4-hour response guarantee. HANDOVER PROTOCOL: If the user wants a general quote or to check if they qualify for the $7,500 energy rebate, tell them 'Sarah is our rebate specialist, let me connect you with her' and call switchAgent(targetAgent='SARAH').",
    voice: 'Puck',
    theme: 'bg-[#1a2333]',
    accent: 'text-red-500',
  }
};

interface RebateInfo { amount: number; sourceType: string; }
interface EmergencyInfo { issue: string; guaranteeTime: string; }

interface TranscriptMessage {
  sender: 'user' | 'agent' | 'system';
  text: string;
}

const DrHVACVoiceAgent: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qualifiedRebate, setQualifiedRebate] = useState<RebateInfo | null>(null);
  const [emergencyBooking, setEmergencyBooking] = useState<EmergencyInfo | null>(null);
  const [isHandingOver, setIsHandingOver] = useState(false);
  
  // Transcription state
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [currentInputText, setCurrentInputText] = useState('');
  const [currentOutputText, setCurrentOutputText] = useState('');
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, currentInputText, currentOutputText]);

  const initAudioContexts = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
    if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
  };

  const connectToGemini = async (agentKey: AgentType, isHandover: boolean = false) => {
    try {
      setIsError(false);
      setErrorMessage('');
      setIsHandingOver(isHandover);

      // Clean start if not handover
      if (!isHandover) {
        setTranscript([]);
        setCurrentInputText('');
        setCurrentOutputText('');
      } else {
        setTranscript(prev => [...prev, { sender: 'system', text: `Handing over to ${AGENTS[agentKey].name}...` }]);
      }

      if (!window.isSecureContext) {
        throw new Error('Microphone access requires a secure connection (HTTPS).');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access.');
      }

      setActiveAgent(agentKey);
      
      const stream = mediaStreamRef.current || await navigator.mediaDevices.getUserMedia({ audio: true });
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
            setIsHandingOver(false);
            startAudioInput(stream);
          },
          onmessage: async (message: LiveServerMessage) => {
            await handleServerMessage(message, agentKey);
          },
          onclose: () => {
            if (!activeRef.current) return;
            resetConnection();
          },
          onerror: (e) => {
            console.error('Gemini Live error:', e);
            setIsError(true);
            setErrorMessage('Network connection lost.');
            resetConnection();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: agent.instruction,
          tools: [{ 
            functionDeclarations: [
              updateRebateDisplayDeclaration, 
              confirmEmergencyBookingDeclaration,
              switchAgentDeclaration
            ] 
          }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voice } }
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error('Mic Access Error:', err);
      setIsError(true);
      setActiveAgent(null);
      setIsHandingOver(false);
      setErrorMessage(err.message || 'Unable to start session.');
    }
  };

  const handleHandover = async (targetAgent: AgentType) => {
    // Gracefully stop current session
    activeRef.current = false;
    sessionPromiseRef.current?.then(s => s.close());
    
    // Stop output audio sources
    sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Small delay for UI smoothness
    setTimeout(() => {
      connectToGemini(targetAgent, true);
    }, 800);
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

  const handleServerMessage = async (message: LiveServerMessage, currentAgentKey: AgentType) => {
    if (message.serverContent?.inputTranscription) {
      setCurrentInputText(prev => prev + (message.serverContent?.inputTranscription?.text || ''));
    } else if (message.serverContent?.outputTranscription) {
      setCurrentOutputText(prev => prev + (message.serverContent?.outputTranscription?.text || ''));
    }

    if (message.serverContent?.turnComplete) {
      setTranscript(prev => {
        const newHistory = [...prev];
        if (currentInputText) newHistory.push({ sender: 'user', text: currentInputText });
        if (currentOutputText) newHistory.push({ sender: 'agent', text: currentOutputText });
        return newHistory;
      });
      setCurrentInputText('');
      setCurrentOutputText('');
    }

    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'switchAgent') {
          const { targetAgent } = fc.args as { targetAgent: AgentType };
          if (targetAgent !== currentAgentKey) {
            handleHandover(targetAgent);
          }
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "Transfer initiated." } } }));
        } else if (fc.name === 'updateRebateDisplay') {
          setQualifiedRebate(fc.args as any);
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "OK" } } }));
        } else if (fc.name === 'confirmEmergencyBooking') {
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
    mediaStreamRef.current = null;
  };

  const handleDisconnect = () => {
    sessionPromiseRef.current?.then(s => s.close());
    resetConnection();
    setActiveAgent(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-12">
      
      {/* BOLDER, REFINED PROFESSIONAL STATUS BAR (Exact Replica of Reference Image) */}
      <div className="flex flex-row items-center justify-between gap-4 px-3 py-3 bg-white border border-slate-100/80 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.04)] animate-slide-up-fade">
         <div className="flex items-center gap-4">
           {/* LEFT PILL */}
           <div className="flex items-center gap-3 px-6 py-3 bg-[#f0f7ff] rounded-full border border-[#d2e4ff]">
             <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
             <span className="text-[11px] font-[900] text-[#004a99] uppercase tracking-[0.05em]">AI Assistants Online</span>
           </div>
           {/* CENTER TEXT */}
           <p className="text-[#94a3b8] font-[900] text-[11px] uppercase tracking-[0.12em] hidden md:block">Ready to help 24/7</p>
         </div>
         
         <div className="flex items-center gap-5 pr-3">
           {/* POWERED BY TEXT */}
           <span className="text-[10px] font-[900] text-[#cbd5e1] uppercase tracking-[0.1em]">Powered by</span>
           {/* RIGHT LOGO PILL */}
           <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1a2333] rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-transform hover:scale-105 active:scale-95 cursor-default">
             <div className="w-4.5 h-4.5 bg-gradient-to-br from-[#4285f4] via-[#9b72f3] to-[#34a853] rounded-[5px] shadow-sm"></div>
             <span className="text-[10px] font-[900] text-white uppercase tracking-tight">Gemini 2.5 Live</span>
           </div>
         </div>
      </div>

      {!isConnected || isHandingOver ? (
        <div className={`grid md:grid-cols-2 gap-8 ${isHandingOver ? 'opacity-30 blur-sm pointer-events-none grayscale' : ''} transition-all duration-700`}>
          {/* Sarah Selector */}
          <button 
            onClick={() => connectToGemini('SARAH')}
            className="group bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 text-left transition-all hover:border-[#004a99] hover:shadow-[0_60px_100px_-20px_rgba(0,74,153,0.12)] hover:-translate-y-2 flex flex-col h-full"
          >
            <div className="w-24 h-24 bg-[#004a99] rounded-[2rem] flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 transition-transform">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-3xl font-[900] text-slate-900 mb-2">Talk to Sarah</h3>
            <p className="text-[#004a99] text-[13px] font-[900] uppercase tracking-[0.4em] mb-8">Rebate & Quotes Specialist</p>
            <p className="text-slate-600 font-bold leading-relaxed mb-12 text-xl flex-grow opacity-80">
              Expert in identifying $7,500 rebates, furnace quotes, and scheduling home audits.
            </p>
            <div className="flex items-center gap-5 text-[#f37021] font-[900] uppercase text-[15px] tracking-widest group-hover:gap-8 transition-all">
              <span>Start Conversation</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>

          {/* Mike Selector */}
          <button 
            onClick={() => connectToGemini('MIKE')}
            className="group bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 text-left transition-all hover:border-red-600 hover:shadow-[0_60px_100px_-20px_rgba(220,38,38,0.12)] hover:-translate-y-2 flex flex-col h-full"
          >
            <div className="w-24 h-24 bg-[#1a2333] rounded-[2rem] flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 transition-transform">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-3xl font-[900] text-slate-900 mb-2">Talk to Mike</h3>
            <p className="text-red-600 text-[13px] font-[900] uppercase tracking-[0.4em] mb-8">Emergency Dispatcher</p>
            <p className="text-slate-600 font-bold leading-relaxed mb-12 text-xl flex-grow opacity-80">
              Available 24/7 for critical failures. Emphasize our 4-hour response guarantee.
            </p>
            <div className="flex items-center gap-5 text-red-600 font-[900] uppercase text-[15px] tracking-widest group-hover:gap-8 transition-all">
              <span>Priority Dispatch</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.18)] overflow-hidden border-2 border-slate-100 max-w-4xl w-full mx-auto animate-slide-up-fade">
          {/* Active Agent Header */}
          <div className={`${activeAgent ? AGENTS[activeAgent].theme : 'bg-slate-800'} p-16 text-white text-center relative transition-all duration-700`}>
            <div className="w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-[3rem] mx-auto flex items-center justify-center mb-10 border-2 border-white/20 shadow-2xl">
               <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {activeAgent === 'SARAH' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  )}
               </svg>
            </div>
            <h2 className="text-5xl font-[900] mb-3 uppercase tracking-tighter">Talking to {activeAgent && AGENTS[activeAgent].name}</h2>
            <p className="text-white/60 text-[16px] font-[900] uppercase tracking-[0.6em]">{activeAgent && AGENTS[activeAgent].role}</p>
          </div>

          <div className="p-16 space-y-12">
            {/* Visual Feedback Area */}
            <div className="w-full min-h-[100px] flex flex-col gap-6">
              {qualifiedRebate && (
                <div className="dashed-card p-10 flex items-center justify-between animate-slide-up-fade bg-blue-50/40 border-2 border-blue-100/50">
                   <div className="flex items-center gap-10">
                     <div className="w-20 h-20 bg-[#f37021] rounded-3xl flex items-center justify-center text-white shadow-2xl">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                       <p className="text-[14px] text-black/40 font-[900] uppercase tracking-widest mb-1">Rebate Qualification</p>
                       <p className="text-5xl font-[900] text-black tracking-tighter">${qualifiedRebate.amount.toLocaleString()}</p>
                     </div>
                   </div>
                   <span className="px-6 py-2.5 bg-blue-100 text-[#004a99] text-[14px] font-[900] rounded-2xl uppercase tracking-widest">{qualifiedRebate.sourceType}</span>
                </div>
              )}

              {emergencyBooking && (
                <div className="dashed-card p-10 flex items-center justify-between animate-slide-up-fade bg-red-50 border-2 border-red-100">
                   <div className="flex items-center gap-10">
                     <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     <div>
                       <p className="text-[14px] text-red-800/50 font-[900] uppercase tracking-widest mb-1">Priority Dispatch</p>
                       <p className="text-3xl font-[900] text-black tracking-tight">{emergencyBooking.issue}</p>
                     </div>
                   </div>
                   <p className="text-[16px] font-[900] text-white bg-red-700 px-6 py-2.5 rounded-2xl uppercase tracking-widest">{emergencyBooking.guaranteeTime}</p>
                </div>
              )}
            </div>

            {/* LIVE TRANSCRIPT WINDOW */}
            <div className="bg-slate-50/80 backdrop-blur-md rounded-[3rem] border-2 border-slate-100 p-8 shadow-inner">
               <div className="flex items-center justify-between mb-6 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-[12px] font-[900] text-slate-400 uppercase tracking-widest">Live Transcript Window</p>
                  </div>
                  <span className="text-[10px] font-[900] text-slate-300 uppercase tracking-[0.3em]">Data Capture Active</span>
               </div>
               
               <div className="h-[250px] overflow-y-auto px-4 space-y-6 scrollbar-hide flex flex-col">
                  {transcript.map((msg, i) => (
                    msg.sender === 'system' ? (
                      <div key={i} className="flex justify-center py-4">
                         <div className="px-6 py-2 bg-slate-200/50 rounded-full border border-slate-300/50 text-[10px] font-[900] text-slate-500 uppercase tracking-widest">
                            {msg.text}
                         </div>
                      </div>
                    ) : (
                      <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start animate-slide-up-fade'}`}>
                        <span className={`text-[10px] font-[900] uppercase tracking-widest mb-2 ${msg.sender === 'user' ? 'text-slate-400' : 'text-blue-500'}`}>
                          {msg.sender === 'user' ? 'You' : (activeAgent && AGENTS[activeAgent].name)}
                        </span>
                        <div className={`max-w-[85%] px-6 py-4 rounded-3xl font-bold text-[15px] leading-relaxed ${msg.sender === 'user' ? 'bg-white border-2 border-slate-100 text-slate-700 rounded-tr-none' : 'bg-[#1a2333] text-white rounded-tl-none shadow-xl shadow-slate-900/10'}`}>
                            {msg.text}
                        </div>
                      </div>
                    )
                  ))}
                  
                  {/* Streaming Input */}
                  {currentInputText && (
                    <div className="flex flex-col items-end animate-pulse">
                       <span className="text-[10px] font-[900] uppercase tracking-widest mb-2 text-slate-300">Speaking...</span>
                       <div className="max-w-[85%] px-6 py-4 bg-white/50 border-2 border-slate-100 border-dashed rounded-3xl rounded-tr-none font-bold text-[15px] text-slate-400">
                          {currentInputText}
                       </div>
                    </div>
                  )}

                  {/* Streaming Output */}
                  {currentOutputText && (
                    <div className="flex flex-col items-start animate-pulse">
                       <span className="text-[10px] font-[900] uppercase tracking-widest mb-2 text-blue-300">Responding...</span>
                       <div className="max-w-[85%] px-6 py-4 bg-blue-50 border-2 border-blue-100 border-dashed rounded-3xl rounded-tl-none font-bold text-[15px] text-blue-600">
                          {currentOutputText}
                       </div>
                    </div>
                  )}

                  {!transcript.length && !currentInputText && !currentOutputText && (
                    <div className="h-full flex items-center justify-center">
                       <p className="text-slate-300 font-[900] text-sm tracking-widest uppercase text-center max-w-[200px] leading-relaxed opacity-60">
                         Start speaking to see real-time data capture
                       </p>
                    </div>
                  )}
                  <div ref={transcriptEndRef} />
               </div>
            </div>

            <Visualizer 
              isActive={isConnected} 
              audioContext={inputAudioContextRef.current}
              sourceNode={inputSourceRef.current}
            />

            <div className="flex flex-col items-center gap-10">
              <div className="flex items-center gap-5">
                 <span className={`w-5 h-5 rounded-full animate-pulse ${activeAgent === 'MIKE' ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)]' : 'bg-[#f37021] shadow-[0_0_25px_rgba(243,112,33,0.7)]'}`}></span>
                 <p className={`${activeAgent === 'MIKE' ? 'text-red-600' : 'text-[#f37021]'} text-[16px] font-[900] uppercase tracking-[0.6em]`}>Conversation Live</p>
              </div>

              <button
                onClick={handleDisconnect}
                className="flex items-center justify-center w-32 h-32 bg-black text-white rounded-full shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] transition-all hover:bg-red-700 hover:scale-110 active:scale-95 group"
              >
                 <svg className="w-14 h-14 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          <div className="bg-slate-50 px-16 py-10 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
               <span className="text-[13px] text-black/40 font-[900] uppercase tracking-[0.6em]">Secure AI Line 082</span>
             </div>
             <span className="text-[13px] text-black/40 font-[900] uppercase tracking-[0.4em]">Official Dr. HVAC Support</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="max-w-md mx-auto bg-white border-2 border-red-100 p-12 rounded-[5rem] text-center shadow-2xl animate-slide-up-fade">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-slate-900 font-[900] text-2xl tracking-tight mb-4 uppercase">System Interrupt</p>
          <p className="text-slate-500 font-bold text-lg leading-relaxed mb-10">{errorMessage}</p>
          <button 
            onClick={() => setIsError(false)} 
            className="w-full py-6 bg-slate-900 hover:bg-black rounded-3xl text-[14px] font-[900] uppercase tracking-widest text-white transition-all shadow-xl shadow-slate-900/20"
          >
            Restart Session
          </button>
        </div>
      )}
    </div>
  );
};

export default DrHVACVoiceAgent;
