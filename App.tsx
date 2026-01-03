import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      
      {/* Official Top Bar */}
      <div className="w-full bg-[#1a2333] py-2 px-4 flex justify-center border-b border-white/5">
        <div className="max-w-6xl w-full flex justify-between items-center text-[10px] font-bold text-white/90 uppercase tracking-widest">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-[#f37021]">
                <span>★★★★★</span>
                <span className="text-white">2,277 Google Reviews</span>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <span className="opacity-60 font-medium">Call Anytime:</span>
             <span className="text-[#f37021]">289-498-4082</span>
           </div>
        </div>
      </div>

      <div className="w-full max-w-6xl px-4 py-8 flex flex-col items-center">
        {/* Logo Branding */}
        <div className="w-full flex justify-between items-center mb-16">
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#f37021] rounded-lg flex items-center justify-center text-white font-black text-lg">Dr</div>
              <div className="leading-tight">
                <p className="text-xl font-black text-[#004a99] tracking-tighter uppercase">HVAC & PLUMBING</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Since 1985</p>
              </div>
           </div>
           <nav className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
             <a href="#" className="hover:text-[#f37021]">Heating</a>
             <a href="#" className="hover:text-[#f37021]">Cooling</a>
             <a href="#" className="hover:text-[#f37021]">Rebates</a>
             <button className="bg-[#f37021] text-white px-5 py-2.5 rounded-lg shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all">Get Quote</button>
           </nav>
        </div>

        <div className="text-center mb-12 animate-slide-up-fade">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4">Toronto Specials & Rebates</p>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-[0.9]">
             Claim Your 2026<br/>
             <span className="text-[#004a99]">Energy Savings.</span>
           </h1>
           <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
             Our AI specialist Sarah is online to help you qualify for the $7,500 HRS program or handle priority emergency dispatching.
           </p>
        </div>

        <DrHVACVoiceAgent />

        {/* Trust Logos - Matching Website */}
        <div className="w-full max-w-xl mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex flex-col items-center">
              <span className="text-lg font-black tracking-tighter">HomeStars</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Best of Award</span>
           </div>
           <div className="flex flex-col items-center border-x border-slate-200 px-8">
              <span className="text-lg font-black tracking-tighter">BBB.</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Accredited A+</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-lg font-black tracking-tighter">100%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Guaranteed</span>
           </div>
        </div>

        <FAQSection />

        <div className="py-24"></div>
      </div>
    </div>
  );
};

export default App;