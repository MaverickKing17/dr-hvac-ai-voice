
import React, { useState } from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const [activeLegalContent, setActiveLegalContent] = useState<{ title: string; body: string } | null>(null);

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

  const showLegal = (type: 'privacy' | 'terms' | 'map') => {
    const contents = {
      privacy: {
        title: "Privacy Policy",
        body: "Dr. HVAC respects your privacy. We collect information such as your home address, contact details, and current heating system specs (Oil, Electric, or Gas) specifically to evaluate your eligibility for the $7,500 Heat Pump Rebate program and to ensure accurate dispatch of our technicians across the GTA. We never sell your data to third-party marketers."
      },
      terms: {
        title: "Terms of Service",
        body: "Our 4-hour emergency response guarantee applies to critical HVAC failures (No Heat in Winter / No AC in Extreme Heat) within our primary service zones. Dispatch priority is managed by Mike our Emergency Lead. Diagnostic fees are waived if we fail to arrive within the promised window. All installations are performed by licensed TSSA-certified technicians."
      },
      map: {
        title: "Service Map",
        body: "Dr. HVAC & Plumbing is Toronto's primary official service provider. Our active service territory covers the entire Greater Toronto Area, including: Old Toronto, North York, Etobicoke, Scarborough, Mississauga, Brampton, Vaughan, Markham, and Richmond Hill."
      }
    };
    setActiveLegalContent(contents[type]);
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
             className="flex items-center gap-6 cursor-pointer group" 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           >
              <div className="w-[72px] h-[72px] bg-[#f37021] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-all">Dr</div>
              <div className="flex flex-col">
                <p className="text-[38px] font-black text-[#004a99] tracking-[-0.03em] uppercase leading-[0.9]">HVAC & PLUMBING</p>
                <p className="text-[14px] font-[900] text-slate-400 uppercase tracking-[0.55em] mt-1.5 ml-0.5">TORONTO & GTA OFFICIAL SERVICE</p>
              </div>
           </div>
           
           <nav className="hidden lg:flex items-center gap-12 text-[15px] font-black uppercase tracking-widest text-[#004a99]">
             <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all">Service Area</button>
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

        {/* REFINED FOOTER */}
        <footer className="w-full mt-32 py-24 border-t border-slate-100 flex flex-col items-center">
           <div className="flex items-center gap-5 mb-14">
              <div className="w-12 h-12 bg-[#1a2333] rounded-[14px] flex items-center justify-center text-white font-black text-lg">Dr</div>
              <span className="font-black text-[#1a2333] tracking-tight text-[28px] uppercase">HVAC & PLUMBING</span>
           </div>
           
           <div className="flex flex-col items-center text-center space-y-16">
              <p className="text-[16px] md:text-[20px] font-black text-slate-700 uppercase tracking-[0.85em] leading-relaxed max-w-5xl px-4 opacity-90">
                 © 2026 DR. HVAC OFFICIAL SITE — TORONTO, ONTARIO
              </p>
              
              <div className="flex flex-wrap justify-center gap-12 md:gap-24 text-[14px] font-[900] text-slate-500 uppercase tracking-[0.45em]">
                <button onClick={() => showLegal('privacy')} className="hover:text-[#004a99] transition-colors duration-300 border-b-2 border-transparent hover:border-[#004a99]/20 pb-1">Privacy Policy</button>
                <button onClick={() => showLegal('terms')} className="hover:text-[#004a99] transition-colors duration-300 border-b-2 border-transparent hover:border-[#004a99]/20 pb-1">Terms of Service</button>
                <button onClick={() => showLegal('map')} className="hover:text-[#004a99] transition-colors duration-300 border-b-2 border-transparent hover:border-[#004a99]/20 pb-1">Service Map</button>
              </div>
           </div>
        </footer>
      </div>

      {/* Simple Legal Modal */}
      {activeLegalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a2333]/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full shadow-2xl border-4 border-[#004a99]/10 animate-slide-up-fade">
            <h3 className="text-4xl font-black text-[#004a99] mb-8 uppercase tracking-tighter">{activeLegalContent.title}</h3>
            <p className="text-slate-600 text-xl font-bold leading-relaxed mb-12">
              {activeLegalContent.body}
            </p>
            <button 
              onClick={() => setActiveLegalContent(null)}
              className="w-full py-6 bg-[#1a2333] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20"
            >
              CLOSE WINDOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
