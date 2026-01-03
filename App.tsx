import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fcfdfe] py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden">
      
      {/* Aesthetic Background Detail */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-50/50 rounded-full blur-[120px]"></div>

      {/* Header / Branding */}
      <div className="max-w-3xl w-full text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-3 leading-none">
          Dr. HVAC<span className="text-blue-600">.</span>
        </h1>
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
          2026 Energy Savings & Rebate Center
        </p>
        
        <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-blue-700 rounded-full text-[11px] font-black border border-slate-100 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Live Assistant Sarah is Online
        </div>
      </div>

      {/* Main Interface */}
      <div className="w-full relative z-10">
        <DrHVACVoiceAgent />
      </div>

      {/* Trust Badges */}
      <div className="max-w-lg w-full mt-12 grid grid-cols-2 gap-6 relative z-10">
         <div className="flex flex-col items-center text-center">
            <div className="text-slate-900 font-black text-xl mb-1">$7,500</div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Max Program Rebate</p>
         </div>
         <div className="flex flex-col items-center text-center border-l border-slate-200">
            <div className="text-slate-900 font-black text-xl mb-1">4 Hours</div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Emergency Window</p>
         </div>
      </div>

    </div>
  );
};

export default App;