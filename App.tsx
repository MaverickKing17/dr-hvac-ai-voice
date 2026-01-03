
import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      if (id === 'sarah-agent') {
        element.classList.add('ring-[12px]', 'ring-orange-500/10');
        setTimeout(() => element.classList.remove('ring-[12px]', 'ring-orange-500/10'), 1500);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafd]">
      
      {/* High-Contrast Top Bar */}
      <div className="w-full bg-[#1a2333] py-4 px-6 flex justify-center border-b-4 border-[#f37021]">
        <div className="max-w-7xl w-full flex justify-between items-center text-[14px] font-black text-white uppercase tracking-[0.2em]">
           <div className="flex items-center gap-10">
             <div className="flex items-center gap-3 text-[#f37021]">
                <span className="text-xl">★★★★★</span>
                <span className="text-white border-b-2 border-[#f37021]/30 pb-1">2,277 GOOGLE REVIEWS</span>
             </div>
             <div className="hidden md:flex items-center gap-3 text-white/40">
                <div className="w-2 h-2 rounded-full bg-[#f37021]"></div>
                <span>TORONTO'S #1 HVAC EXPERTS</span>
             </div>
           </div>
           <div className="flex items-center gap-6">
             <span className="text-white/60 font-black">EMERGENCY LINE:</span>
             <a href="tel:2894984082" className="text-[#f37021] hover:text-white transition-all font-black text-2xl tracking-tighter">289-498-4082</a>
           </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-8 py-16 flex flex-col items-center">
        {/* Logo & Navigation */}
        <div className="w-full flex justify-between items-center mb-28">
           <div 
             className="flex items-center gap-5 cursor-pointer group" 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           >
              <div className="w-16 h-16 bg-[#f37021] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-orange-500/40 group-hover:scale-110 transition-all">Dr</div>
              <div className="leading-none">
                <p className="text-4xl font-black text-[#004a99] tracking-tighter uppercase leading-[0.8]">HVAC & PLUMBING</p>
                <p className="text-[12px] font-black text-black/40 uppercase tracking-[0.5em] mt-2">TORONTO & GTA OFFICIAL SERVICE</p>
              </div>
           </div>
           
           <nav className="hidden lg:flex items-center gap-12 text-[15px] font-black uppercase tracking-widest text-[#004a99]">
             <button className="hover:text-[#f37021] transition-all">Service Area</button>
             <button className="hover:text-[#f37021] transition-all">Reviews</button>
             <button 
               onClick={() => scrollToSection('sarah-agent')}
               className="bg-[#f37021] text-white px-12 py-6 rounded-2xl shadow-[0_25px_50px_-12px_rgba(243,112,33,0.5)] transform hover:-translate-y-2 active:translate-y-0 transition-all font-black text-[16px] uppercase tracking-widest"
             >
               BOOK A SPECIALIST
             </button>
           </nav>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-24 animate-slide-up-fade">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-50 rounded-full mb-10 border border-orange-100">
              <span className="w-2 h-2 rounded-full bg-[#f37021] animate-pulse"></span>
              <p className="text-[13px] text-[#f37021] font-black uppercase tracking-[0.4em]">Live Agent Dispatch Active</p>
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter mb-10 leading-[0.85]">
             MEET YOUR<br/>
             <span className="text-[#004a99]">EXPERT TEAM.</span>
           </h1>
           <p className="text-slate-800 font-bold max-w-4xl mx-auto leading-relaxed text-2xl md:text-3xl px-6 opacity-90">
             Instantly connect with Sarah for energy rebates or Mike for emergency dispatch and our 4-hour response guarantee.
           </p>
        </div>

        <div id="sarah-agent" className="w-full transition-all duration-700">
          <DrHVACVoiceAgent />
        </div>

        {/* ENHANCED TRUST BADGE SECTION */}
        <div className="w-full max-w-7xl mt-32 mb-32 flex flex-col items-center">
           <div className="bg-white rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border-2 border-slate-50 p-20 w-full max-w-xl flex flex-col items-center text-center transition-all hover:shadow-[0_60px_140px_-30px_rgba(0,0,0,0.12)] group relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-50/20 to-transparent pointer-events-none"></div>
              
              <span className="text-9xl font-black text-black tracking-tighter mb-10 group-hover:scale-105 transition-transform relative z-10">100%</span>
              
              <div className="bg-orange-50 border-2 border-orange-100 rounded-[2.5rem] px-12 py-6 mb-10 relative z-10 transform group-hover:rotate-1 transition-all shadow-sm">
                 <p className="text-[#f37021] font-black text-xl md:text-2xl uppercase tracking-[0.2em] leading-tight">
                    SATISFACTION<br/>PROMISE
                 </p>
              </div>

              <p className="text-slate-400 font-black text-[14px] uppercase tracking-[0.4em] relative z-10 mb-2">MONEY BACK GUARANTEE</p>
              <div className="w-12 h-1 bg-orange-200 rounded-full mt-2 group-hover:w-24 transition-all"></div>
           </div>
           
           <div className="mt-20 flex flex-col items-center gap-4">
              <p className="text-[13px] font-black text-slate-300 uppercase tracking-[0.8em] animate-pulse">
                 OFFICIAL DR. HVAC SERVICE GUARANTEE
              </p>
              <div className="flex gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-100"></div>
                ))}
              </div>
           </div>
        </div>

        <div id="faq-section" className="w-full">
          <FAQSection />
        </div>

        <footer className="w-full mt-32 py-20 border-t border-slate-100 flex flex-col items-center">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">Dr</div>
              <span className="font-black text-slate-900 tracking-tighter text-xl uppercase">HVAC & PLUMBING</span>
           </div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 text-center">© 2026 DR. HVAC OFFICIAL SITE — TORONTO, ONTARIO</p>
           <div className="flex gap-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
             <span className="cursor-pointer hover:text-slate-600">Privacy Policy</span>
             <span className="cursor-pointer hover:text-slate-600">Terms of Service</span>
             <span className="cursor-pointer hover:text-slate-600">Service Map</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
