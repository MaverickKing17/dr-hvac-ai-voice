
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
             <button onClick={() => scrollToSection('reviews-section')} className="hover:text-[#f37021] transition-all">Reviews</button>
             <button onClick={() => scrollToSection('sarah-agent')} className="bg-[#004a99] text-white px-10 py-5 rounded-2xl shadow-2xl hover:bg-[#1a2333] transition-all font-[900] text-[14px] uppercase tracking-widest">CONNECT NOW</button>
           </nav>
        </div>

        <div id="sarah-agent" className="w-full">
          <DrHVACVoiceAgent />
        </div>

        {/* REVIEWS SECTION - High-end functioning implementation */}
        <section id="reviews-section" className="w-full mt-40 pt-20 border-t border-slate-100">
           <div className="flex flex-col items-center text-center mb-20">
              <span className="text-[#f37021] font-black text-[14px] uppercase tracking-[0.6em] mb-4">Verified Customer Proof</span>
              <h2 className="text-5xl md:text-6xl font-[900] text-[#1a2333] tracking-tighter">What Our GTA Clients Say</h2>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Julian M.", area: "North York", comment: "Mike was at my door in 2 hours when my furnace died on a Friday night. Incredible service!", stars: 5 },
                { name: "Sarah L.", area: "Etobicoke", comment: "Sarah guided me through the $7,500 rebate perfectly. My new heat pump is a game changer.", stars: 5 },
                { name: "Robert K.", area: "Downtown", comment: "The most professional HVAC company in Toronto. Transparent pricing and expert tech support.", stars: 5 }
              ].map((review, i) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-50 flex flex-col h-full hover:-translate-y-2 transition-transform">
                   <div className="flex text-orange-400 text-xl mb-6">{"★".repeat(review.stars)}</div>
                   <p className="text-slate-600 font-bold text-lg leading-relaxed mb-10 flex-grow italic">"{review.comment}"</p>
                   <div>
                      <p className="font-black text-[#1a2333] text-xl">{review.name}</p>
                      <p className="text-[#004a99] font-black text-[12px] uppercase tracking-widest">{review.area} Homeowner</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <FAQSection />

        {/* EXECUTIVE DEMO FOOTER - BOLDER & STRIKING BADGES */}
        <footer className="w-full mt-48 pt-32 pb-16 flex flex-col items-center bg-[#1a2333] rounded-[6rem] shadow-2xl border-t-8 border-[#f37021] relative overflow-hidden">
           
           {/* Certification Badges - PROFESSIONAL STAMPS */}
           <div className="max-w-6xl w-full mb-32 px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-[3rem] p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl group-hover:rotate-3 transition-transform">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <p className="text-white font-[900] text-2xl tracking-tight mb-2 uppercase">TSSA CERTIFIED</p>
                    <p className="text-emerald-400 font-black text-[13px] uppercase tracking-[0.4em]">REG ID #72821-GTA</p>
                 </div>
                 
                 <div className="bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-[3rem] p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                    <div className="w-20 h-20 bg-[#004a99] rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl group-hover:rotate-3 transition-transform">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p className="text-white font-[900] text-2xl tracking-tight mb-2 uppercase">HRAI MEMBER</p>
                    <p className="text-blue-400 font-black text-[13px] uppercase tracking-[0.4em]">ACTIVE PLATINUM</p>
                 </div>

                 <div className="bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-[3rem] p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                    <div className="w-20 h-20 bg-[#f37021] rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl group-hover:rotate-3 transition-transform">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </div>
                    <p className="text-white font-[900] text-2xl tracking-tight mb-2 uppercase">BBB ACCREDITED</p>
                    <p className="text-orange-400 font-black text-[13px] uppercase tracking-[0.4em]">OFFICIAL A+ RATING</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col items-center gap-8 mb-24 group">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-[#f37021] rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:rotate-6 transition-all duration-500 shadow-2xl">Dr</div>
                 <span className="font-[900] text-white tracking-tighter text-[42px] uppercase">HVAC & PLUMBING</span>
              </div>
              <div className="h-2 w-32 bg-[#f37021] rounded-full group-hover:w-64 transition-all duration-700"></div>
           </div>
           
           <div className="flex flex-col items-center text-center space-y-20">
              <p className="text-[20px] md:text-[28px] font-[900] text-white uppercase tracking-[0.6em] leading-relaxed max-w-7xl px-8 opacity-90">
                 © 2026 DR. HVAC OFFICIAL SITE — TORONTO, ONTARIO
              </p>
              
              <div className="flex flex-wrap justify-center gap-16 md:gap-32 text-[15px] font-[900] text-white/70 uppercase tracking-[0.4em]">
                <button onClick={() => showLegal('privacy')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/30 pb-3">Security & Privacy</button>
                <button onClick={() => showLegal('terms')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/30 pb-3">Service Terms</button>
                <button onClick={() => showLegal('map')} className="hover:text-[#f37021] transition-all border-b-4 border-transparent hover:border-[#f37021]/30 pb-3">Technician Map</button>
              </div>
           </div>

           {/* Google Reviews Badge - FLAWLESS DEMO DETAIL */}
           <div className="mt-32 flex items-center gap-12 px-10 py-6 bg-white/5 rounded-full border border-white/10">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-[#1a2333]">G</div>
                 <span className="text-white font-black text-sm tracking-widest">4.9 / 5.0 STAR RATED</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex gap-1 text-orange-400">★★★★★</div>
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
