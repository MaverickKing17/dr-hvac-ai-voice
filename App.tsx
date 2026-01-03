
import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // If scrolling to the agent, give it a quick "pulse" to show it's ready
      if (id === 'sarah-agent') {
        element.classList.add('ring-4', 'ring-orange-500/20');
        setTimeout(() => element.classList.remove('ring-4', 'ring-orange-500/20'), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafd]">
      
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
             <a href="tel:2894984082" className="text-[#f37021] hover:underline transition-all font-black">289-498-4082</a>
           </div>
        </div>
      </div>

      <div className="w-full max-w-6xl px-4 py-8 flex flex-col items-center">
        {/* Logo Branding */}
        <div className="w-full flex justify-between items-center mb-16">
           <div 
             className="flex items-center gap-2 cursor-pointer group" 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           >
              <div className="w-10 h-10 bg-[#f37021] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">Dr</div>
              <div className="leading-tight">
                <p className="text-xl font-black text-[#004a99] tracking-tighter uppercase">HVAC & PLUMBING</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Since 1985</p>
              </div>
           </div>
           
           <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-[#004a99]">
             <button 
               onClick={() => scrollToSection('sarah-agent')} 
               className="hover:text-[#f37021] transition-colors"
             >
               Heating
             </button>
             <button 
               onClick={() => scrollToSection('sarah-agent')} 
               className="hover:text-[#f37021] transition-colors"
             >
               Cooling
             </button>
             <button 
               onClick={() => scrollToSection('faq-section')} 
               className="hover:text-[#f37021] transition-colors"
             >
               Rebates
             </button>
             <button 
               onClick={() => scrollToSection('sarah-agent')}
               className="bg-[#f37021] text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-black"
             >
               Get Quote
             </button>
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

        <div id="sarah-agent" className="w-full transition-all duration-500 rounded-[3rem]">
          <DrHVACVoiceAgent />
        </div>

        {/* Enhanced Trust Badges Section - FIXED LINKS AND INCREASED SIZE */}
        <div className="w-full max-w-4xl mt-24 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-stretch">
             
             {/* HomeStars Badge */}
             <a 
               href="https://homestars.com/companies/2785535-dr-hvac" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1"
             >
                <div className="mb-4">
                  <span className="text-4xl font-black text-[#1a2333] tracking-tighter block group-hover:text-blue-600 transition-colors">HomeStars</span>
                </div>
                <div className="px-5 py-2 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-[12px] font-black uppercase tracking-[0.25em] text-green-700">Best of 2024 Winner</span>
                </div>
                <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Verified Contractor</p>
             </a>

             {/* BBB Badge */}
             <a 
               href="https://www.bbb.org/search?find_country=CAN&find_text=Dr.%20HVAC&find_loc=Brampton%2C%20ON" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1"
             >
                <div className="mb-4">
                  <span className="text-4xl font-black text-[#004a99] tracking-tighter block">BBB<span className="text-[#f37021]">.</span></span>
                </div>
                <div className="px-5 py-2 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[12px] font-black uppercase tracking-[0.25em] text-[#004a99]">Accredited A+ Rating</span>
                </div>
                <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identity Verified</p>
             </a>

             {/* Guarantee Badge */}
             <a 
               href="https://www.drhvac.ca/guarantee/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center group text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1"
             >
                <div className="mb-4">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter block group-hover:text-[#f37021] transition-colors">100%</span>
                </div>
                <div className="px-5 py-2 bg-orange-50 rounded-xl border border-orange-100">
                  <span className="text-[12px] font-black uppercase tracking-[0.25em] text-[#f37021]">Satisfaction Promise</span>
                </div>
                <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Money Back Policy</p>
             </a>

          </div>
          <p className="text-center mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Click any badge to verify credentials</p>
        </div>

        <div id="faq-section" className="w-full">
          <FAQSection />
        </div>

        <div className="py-24"></div>
      </div>
    </div>
  );
};

export default App;
