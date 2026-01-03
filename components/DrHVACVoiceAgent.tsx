
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
    description: 'Transfer the call to the other specialist with a specific context-driven reason.',
    properties: {
      targetAgent: { 
        type: Type.STRING, 
        enum: ['SARAH', 'MIKE'],
        description: 'The agent to hand over to.' 
      },
      reason: { 
        type: Type.STRING, 
        description: 'The specific technical or service reason for the transfer (e.g. "Urgent furnace failure detected" or "Checking $7,500 rebate eligibility").' 
      }
    },
    required: ['targetAgent', 'reason'],
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
    instruction: "Role: You are Sarah, Reception Specialist for Dr. HVAC. Tone: Warm, professional, helpful. Focus: General inquiries, furnace/AC quotes, and identifying $7,500 rebate eligibility. HANDOVER PROTOCOL: If you detect an emergency (e.g., 'no heat', 'leak', 'smell of gas', 'dangerous noise'), you MUST say: 'This sounds like an urgent technical failure. I am transferring you immediately to Mike, our Emergency Coordinator, so he can prioritize your 4-hour response guarantee.' then call switchAgent(targetAgent='MIKE', reason='Emergency Escalation: Technical System Failure').",
    voice: 'Kore',
    theme: 'bg-[#004a99]',
    accent: 'text-[#f37021]',
  },
  MIKE: {
    name: 'Mike',
    role: 'Emergency Dispatch',
    instruction: "Role: You are Mike, Emergency Dispatcher for Dr. HVAC. Tone: Calm, decisive, urgent. Focus: Handling critical failures. HANDOVER PROTOCOL: If the user is asking about general maintenance, new system quotes, or the $7,500 government rebate, you MUST say: 'I handle our emergency rapid-response dispatch. For energy rebates and new installation estimates, Sarah is our dedicated specialist. Let me connect you with her now to ensure you get the right expert.' then call switchAgent(targetAgent='SARAH', reason='Specialist Transfer: Rebate & Quote Optimization').",
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
  timestamp: string;
}

