
import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      if (id === 'sarah-agent') {
        element.classList.add('ring-8', 'ring-orange-500/20');
        setTimeout(() => element.classList.remove('ring-8', 'ring-orange-500/20'), 1500);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafd]">
      
      {/* High-Contrast Top Bar */}
      <div className="w-full bg-[#1a2333] py-3 px-6 flex justify-center border-b-2 border-[#f37021]">
        <div className="max-w-6xl w-full flex justify-between items-center text-[13px] font-black text-white uppercase tracking-widest">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[#f37021]">
                <span className="text-lg">★★★★★</span>
                <span className="text-white border-b border-[#f37021]/50 pb-0.5">2,277 GOOGLE REVIEWS</span>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <span className="text-white/80 font-bold">CALL ANYTIME:</span>
             <a href="tel:2894984082" className="text-[#f37021] hover:text-white transition-all font-black text-lg">289-498-4082</a>
           </div>
        </div>
      </div>

      <div className="w-full max-w-6xl px-6 py-12 flex flex-col items-center">
        {/* Logo & Navigation */}
        <div className="w-full flex justify-between items-center mb-20">
           <div 
             className="flex items-center gap-4 cursor-pointer group" 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           >
              <div className="w-14 h-14 bg-[#f37021] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">Dr</div>
              <div className="leading-none">
                <p className="text-3xl font-black text-[#004a99] tracking-tighter uppercase">HVAC & PLUMBING</p>
                <p className="text-[11px] font-black text-black/60 uppercase tracking-[0.4em] mt-1">TORONTO'S #1 RATED SERVICE</p>
              </div>
           </div>
           
           <nav className="hidden lg:flex items-center gap-10 text-[14px] font-black uppercase tracking-widest text-[#004a99]">
             <button onClick={() => scrollToSection('sarah-agent')} className="hover:text-[#f37021] transition-colors border-b-2 border-transparent hover:border-[#f37021] pb-1">Heating</button>
             <button onClick={() => scrollToSection('sarah-agent')} className="hover:text-[#f37021] transition-colors border-b-2 border-transparent hover:border-[#f37021] pb-1">Cooling</button>
             <button onClick={() => scrollToSection('faq-section')} className="hover:text-[#f37021] transition-colors border-b-2 border-transparent hover:border-[#f37021] pb-1">Rebates</button>
             <button 
               onClick={() => scrollToSection('sarah-agent')}
               className="bg-[#f37021] text-white px-10 py-5 rounded-xl shadow-xl shadow-orange-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all font-black text-[15px] uppercase tracking-tight"
             >
               GET A QUOTE
             </button>
           </nav>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up-fade">
           <p className="text-[14px] text-[#f37021] font-black uppercase tracking-[0.5em] mb-6">TORONTO SPECIALS & REBATES</p>
           <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-8 leading-[0.9]">
             CLAIM YOUR 2026<br/>
             <span className="text-[#004a99]">ENERGY SAVINGS.</span>
           </h1>
           <p className="text-slate-800 font-bold max-w-3xl mx-auto leading-relaxed text-xl md:text-2xl px-4">
             Talk to Sarah. Our AI Specialist is online now to qualify you for $7,500 in government rebates.
           </p>
        </div>

        <div id="sarah-agent" className="w-full transition-all duration-500">
          <DrHVACVoiceAgent />
        </div>

        {/* TRUST BADGES */}
        <div className="w-full max-w-6xl mt-24 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
             
             {/* HomeStars Badge */}
             <a 
               href="https://homestars.com/companies/2785535-dr-hvac-heating-air-conditioning-duct-cleaning-plumbing-service" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-12 bg-white rounded-[3rem] border-4 border-slate-100 shadow-xl transition-all hover:shadow-orange-500/20 hover:-translate-y-2 hover:border-[#f37021]/40"
             >
                <div className="mb-6">
                  <span className="text-5xl font-black text-black tracking-tighter block group-hover:text-blue-800 transition-colors">HomeStars</span>
                </div>
                <div className="px-8 py-3 bg-green-50 rounded-2xl border-2 border-green-500/30 mb-4 shadow-sm">
                  <span className="text-[14px] font-black uppercase tracking-[0.2em] text-green-900">BEST OF 2024 WINNER</span>
                </div>
                <p className="mt-6 text-[13px] font-black text-black/60 uppercase tracking-widest">VERIFIED SERVICE PROFILE</p>
             </a>

             {/* BBB Badge */}
             <a 
               href="https://www.bbb.org/ca/on/brampton/profile/heating-and-air-conditioning/dr-hvac-0107-1205391" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-12 bg-white rounded-[3rem] border-4 border-slate-100 shadow-xl transition-all hover:shadow-orange-500/20 hover:-translate-y-2 hover:border-[#004a99]/40"
             >
                <div className="mb-6">
                  <span className="text-6xl font-black text-[#004a99] tracking-tighter block">BBB<span className="text-[#f37021]">.</span></span>
                </div>
                <div className="px-8 py-3 bg-blue-50 rounded-2xl border-2 border-blue-500/30 mb-4 shadow-sm">
                  <span className="text-[14px] font-black uppercase tracking-[0.2em] text-[#004a99]">ACCREDITED A+ RATING</span>
                </div>
                <p className="mt-6 text-[13px] font-black text-black/60 uppercase tracking-widest">IDENTITY VERIFIED MEMBER</p>
             </a>

             {/* Guarantee Badge */}
             <a 
               href="https://www.drhvac.ca/guarantee/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-12 bg-white rounded-[3rem] border-4 border-slate-100 shadow-xl transition-all hover:shadow-orange-500/20 hover:-translate-y-2 hover:border-orange-400"
             >
                <div className="mb-6">
                  <span className="text-6xl font-black text-black tracking-tighter block group-hover:text-[#f37021] transition-colors">100%</span>
                </div>
                <div className="px-8 py-3 bg-orange-50 rounded-2xl border-2 border-orange-500/30 mb-4 shadow-sm">
                  <span className="text-[14px] font-black uppercase tracking-[0.2em] text-[#f37021]">SATISFACTION PROMISE</span>
                </div>
                <p className="mt-6 text-[13px] font-black text-black/60 uppercase tracking-widest">MONEY BACK GUARANTEE</p>
             </a>

          </div>
          <p className="text-center mt-12 text-[13px] font-black text-black/40 uppercase tracking-[0.6em] animate-pulse">CLICK ANY BADGE TO VERIFY OFFICIAL CREDENTIALS</p>
        </div>

        <div id="faq-section" className="w-full">
          <FAQSection />
        </div>

        <div className="py-20"></div>
      </div>
    </div>
  );
};

export default App;
