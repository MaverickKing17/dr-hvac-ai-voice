
import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      if (id === 'sarah-agent') {
        element.classList.add('ring-[12px]', 'ring-orange-500/20');
        setTimeout(() => element.classList.remove('ring-[12px]', 'ring-orange-500/20'), 1500);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafd]">
      
      {/* High-Contrast Top Bar */}
      <div className="w-full bg-[#1a2333] py-5 px-6 flex justify-center border-b-4 border-[#f37021]">
        <div className="max-w-7xl w-full flex justify-between items-center text-[18px] font-[900] text-white uppercase tracking-[0.2em]">
           <div className="flex items-center gap-8">
             <div className="flex items-center gap-3 text-[#f37021]">
                <span className="text-2xl">★★★★★</span>
                <span className="text-white border-b-4 border-[#f37021] pb-1">2,277 GOOGLE REVIEWS</span>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <span className="text-white font-[900]">CALL ANYTIME:</span>
             <a href="tel:2894984082" className="text-[#f37021] hover:text-white transition-all font-[900] text-2xl">289-498-4082</a>
           </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-6 py-16 flex flex-col items-center">
        {/* Massive Logo & Navigation */}
        <div className="w-full flex justify-between items-center mb-28">
           <div 
             className="flex items-center gap-5 cursor-pointer group" 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           >
              <div className="w-24 h-24 bg-[#f37021] rounded-[2rem] flex items-center justify-center text-white font-[900] text-5xl shadow-2xl shadow-orange-500/40 group-hover:scale-110 transition-transform">Dr</div>
              <div className="leading-none">
                <p className="text-6xl font-[900] text-[#004a99] tracking-tighter uppercase">HVAC & PLUMBING</p>
                <p className="text-[16px] font-[900] text-black uppercase tracking-[0.5em] mt-2">TORONTO'S #1 RATED SERVICE</p>
              </div>
           </div>
           
           <nav className="hidden xl:flex items-center gap-16 text-[20px] font-[900] uppercase tracking-widest text-[#004a99]">
             <button onClick={() => scrollToSection('sarah-agent')} className="hover:text-[#f37021] transition-colors border-b-4 border-transparent hover:border-[#f37021] pb-1">Heating</button>
             <button onClick={() => scrollToSection('sarah-agent')} className="hover:text-[#f37021] transition-colors border-b-4 border-transparent hover:border-[#f37021] pb-1">Cooling</button>
             <button onClick={() => scrollToSection('faq-section')} className="hover:text-[#f37021] transition-colors border-b-4 border-transparent hover:border-[#f37021] pb-1">Rebates</button>
             <button 
               onClick={() => scrollToSection('sarah-agent')}
               className="bg-[#f37021] text-white px-20 py-10 rounded-[2.5rem] shadow-3xl shadow-orange-500/50 transform hover:-translate-y-2 active:translate-y-0 transition-all font-[900] text-[24px] uppercase tracking-tighter"
             >
               GET A QUOTE NOW
             </button>
           </nav>
        </div>

        {/* Hero Section with Absolute Maximum Boldness */}
        <div className="text-center mb-24 animate-slide-up-fade">
           <p className="text-[22px] text-[#f37021] font-[900] uppercase tracking-[0.8em] mb-10">TORONTO SPECIALS & REBATES</p>
           <h1 className="text-8xl md:text-[11rem] font-[900] text-black tracking-tighter mb-14 leading-[0.75] drop-shadow-md">
             CLAIM YOUR 2026<br/>
             <span className="text-[#004a99]">ENERGY SAVINGS.</span>
           </h1>
           <p className="text-black font-[900] max-w-6xl mx-auto leading-tight text-4xl md:text-5xl px-4">
             Talk to Sarah. Our AI Specialist is online now to qualify you for $7,500 in government rebates.
           </p>
        </div>

        <div id="sarah-agent" className="w-full transition-all duration-500">
          <DrHVACVoiceAgent />
        </div>

        {/* TRUST BADGES - FIXED HOMESTARS URL */}
        <div className="w-full max-w-7xl mt-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-stretch">
             
             {/* HomeStars Badge - FIXED FULL CANONICAL URL */}
             <a 
               href="https://homestars.com/companies/2785535-dr-hvac-heating-air-conditioning-duct-cleaning-plumbing-service" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-20 bg-white rounded-[5rem] border-[10px] border-slate-100 shadow-3xl transition-all hover:shadow-orange-500/30 hover:-translate-y-4 hover:border-[#f37021]/60"
             >
                <div className="mb-10">
                  <span className="text-8xl font-[900] text-black tracking-tighter block group-hover:text-blue-800 transition-colors">HomeStars</span>
                </div>
                <div className="px-14 py-6 bg-green-50 rounded-[2rem] border-8 border-green-500 mb-6 shadow-xl">
                  <span className="text-[24px] font-[900] uppercase tracking-[0.2em] text-green-950">BEST OF 2024 WINNER</span>
                </div>
                <p className="mt-10 text-[22px] font-[900] text-black uppercase tracking-widest">VERIFIED SERVICE PROFILE</p>
             </a>

             {/* BBB Badge */}
             <a 
               href="https://www.bbb.org/ca/on/brampton/profile/heating-and-air-conditioning/dr-hvac-0107-1205391" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-20 bg-white rounded-[5rem] border-[10px] border-slate-100 shadow-3xl transition-all hover:shadow-orange-500/30 hover:-translate-y-4 hover:border-[#004a99]/60"
             >
                <div className="mb-10">
                  <span className="text-9xl font-[900] text-[#004a99] tracking-tighter block">BBB<span className="text-[#f37021]">.</span></span>
                </div>
                <div className="px-14 py-6 bg-blue-50 rounded-[2rem] border-8 border-blue-500 mb-6 shadow-xl">
                  <span className="text-[24px] font-[900] uppercase tracking-[0.2em] text-[#004a99]">ACCREDITED A+ RATING</span>
                </div>
                <p className="mt-10 text-[22px] font-[900] text-black uppercase tracking-widest">IDENTITY VERIFIED MEMBER</p>
             </a>

             {/* Guarantee Badge */}
             <a 
               href="https://www.drhvac.ca/guarantee/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-20 bg-white rounded-[5rem] border-[10px] border-slate-100 shadow-3xl transition-all hover:shadow-orange-500/30 hover:-translate-y-4 hover:border-orange-400"
             >
                <div className="mb-10">
                  <span className="text-9xl font-[900] text-black tracking-tighter block group-hover:text-[#f37021] transition-colors">100%</span>
                </div>
                <div className="px-14 py-6 bg-orange-50 rounded-[2rem] border-8 border-orange-500 mb-6 shadow-xl">
                  <span className="text-[24px] font-[900] uppercase tracking-[0.2em] text-[#f37021]">SATISFACTION PROMISE</span>
                </div>
                <p className="mt-10 text-[22px] font-[900] text-black uppercase tracking-widest">MONEY BACK GUARANTEE</p>
             </a>

          </div>
          <p className="text-center mt-24 text-[24px] font-[900] text-black uppercase tracking-[0.8em] animate-pulse">CLICK ANY BADGE TO VERIFY OFFICIAL CREDENTIALS</p>
        </div>

        <div id="faq-section" className="w-full">
          <FAQSection />
        </div>

        <div className="py-40"></div>
      </div>
    </div>
  );
};

export default App;