const DrHVACVoiceAgent: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qualifiedRebate, setQualifiedRebate] = useState<RebateInfo | null>(null);
  const [emergencyBooking, setEmergencyBooking] = useState<EmergencyInfo | null>(null);
  const [isHandingOver, setIsHandingOver] = useState(false);
  
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

  const connectToGemini = async (agentKey: AgentType, isHandover: boolean = false, handoverReason?: string) => {
    try {
      setIsError(false);
      setErrorMessage('');
      setIsHandingOver(isHandover);

      if (!isHandover) {
        setTranscript([]);
        setCurrentInputText('');
        setCurrentOutputText('');
      }

      if (!window.isSecureContext) throw new Error('Secure connection required.');
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone support required.');

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
            setTranscript(prev => [...prev, { 
              sender: 'system', 
              text: isHandover ? `PROTOCOL: ${handoverReason?.toUpperCase() || 'HANDOVER COMPLETE'}` : `SECURE LINE ESTABLISHED: ${agent.name.toUpperCase()}`,
              timestamp: new Date().toLocaleTimeString()
            }]);
          },
          onmessage: async (message: LiveServerMessage) => {
            await handleServerMessage(message, agentKey);
          },
          onclose: () => {
            if (!activeRef.current) return;
            resetConnection();
          },
          onerror: (e) => {
            console.error('Gemini error:', e);
            setIsError(true);
            setErrorMessage('Network connection interrupted.');
            resetConnection();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: agent.instruction,
          tools: [{ functionDeclarations: [updateRebateDisplayDeclaration, confirmEmergencyBookingDeclaration, switchAgentDeclaration] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voice } } }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      setIsError(true);
      setActiveAgent(null);
      setIsHandingOver(false);
      setErrorMessage(err.message || 'Unable to establish secure voice line.');
    }
  };

  const handleHandoverAction = async (targetAgent: AgentType, reason: string) => {
    setTranscript(prev => [...prev, { 
      sender: 'system', 
      text: `HANDOVER LOG: ${reason}`,
      timestamp: new Date().toLocaleTimeString() 
    }]);

    activeRef.current = false;
    sessionPromiseRef.current?.then(s => s.close());
    
    sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    setTimeout(() => {
      connectToGemini(targetAgent, true, reason);
    }, 1200);
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
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (currentInputText) newHistory.push({ sender: 'user', text: currentInputText, timestamp: time });
        if (currentOutputText) newHistory.push({ sender: 'agent', text: currentOutputText, timestamp: time });
        return newHistory;
      });
      setCurrentInputText('');
      setCurrentOutputText('');
    }

    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'switchAgent') {
          const { targetAgent, reason } = fc.args as { targetAgent: AgentType, reason: string };
          handleHandoverAction(targetAgent, reason);
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "Transfer Protocol Initiated." } } }));
        } else if (fc.name === 'updateRebateDisplay') {
          setQualifiedRebate(fc.args as any);
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "Display Updated." } } }));
        } else if (fc.name === 'confirmEmergencyBooking') {
          setEmergencyBooking(fc.args as any);
          sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "Dispatch Confirmed." } } }));
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
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">
      
      {/* STATUS BAR - EXECUTIVE PROFESSIONALISM */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-3 py-3 bg-white border border-slate-100/80 rounded-[2rem] md:rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.04)] animate-slide-up-fade">
         <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
           <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3 bg-[#f0f7ff] rounded-full border border-[#d2e4ff] flex-1 md:flex-none justify-center">
             <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse"></div>
             <span className="text-[11px] md:text-[12px] font-[900] text-[#004a99] uppercase tracking-[0.05em]">AI Assistants Online</span>
           </div>
           <p className="text-slate-500 font-[900] text-[10px] md:text-[11px] uppercase tracking-[0.2em] hidden md:block">Ready to help 24/7</p>
         </div>
         
         <div className="flex items-center gap-4 md:gap-6 pr-0 md:pr-4 w-full md:w-auto justify-center md:justify-end">
           <span className="text-[9px] md:text-[10px] font-[900] text-slate-300 uppercase tracking-[0.2em]">Data Engine</span>
           <div className="flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 bg-[#1a2333] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-all cursor-default">
             <div className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 bg-gradient-to-br from-[#4285f4] via-[#9b72f3] to-[#34a853] rounded-[6px]"></div>
             <span className="text-[10px] md:text-[11px] font-[900] text-white uppercase tracking-tight">Gemini 2.5 Live</span>
           </div>
         </div>
      </div>

      {!isConnected || isHandingOver ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 ${isHandingOver ? 'opacity-30 blur-md pointer-events-none grayscale scale-[0.98]' : ''} transition-all duration-700`}>
          {/* Sarah Selector - Optimized Thumb Target */}
          <button 
            onClick={() => connectToGemini('SARAH')} 
            className="group bg-white rounded-[3rem] border-2 border-slate-100 p-10 md:p-12 text-left transition-all hover:border-[#004a99] hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full active:scale-95 touch-manipulation relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#004a99]/5 rounded-bl-[100%] transition-all group-hover:scale-110"></div>
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#004a99] rounded-[2rem] flex items-center justify-center text-white mb-8 md:mb-10 shadow-xl group-hover:scale-110 transition-transform relative z-10">
              <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-3xl font-[900] text-slate-900 mb-2 relative z-10">Talk to Sarah</h3>
            <p className="text-[#004a99] text-[12px] md:text-[13px] font-[900] uppercase tracking-[0.4em] mb-6 md:mb-8 relative z-10">Rebate Specialist</p>
            <p className="text-slate-600 font-bold leading-relaxed mb-10 md:mb-12 text-xl flex-grow opacity-80 relative z-10">Expert in identifying $7,500 rebates and coordintating furnace quotes.</p>
            <div className="flex items-center gap-5 text-[#f37021] font-[900] uppercase text-[15px] tracking-[0.2em] group-hover:gap-8 transition-all mt-auto relative z-10">
              <span>START CALL</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>

          {/* Mike Selector - Optimized Thumb Target */}
          <button 
            onClick={() => connectToGemini('MIKE')} 
            className="group bg-white rounded-[3rem] border-2 border-slate-100 p-10 md:p-12 text-left transition-all hover:border-red-600 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full active:scale-95 touch-manipulation relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-[100%] transition-all group-hover:scale-110"></div>
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#1a2333] rounded-[2rem] flex items-center justify-center text-white mb-8 md:mb-10 shadow-xl group-hover:scale-110 transition-transform relative z-10">
              <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-3xl font-[900] text-slate-900 mb-2 relative z-10">Talk to Mike</h3>
            <p className="text-red-600 text-[12px] md:text-[13px] font-[900] uppercase tracking-[0.4em] mb-6 md:mb-8 relative z-10">Emergency Dispatch</p>
            <p className="text-slate-600 font-bold leading-relaxed mb-10 md:mb-12 text-xl flex-grow opacity-80 relative z-10">Handling critical failures with our 4-hour response guarantee.</p>
            <div className="flex items-center gap-5 text-red-600 font-[900] uppercase text-[15px] tracking-[0.2em] group-hover:gap-8 transition-all mt-auto relative z-10">
              <span>EMERGENCY LINE</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] md:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.18)] overflow-hidden border-2 border-slate-100 max-w-4xl w-full mx-auto animate-slide-up-fade">
          {/* Active Agent Header */}
          <div className={`${activeAgent ? AGENTS[activeAgent].theme : 'bg-slate-800'} p-8 md:p-16 text-white text-center relative transition-all duration-700 shadow-inner`}>
            <div className="w-20 h-20 md:w-32 md:h-32 bg-white/10 backdrop-blur-3xl rounded-3xl md:rounded-[3rem] mx-auto flex items-center justify-center mb-6 md:mb-10 border-2 border-white/20 shadow-2xl">
               <svg className="w-10 h-10 md:w-14 md:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {activeAgent === 'SARAH' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  )}
               </svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-[900] mb-2 md:mb-3 uppercase tracking-tighter">Connected to {activeAgent && AGENTS[activeAgent].name}</h2>
            <p className="text-white/60 text-[12px] md:text-[16px] font-[900] uppercase tracking-[0.4em] md:tracking-[0.6em]">{activeAgent && AGENTS[activeAgent].role}</p>
          </div>

          <div className="p-6 md:p-16 space-y-8 md:space-y-12">
            {/* Visual Feedback Area */}
            <div className="w-full min-h-[60px] md:min-h-[100px] flex flex-col gap-4 md:gap-6">
              {qualifiedRebate && (
                <div className="dashed-card p-6 md:p-10 flex flex-col sm:flex-row items-center justify-between animate-slide-up-fade bg-blue-50/40 border-2 border-blue-100/50 gap-6">
                   <div className="flex items-center gap-6 md:gap-10">
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-[#f37021] rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl">
                       <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                       <p className="text-[11px] md:text-[14px] text-black/40 font-[900] uppercase tracking-widest mb-1">Rebate Qualification</p>
                       <p className="text-3xl md:text-5xl font-[900] text-black tracking-tighter">${qualifiedRebate.amount.toLocaleString()}</p>
                     </div>
                   </div>
                   <span className="px-5 py-2 md:px-6 md:py-2.5 bg-blue-100 text-[#004a99] text-[12px] md:text-[14px] font-[900] rounded-xl md:rounded-2xl uppercase tracking-widest w-full sm:w-auto text-center">{qualifiedRebate.sourceType}</span>
                </div>
              )}

              {emergencyBooking && (
                <div className="dashed-card p-6 md:p-10 flex flex-col sm:flex-row items-center justify-between animate-slide-up-fade bg-red-50 border-2 border-red-100 gap-6">
                   <div className="flex items-center gap-6 md:gap-10">
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl">
                       <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     <div>
                       <p className="text-[11px] md:text-[14px] text-red-800/50 font-[900] uppercase tracking-widest mb-1">Priority Dispatch</p>
                       <p className="text-xl md:text-3xl font-[900] text-black tracking-tight">{emergencyBooking.issue}</p>
                     </div>
                   </div>
                   <p className="text-[14px] md:text-[16px] font-[900] text-white bg-red-700 px-5 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-2xl uppercase tracking-widest w-full sm:w-auto text-center">{emergencyBooking.guaranteeTime}</p>
                </div>
              )}
            </div>

            {/* LIVE TRANSCRIPT WINDOW */}
            <div className="bg-[#fcfdfe] rounded-[2rem] md:rounded-[3.5rem] border-2 border-slate-100 p-6 md:p-10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.02)]">
               <div className="flex items-center justify-between mb-6 md:mb-8 px-2 md:px-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-[10px] md:text-[12px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Real-Time Session Logs</p>
                  </div>
               </div>
               
               <div className="h-[240px] md:h-[320px] overflow-y-auto px-1 md:px-4 space-y-6 md:space-y-8 scrollbar-hide flex flex-col">
                  {transcript.map((msg, i) => (
                    msg.sender === 'system' ? (
                      <div key={i} className="flex justify-center py-4 md:py-6 animate-slide-up-fade">
                         <div className="px-6 md:px-10 py-2 md:py-3 bg-[#1a2333] text-white rounded-full border border-white/10 text-[9px] md:text-[11px] font-[900] uppercase tracking-[0.2em] md:tracking-[0.25em] shadow-2xl flex items-center gap-3 md:gap-4 text-center">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></span>
                            {msg.text}
                         </div>
                      </div>
                    ) : (
                      <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start animate-slide-up-fade'}`}>
                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 px-1 md:px-2">
                           <span className={`text-[9px] md:text-[10px] font-[900] uppercase tracking-widest ${msg.sender === 'user' ? 'text-slate-400' : 'text-[#004a99]'}`}>
                              {msg.sender === 'user' ? 'Client' : (activeAgent && AGENTS[activeAgent].name)}
                           </span>
                           <span className="text-[8px] md:text-[9px] font-bold text-slate-300">{msg.timestamp}</span>
                        </div>
                        <div className={`max-w-[90%] md:max-w-[80%] px-5 md:px-8 py-3.5 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-bold text-[14px] md:text-[16px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-white border-2 border-slate-100 text-slate-700 rounded-tr-none' : 'bg-[#1a2333] text-white rounded-tl-none shadow-xl'}`}>
                            {msg.text}
                        </div>
                      </div>
                    )
                  ))}
                  <div ref={transcriptEndRef} />
               </div>
            </div>

            <Visualizer isActive={isConnected} audioContext={inputAudioContextRef.current} sourceNode={inputSourceRef.current} />

            <div className="flex flex-col items-center gap-6 md:gap-10">
              <button onClick={handleDisconnect} className="flex items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-black text-white rounded-full shadow-2xl transition-all hover:bg-red-700 hover:scale-110 active:scale-95 group touch-manipulation">
                 <svg className="w-12 h-12 md:w-14 md:h-14 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrHVACVoiceAgent;
