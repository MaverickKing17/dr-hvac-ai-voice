
import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  recommendedAgent: 'SARAH' | 'MIKE';
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, recommendedAgent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`transition-all duration-500 rounded-[2.5rem] mb-6 border-2 ${isOpen ? 'bg-white border-[#004a99]/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]' : 'bg-white/50 border-slate-50 hover:border-slate-200'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 px-10 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-xl md:text-2xl font-black tracking-tight transition-all duration-300 ${isOpen ? 'text-[#004a99]' : 'text-slate-900 group-hover:text-[#004a99]'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 ml-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#004a99] text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-10 px-10' : 'max-h-0 opacity-0 px-10'}`}
      >
        <div className="pl-8 border-l-4 border-slate-100 mb-8">
          <p className="text-lg text-slate-600 leading-relaxed font-semibold">
            {answer}
          </p>
        </div>
        
        {/* Smart Call Shortcut */}
        <div className="bg-slate-50 rounded-[1.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Still have questions?</p>
           <button 
             onClick={() => {
                const el = document.getElementById('sarah-agent');
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }}
             className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${recommendedAgent === 'SARAH' ? 'bg-[#004a99] text-white shadow-lg shadow-blue-900/20' : 'bg-red-600 text-white shadow-lg shadow-red-900/20'}`}
           >
             <span>Ask {recommendedAgent === 'SARAH' ? 'Sarah' : 'Mike'} Directly</span>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
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
      answer: "The program is specifically for homeowners switching from oil or electric heating to high-efficiency heat pumps. Sarah can instantly check your property eligibility and help you coordinate the necessary home energy audit.",
      recommendedAgent: 'SARAH' as const
    },
    {
      question: "What's included in the 4-hour guarantee?",
      answer: "If your furnace fails in winter or your AC dies in a heatwave, Mike will prioritize your dispatch. We guarantee a licensed tech at your door within 4 hours, or the diagnostic fee is $0.",
      recommendedAgent: 'MIKE' as const
    },
    {
      question: "Can I get an installation quote over the phone?",
      answer: "Absolutely. Sarah can guide you through the initial sizing requirements and provide a ballpark estimate based on current Toronto market rates and equipment availability.",
      recommendedAgent: 'SARAH' as const
    },
    {
      question: "Are there financing options available?",
      answer: "Yes, we offer 0% interest and low-monthly payment plans that often cost less than your monthly energy savings. Ask Sarah for current Dr. HVAC financing specials.",
      recommendedAgent: 'SARAH' as const
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-32 px-4">
      <div className="text-center mb-16">
        <div className="inline-block px-6 py-2 bg-blue-50 rounded-full mb-6">
          <h3 className="text-[14px] font-black text-[#004a99] uppercase tracking-[0.4em]">Resource Center</h3>
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-black tracking-tighter">Everything You Need To Know</h2>
      </div>
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question} 
            answer={faq.answer} 
            recommendedAgent={faq.recommendedAgent}
          />
        ))}
      </div>
      
      <div className="mt-20 text-center">
        <div className="bg-[#1a2333] rounded-[3rem] p-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:scale-150"></div>
           <p className="text-white font-black text-2xl tracking-tight mb-6">Need to speak with a human team member?</p>
           <a 
             href="tel:2894984082" 
             className="inline-flex items-center gap-4 bg-[#f37021] text-white px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-500/40"
           >
              <span>Connect To Live Support</span>
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </span>
           </a>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
