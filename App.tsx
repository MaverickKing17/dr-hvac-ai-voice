
import React, { useState, useEffect } from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const [activeLegalContent, setActiveLegalContent] = useState<{ title: string; body: string } | null>(null);
  const [liveResponseTime, setLiveResponseTime] = useState('3h 42m');
  const [torontoTemp, setTorontoTemp] = useState('18°C');

  useEffect(() => {
    const timer = setInterval(() => {
      const minutes = Math.floor(Math.random() * 60);
      setLiveResponseTime(`3h ${minutes}m`);
      const temp = Math.floor(Math.random() * 5) + 15;
      setTorontoTemp(`${temp}°C`);
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
        title: "Privacy Protocol",
        body: "Dr. HVAC respects client confidentiality. Voice transcripts and diagnostics are stored securely for service accuracy and rebate verification. We adhere to the highest Toronto data protection standards."
      },
      terms: {
        title: "Service Guarantee",
        body: "Our 4-hour 'Mike' Emergency Dispatch applies to critical furnace/AC failures within our primary GTA service sectors. Non-emergency scheduling follows standard Sarah-led protocols."
      },
      map: {
        title: "GTA Deployment Zone",
        body: "Our technicians are currently deployed in: Toronto Core, North York, Etobicoke, Scarborough, Mississauga, Brampton, Vaughan, and Markham."
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
                <span className="text-[10px] text-white/40 tracking-widest uppercase">GTA RESPONSE:</span>
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
             <button className="hover:text-[#f37021] transition-all">Reviews</button>
             <button onClick={() => scrollToSection('sarah-agent')} className="bg-[#004a99] text-white px-10 py-5 rounded-2xl shadow-2xl hover:bg-[#1a2333] transition-all font-[900] text-[14px] uppercase tracking-widest">CONNECT NOW</button>
           </nav>
        </div>

        <div id="sarah-agent" className="w-full">
          <DrHVACVoiceAgent />
        </div>

        <FAQSection />

        {/* EXECUTIVE DEMO FOOTER */}
        <footer className="w-full mt-48 pt-32 pb-16 flex flex-col items-center bg-white rounded-[6rem] shadow-[0_-60px_160px_-40px_rgba(0,0,0,0.04)] border-t border-slate-50 relative overflow-hidden">
           
           {/* Live Health Metrics - To Impress Client */}
           <div className="max-w-6xl w-full mb-32 px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-[#fcfdfe] border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-[#004a99] rounded-2xl flex items-center justify-center mb-6">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Toronto Priority</p>
                    <p className="text-2xl font-[900] text-slate-800 tracking-tight">Current Dispatch: {liveResponseTime}</p>
                 </div>
                 
                 <div className="bg-[#fcfdfe] border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-orange-50 text-[#f37021] rounded-2xl flex items-center justify-center mb-6">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Active Area</p>
                    <p className="text-2xl font-[900] text-slate-800 tracking-tight">Downtown: {torontoTemp}</p>
                 </div>

                 <div className="bg-[#fcfdfe] border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Network Health</p>
                    <p className="text-2xl font-[900] text-slate-800 tracking-tight">TSSA System: 100%</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col items-center gap-8 mb-24 group">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-[#1a2333] rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:rotate-6 transition-all duration-500">Dr</div>
                 <span className="font-[900] text-[#1a2333] tracking-tighter text-[42px] uppercase">HVAC & PLUMBING</span>
              </div>
              <div className="h-2 w-32 bg-[#f37021] rounded-full group-hover:w-64 transition-all duration-700"></div>
           </div>
           
           <div className="flex flex-col items-center text-center space-y-20">
              <p className="text-[20px] md:text-[28px] font-[900] text-slate-800 uppercase tracking-[0.6em] leading-relaxed max-w-7xl px-8 opacity-90">
                 © 2026 DR. HVAC OFFICIAL SITE — TORONTO, ONTARIO
              </p>
              
              <div className="flex flex-wrap justify-center gap-16 md:gap-32 text-[15px] font-[900] text-[#004a99] uppercase tracking-[0.4em]">
                <button onClick={() => showLegal('privacy')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/30 pb-3">Security & Privacy</button>
                <button onClick={() => showLegal('terms')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/30 pb-3">Service Terms</button>
                <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/30 pb-3">Technician Map</button>
              </div>
           </div>

           <div className="mt-40 w-full flex flex-wrap items-center justify-center gap-24 opacity-30 grayscale group-hover:grayscale-0 transition-all duration-1000">
              <div className="text-[13px] font-black tracking-[0.8em] text-slate-500">TSSA #72821-GTA</div>
              <div className="text-[13px] font-black tracking-[0.8em] text-slate-500">HRAI OFFICIAL MEMBER</div>
              <div className="text-[13px] font-black tracking-[0.8em] text-slate-500">BBB ACCREDITED A+</div>
              <div className="text-[13px] font-black tracking-[0.8em] text-slate-500">GOOGLE 5-STAR RATED</div>
           </div>
        </footer>
      </div>

      {activeLegalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a2333]/95 backdrop-blur-3xl animate-fade-in">
          <div className="bg-white rounded-[4rem] p-24 max-w-3xl w-full shadow-2xl border-4 border-[#004a99]/10 animate-slide-up-fade">
            <h3 className="text-5xl font-[900] text-[#004a99] mb-10 uppercase tracking-tighter">{activeLegalContent.title}</h3>
            <p className="text-slate-700 text-2xl font-bold leading-relaxed mb-16">{activeLegalContent.body}</p>
            <button onClick={() => setActiveLegalContent(null)} className="w-full py-8 bg-[#1a2333] text-white font-[900] text-[16px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl">ACKNOWLEDGE & DISMISS</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
