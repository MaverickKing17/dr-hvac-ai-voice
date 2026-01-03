
import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  recommendedAgent: 'SARAH' | 'MIKE';
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, recommendedAgent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] mb-4 md:mb-6 border-2 ${isOpen ? 'bg-white border-[#004a99]/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]' : 'bg-white/50 border-slate-100 hover:border-slate-300'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 md:py-8 px-6 md:px-10 flex items-center justify-between text-left focus:outline-none group touch-manipulation"
      >
        <span className={`text-lg md:text-2xl font-[900] tracking-tight transition-all duration-300 ${isOpen ? 'text-[#004a99]' : 'text-slate-900 group-hover:text-[#004a99]'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 ml-4 md:ml-6 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#004a99] text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 pb-8 md:pb-10 px-6 md:px-10' : 'max-h-0 opacity-0 px-6 md:px-10'}`}
      >
        <div className="pl-6 md:pl-8 border-l-4 border-slate-200 mb-6 md:mb-8">
          <p className="text-base md:text-xl text-slate-700 leading-relaxed font-bold">
            {answer}
          </p>
        </div>
        
        {/* Smart Call Shortcut */}
        <div className="bg-slate-50 rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
           <p className="text-[11px] md:text-[13px] font-[900] text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Direct Specialist Access</p>
           <button 
             onClick={() => {
                const el = document.getElementById('sarah-agent');
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }}
             className={`w-full md:w-auto flex items-center justify-center gap-4 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-[900] text-[13px] md:text-[14px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl touch-manipulation ${recommendedAgent === 'SARAH' ? 'bg-[#004a99] text-white shadow-blue-900/20' : 'bg-red-600 text-white shadow-red-900/20'}`}
           >
             <span>Ask {recommendedAgent === 'SARAH' ? 'Sarah' : 'Mike'} Now</span>
             <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How does the $7,500 rebate program work?",
      answer: "This provincial program is designed for GTA homeowners transitioning from oil, electric, or low-efficiency gas systems to hybrid heat pump technology. Sarah can verify your specific property eligibility and schedule the mandatory pre-installation energy audit required for funding approval.",
      recommendedAgent: 'SARAH' as const
    },
    {
      question: "Are your technicians TSSA certified and insured?",
      answer: "Absolutely. Every Dr. HVAC technician is TSSA-certified, HRAI-member verified, and fully insured for residential and commercial work across Ontario. Mike can provide specific technician ID numbers and proof of insurance for your records upon dispatch.",
      recommendedAgent: 'MIKE' as const
    },
    {
      question: "What's included in the 4-hour emergency guarantee?",
      answer: "If your system fails during peak weather conditions (extreme cold or heat), we guarantee a specialist will be at your door within 4 hours. This applies to all primary GTA zones. If Mike can't get a tech there in that window, your diagnostic fee is 100% waived.",
      recommendedAgent: 'MIKE' as const
    },
    {
      question: "Do you service Toronto high-rise condos and apartments?",
      answer: "Yes, we have a specialized team for condo fan coil units and PTAC systems common in the Downtown core. Sarah handles these specialized quotes which often require specific building management coordination and insurance certificates.",
      recommendedAgent: 'SARAH' as const
    },
    {
      question: "Can I get an installation quote over the phone?",
      answer: "Sarah can provide an 'Executive Estimate' over the phone based on your home's square footage and current ventilation. For a fixed-price guarantee, she will coordinate a 15-minute video walkthrough or on-site audit with a senior estimator.",
      recommendedAgent: 'SARAH' as const
    },
    {
      question: "Are there financing options for major repairs?",
      answer: "We offer flexible 0% interest financing for up to 24 months through our lending partners. Sarah can run a 'soft-check' qualification during your conversation to see which low-monthly payment plans apply to your project.",
      recommendedAgent: 'SARAH' as const
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-24 md:mt-40 px-0 md:px-4">
      <div className="text-center mb-16 md:mb-24">
        <div className="inline-block px-6 md:px-8 py-2 md:py-3 bg-[#004a99]/5 rounded-full mb-6 md:mb-8 border border-[#004a99]/10">
          <h3 className="text-[13px] md:text-[15px] font-[900] text-[#004a99] uppercase tracking-[0.4em] md:tracking-[0.5em]">Knowledge Base</h3>
        </div>
        <h2 className="text-4xl md:text-7xl font-[900] text-black tracking-tighter leading-tight px-4 md:px-0">Expert Guidance<br/><span className="text-[#f37021]">On Demand.</span></h2>
      </div>
      
      <div className="space-y-2 md:space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question} 
            answer={faq.answer} 
            recommendedAgent={faq.recommendedAgent}
          />
        ))}
      </div>
      
      <div className="mt-20 md:mt-32 text-center px-4 md:px-0">
        <div className="bg-[#1a2333] rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-16 relative overflow-hidden group shadow-2xl border-4 border-white/5">
           <div className="absolute top-0 right-0 w-40 md:w-80 h-40 md:h-80 bg-blue-500/10 rounded-full -mr-20 md:-mr-40 -mt-20 md:-mt-40 blur-2xl md:blur-3xl transition-all group-hover:bg-blue-500/20 duration-1000"></div>
           <div className="absolute bottom-0 left-0 w-40 md:w-80 h-40 md:h-80 bg-orange-500/5 rounded-full -ml-20 md:-ml-40 -mb-20 md:-mb-40 blur-2xl md:blur-3xl"></div>
           
           <p className="text-white font-[900] text-2xl md:text-4xl tracking-tight mb-8 md:mb-10 relative z-10">Prefer the Human touch?</p>
           <a 
             href="tel:2894984082" 
             className="relative z-10 inline-flex items-center gap-4 md:gap-6 bg-[#f37021] text-white px-10 md:px-16 py-6 md:py-8 rounded-[1.5rem] md:rounded-[2rem] font-[900] text-lg md:text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_30px_60px_-15px_rgba(243,112,33,0.5)] touch-manipulation"
           >
              <span>Call Head Office</span>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
           </a>
           <p className="text-white/30 font-[900] text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.6em] mt-8 md:mt-10 relative z-10">Average hold time under 60 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
