
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
        title: "Security & Privacy",
        body: "Dr. HVAC respects client confidentiality. Voice transcripts and diagnostics are stored securely for service accuracy and rebate verification. We adhere to the highest Toronto data protection standards."
      },
      terms: {
        title: "Service Terms",
        body: "Our 4-hour 'Mike' Emergency Dispatch applies to critical furnace/AC failures within our primary GTA service sectors. Non-emergency scheduling follows standard Sarah-led protocols."
      },
      map: {
        title: "Technician Map",
        body: "Our technicians are currently deployed in: Toronto Core, North York, Etobicoke, Scarborough, Mississauga, Brampton, Vaughan, and Markham."
      }
    };
    setActiveLegalContent(contents[type]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafd]">
      
      {/* High-Contrast Top Bar - Fixed "Faded" Look */}
      <div className="w-full bg-[#1a2333] py-3 md:py-4 px-4 md:px-6 flex justify-center border-b-4 border-[#f37021] sticky top-0 z-[100] shadow-2xl">
        <div className="max-w-7xl w-full flex justify-between items-center">
           <div className="flex items-center gap-4 md:gap-10">
             <div className="flex items-center gap-2 md:gap-3">
                <span className="text-lg md:text-xl text-[#f37021] drop-shadow-[0_0_8px_rgba(243,112,33,0.3)]">★★★★★</span>
                <span className="text-white font-black text-[11px] md:text-[13px] uppercase tracking-widest hidden sm:inline">2,277 REVIEWS</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f37021] shadow-[0_0_10px_rgba(243,112,33,0.6)]"></div>
                <span className="text-white font-black text-[11px] md:text-[13px] uppercase tracking-widest">TORONTO'S #1 HVAC EXPERTS</span>
             </div>
           </div>
           
           <div className="flex items-center gap-4 md:gap-8">
             <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] md:text-[11px] text-slate-300 font-black tracking-[0.1em] uppercase mb-1">GTA RESPONSE:</span>
                <span className="text-[14px] md:text-[16px] text-[#10b981] font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] uppercase tracking-tight">{liveResponseTime}</span>
             </div>
             <a href="tel:2894984082" className="hidden sm:block text-[#f37021] hover:text-white transition-all font-black text-xl md:text-2xl tracking-tighter">289-498-4082</a>
           </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-4 md:px-8 py-10 md:py-16 flex flex-col items-center">
        {/* Logo & Navigation */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 mb-16 md:mb-28 animate-slide-up-fade">
           <div className="flex items-center gap-4 md:gap-6 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-14 h-14 md:w-20 md:h-20 bg-[#f37021] rounded-2xl flex items-center justify-center text-white font-[900] text-2xl md:text-3xl shadow-2xl group-hover:scale-105 transition-all">Dr</div>
              <div className="flex flex-col">
                <p className="text-[28px] md:text-[42px] font-[900] text-[#004a99] tracking-[-0.03em] uppercase leading-[0.85]">HVAC & PLUMBING</p>
                <p className="text-[10px] md:text-[13px] font-[900] text-slate-400 uppercase tracking-[0.4em] md:tracking-[0.65em] mt-1 md:mt-2 ml-1">OFFICIAL GTA SERVICE</p>
              </div>
           </div>
           
           <nav className="flex items-center gap-6 md:gap-12 text-[13px] md:text-[15px] font-[900] uppercase tracking-widest text-[#004a99]">
             <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all">Service Area</button>
             <button onClick={() => scrollToSection('reviews-section')} className="hover:text-[#f37021] transition-all">Reviews</button>
             <button onClick={() => scrollToSection('sarah-agent')} className="bg-[#004a99] text-white px-6 md:px-10 py-3 md:py-5 rounded-2xl shadow-xl hover:bg-[#1a2333] transition-all font-[900] text-[12px] md:text-[14px] uppercase tracking-widest">START DEMO</button>
           </nav>
        </div>

        <div id="sarah-agent" className="w-full">
          <DrHVACVoiceAgent />
        </div>

        {/* REVIEWS SECTION */}
        <section id="reviews-section" className="w-full mt-24 md:mt-40 pt-12 md:pt-20 border-t border-slate-100">
           <div className="flex flex-col items-center text-center mb-12 md:mb-20">
              <span className="text-[#f37021] font-black text-[12px] md:text-[14px] uppercase tracking-[0.4em] md:tracking-[0.6em] mb-3 md:mb-4">Verified Customer Proof</span>
              <h2 className="text-4xl md:text-6xl font-[900] text-[#1a2333] tracking-tighter">What Our GTA Clients Say</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { name: "Julian M.", area: "North York", comment: "Mike was at my door in 2 hours when my furnace died on a Friday night. Incredible service!", stars: 5 },
                { name: "Sarah L.", area: "Etobicoke", comment: "Sarah guided me through the $7,500 rebate perfectly. My new heat pump is a game changer.", stars: 5 },
                { name: "Robert K.", area: "Downtown", comment: "The most professional HVAC company in Toronto. Transparent pricing and expert tech support.", stars: 5 }
              ].map((review, i) => (
                <div key={i} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-50 flex flex-col h-full hover:-translate-y-2 transition-transform">
                   <div className="flex text-orange-400 text-lg md:text-xl mb-4 md:mb-6">{"★".repeat(review.stars)}</div>
                   <p className="text-slate-600 font-bold text-base md:text-lg leading-relaxed mb-8 md:mb-10 flex-grow italic">"{review.comment}"</p>
                   <div>
                      <p className="font-black text-[#1a2333] text-lg md:text-xl">{review.name}</p>
                      <p className="text-[#004a99] font-black text-[10px] md:text-[12px] uppercase tracking-widest">{review.area} Homeowner</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <FAQSection />

        {/* EXECUTIVE DEMO FOOTER */}
        <footer className="w-full mt-24 md:mt-48 pt-16 md:pt-32 pb-10 md:pb-16 flex flex-col items-center bg-[#1a2333] rounded-[3rem] md:rounded-[6rem] shadow-2xl border-t-8 border-[#f37021] relative overflow-hidden">
           
           {/* Certification Badges */}
           <div className="max-w-6xl w-full mb-16 md:mb-32 px-6 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                 <div className="bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-2xl group-hover:rotate-3 transition-transform">
                       <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <p className="text-white font-[900] text-xl md:text-2xl tracking-tight mb-2 uppercase">TSSA CERTIFIED</p>
                    <p className="text-emerald-400 font-black text-[11px] md:text-[13px] uppercase tracking-[0.3em] md:tracking-[0.4em]">REG ID #72821-GTA</p>
                 </div>
                 
                 <div className="bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#004a99] rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-2xl group-hover:rotate-3 transition-transform">
                       <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p className="text-white font-[900] text-xl md:text-2xl tracking-tight mb-2 uppercase">HRAI MEMBER</p>
                    <p className="text-blue-400 font-black text-[11px] md:text-[13px] uppercase tracking-[0.3em] md:tracking-[0.4em]">ACTIVE PLATINUM</p>
                 </div>

                 <div className="bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#f37021] rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-2xl group-hover:rotate-3 transition-transform">
                       <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </div>
                    <p className="text-white font-[900] text-xl md:text-2xl tracking-tight mb-2 uppercase">BBB ACCREDITED</p>
                    <p className="text-orange-400 font-black text-[11px] md:text-[13px] uppercase tracking-[0.3em] md:tracking-[0.4em]">OFFICIAL A+ RATING</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col items-center gap-6 md:gap-8 mb-16 md:mb-24 group">
              <div className="flex items-center gap-4 md:gap-6">
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-[#f37021] rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl group-hover:rotate-6 transition-all duration-500 shadow-2xl">Dr</div>
                 <span className="font-[900] text-white tracking-tighter text-[28px] md:text-[42px] uppercase">HVAC & PLUMBING</span>
              </div>
              <div className="h-1.5 w-24 md:h-2 md:w-32 bg-[#f37021] rounded-full group-hover:w-64 transition-all duration-700"></div>
           </div>
           
           <div className="flex flex-col items-center text-center space-y-12 md:space-y-20">
              <p className="text-[16px] md:text-[28px] font-[900] text-white uppercase tracking-[0.4em] md:tracking-[0.6em] leading-relaxed max-w-7xl px-6 md:px-8 opacity-90">
                 © 2026 DR. HVAC OFFICIAL SITE — TORONTO, ONTARIO
              </p>
              
              <div className="flex flex-wrap justify-center gap-10 md:gap-32 text-[12px] md:text-[15px] font-[900] text-white/70 uppercase tracking-[0.3em] md:tracking-[0.4em] px-4">
                <button onClick={() => showLegal('privacy')} className="hover:text-[#f37021] transition-all border-b-2 md:border-b-4 border-transparent hover:border-[#f37021]/30 pb-2 md:pb-3">Security & Privacy</button>
                <button onClick={() => showLegal('terms')} className="hover:text-[#f37021] transition-all border-b-2 md:border-b-4 border-transparent hover:border-[#f37021]/30 pb-2 md:pb-3">Service Terms</button>
                <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all border-b-2 md:border-b-4 border-transparent hover:border-[#f37021]/30 pb-2 md:pb-3">Technician Map</button>
              </div>
           </div>
        </footer>
      </div>

      {activeLegalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#1a2333]/95 backdrop-blur-3xl animate-fade-in">
          <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-24 max-w-3xl w-full shadow-2xl border-4 border-[#004a99]/10 animate-slide-up-fade overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl md:text-5xl font-[900] text-[#004a99] mb-6 md:mb-10 uppercase tracking-tighter">{activeLegalContent.title}</h3>
            <p className="text-slate-700 text-lg md:text-2xl font-bold leading-relaxed mb-10 md:mb-16">{activeLegalContent.body}</p>
            <button onClick={() => setActiveLegalContent(null)} className="w-full py-6 md:py-8 bg-[#1a2333] text-white font-[900] text-sm md:text-[16px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl">ACKNOWLEDGE & DISMISS</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
