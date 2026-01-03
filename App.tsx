
import React, { useState, useEffect } from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const [activeLegalContent, setActiveLegalContent] = useState<{ title: string; body: string } | null>(null);
  const [liveResponseTime, setLiveResponseTime] = useState('3h 42m');

  useEffect(() => {
    const timer = setInterval(() => {
      const minutes = Math.floor(Math.random() * 60);
      setLiveResponseTime(`3h ${minutes}m`);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

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
        body: "Dr. HVAC respects your privacy. Data collected is exclusively used for GTA dispatch and rebate verification. We never share customer profiles with third parties."
      },
      terms: {
        title: "Terms of Service",
        body: "Our 4-hour guarantee applies to critical system failures in specified GTA zones. Full T&C provided upon on-site assessment."
      },
      map: {
        title: "Service Map",
        body: "Covering Toronto, North York, Etobicoke, Scarborough, Mississauga, Brampton, Vaughan, and Markham."
      }
    };
    setActiveLegalContent(contents[type]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafd]">
      
      {/* High-Contrast Top Bar */}
      <div className="w-full bg-[#1a2333] py-4 px-6 flex justify-center border-b-4 border-[#f37021] sticky top-0 z-[50] shadow-xl">
        <div className="max-w-7xl w-full flex justify-between items-center text-[14px] font-[900] text-white uppercase tracking-[0.2em]">
           <div className="flex items-center gap-10">
             <div className="flex items-center gap-3 text-[#f37021]">
                <span className="text-xl">★★★★★</span>
                <span className="text-white border-b-2 border-[#f37021]/30 pb-1">2,277 GOOGLE REVIEWS</span>
             </div>
             <div className="hidden md:flex items-center gap-3 text-white/60">
                <div className="w-2 h-2 rounded-full bg-[#f37021]"></div>
                <span>TORONTO'S #1 HVAC EXPERTS</span>
             </div>
           </div>
           <div className="flex items-center gap-8">
             <div className="hidden lg:flex flex-col items-end leading-tight">
                <span className="text-[10px] text-white/40 tracking-widest">CURRENT GTA WAIT:</span>
                <span className="text-[12px] text-emerald-400 font-black">{liveResponseTime}</span>
             </div>
             <a href="tel:2894984082" className="text-[#f37021] hover:text-white transition-all font-black text-2xl tracking-tighter">289-498-4082</a>
           </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-8 py-16 flex flex-col items-center">
        {/* Logo & Navigation */}
        <div className="w-full flex justify-between items-center mb-28 animate-slide-up-fade">
           <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-20 h-20 bg-[#f37021] rounded-2xl flex items-center justify-center text-white font-[900] text-3xl shadow-2xl group-hover:scale-105 transition-all">Dr</div>
              <div className="flex flex-col">
                <p className="text-[42px] font-[900] text-[#004a99] tracking-[-0.03em] uppercase leading-[0.85]">HVAC & PLUMBING</p>
                <p className="text-[13px] font-[900] text-slate-400 uppercase tracking-[0.65em] mt-2 ml-1">TORONTO & GTA OFFICIAL SERVICE</p>
              </div>
           </div>
           
           <nav className="hidden lg:flex items-center gap-12 text-[15px] font-[900] uppercase tracking-widest text-[#004a99]">
             <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all">Service Area</button>
             <button className="hover:text-[#f37021] transition-all border-b-2 border-transparent hover:border-[#f37021]/20">Reviews</button>
             <button onClick={() => scrollToSection('sarah-agent')} className="bg-[#004a99] text-white px-10 py-5 rounded-2xl shadow-2xl hover:bg-[#1a2333] transition-all font-[900] text-[14px] uppercase tracking-widest">BOOK NOW</button>
           </nav>
        </div>

        <div id="sarah-agent" className="w-full">
          <DrHVACVoiceAgent />
        </div>

        <FAQSection />

        {/* HIGH-END DEMO FOOTER SECTION */}
        <footer className="w-full mt-40 pt-24 pb-12 flex flex-col items-center bg-white rounded-[6rem] shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.03)] border-t border-slate-50 relative overflow-hidden">
           
           {/* GTA Status Bar - Demo Feature */}
           <div className="max-w-4xl w-full mb-24 px-8">
              <div className="bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-12 relative">
                 <div className="flex items-center gap-8">
                    <div className="relative">
                       <div className="w-20 h-20 bg-[#004a99] rounded-3xl flex items-center justify-center text-white shadow-2xl">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                       </div>
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full animate-pulse"></div>
                    </div>
                    <div>
                       <p className="text-[12px] font-[900] text-[#004a99] uppercase tracking-[0.3em] mb-1">GTA COVERAGE ACTIVE</p>
                       <p className="text-2xl font-[900] text-slate-800 tracking-tight">System Status: Optimal</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-white px-8 py-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AVAILABILITY</p>
                       <p className="text-xl font-[900] text-[#004a99]">98.2%</p>
                    </div>
                    <div className="bg-white px-8 py-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">LIVE AGENTS</p>
                       <p className="text-xl font-[900] text-[#f37021]">12 ONLINE</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col items-center gap-6 mb-20 group">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-[#1a2333] rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform">Dr</div>
                 <span className="font-[900] text-[#1a2333] tracking-tighter text-[38px] uppercase">HVAC & PLUMBING</span>
              </div>
              <div className="h-1.5 w-24 bg-orange-500 rounded-full group-hover:w-40 transition-all"></div>
           </div>
           
           <div className="flex flex-col items-center text-center space-y-12">
              <p className="text-[18px] md:text-[24px] font-[900] text-slate-800 uppercase tracking-[0.7em] leading-relaxed max-w-6xl px-4">
                 © 2026 DR. HVAC OFFICIAL SITE — TORONTO, ONTARIO
              </p>
              
              <div className="flex flex-wrap justify-center gap-12 md:gap-28 text-[15px] font-[900] text-[#004a99] uppercase tracking-[0.5em]">
                <button onClick={() => showLegal('privacy')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/40 pb-2">Privacy Policy</button>
                <button onClick={() => showLegal('terms')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/40 pb-2">Terms of Service</button>
                <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/40 pb-2">Service Map</button>
              </div>
           </div>

           <div className="mt-32 w-full flex flex-col md:flex-row items-center justify-center gap-20 opacity-40 grayscale group-hover:grayscale-0 transition-all">
              <div className="text-[12px] font-black tracking-[0.8em] text-slate-400">TSSA CERTIFIED #72821</div>
              <div className="text-[12px] font-black tracking-[0.8em] text-slate-400">HRAI MEMBER ACTIVE</div>
              <div className="text-[12px] font-black tracking-[0.8em] text-slate-400">BBB ACCREDITED A+</div>
           </div>
        </footer>
      </div>

      {activeLegalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a2333]/90 backdrop-blur-3xl animate-fade-in">
          <div className="bg-white rounded-[4rem] p-20 max-w-2xl w-full shadow-2xl border-4 border-[#004a99]/10 animate-slide-up-fade">
            <h3 className="text-4xl font-[900] text-[#004a99] mb-8 uppercase tracking-tighter">{activeLegalContent.title}</h3>
            <p className="text-slate-700 text-xl font-bold leading-relaxed mb-12">{activeLegalContent.body}</p>
            <button onClick={() => setActiveLegalContent(null)} className="w-full py-8 bg-[#1a2333] text-white font-[900] text-[14px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all">DISMISS</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
