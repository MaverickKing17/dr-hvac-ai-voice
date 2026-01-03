import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`transition-all duration-300 rounded-2xl mb-2 ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 px-4 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-[15px] font-bold tracking-tight transition-all duration-300 ${isOpen ? 'text-[#004a99] translate-x-1' : 'text-slate-700 group-hover:text-[#004a99] group-hover:translate-x-1'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#004a99] text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100 pb-6 px-4' : 'max-h-0 opacity-0 px-4'}`}
      >
        <div className="pl-0 border-l-2 border-blue-100 ml-1 pl-4">
          <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How does the $7,500 rebate program work?",
      answer: "The HRS Program provides up to $7,500 for Toronto homeowners currently heating with oil or electricity who switch to an energy-efficient cold-climate heat pump."
    },
    {
      question: "What exactly is the 4-hour emergency guarantee?",
      answer: "For urgent no-heat or no-cool situations, we guarantee a technician arrival within 4 hours of your call, or we'll waive your diagnostic fee entirely."
    },
    {
      question: "Can Sarah book my regular maintenance?",
      answer: "Absolutely. Just tell Sarah you'd like to schedule a tune-up. She'll gather your info and pass it to our dispatchers who will call to confirm a time that works for you."
    },
    {
      question: "Is Sarah a real person?",
      answer: "Sarah is our custom AI Specialist. She's available 24/7 to provide instant quotes, check rebate eligibility, and handle emergency priority dispatching."
    },
    {
      question: "What financing options do you offer?",
      answer: "We offer several plans, including O.A.C. 6 months with 0% interest and 0 payments, as well as long-term low-monthly-payment options for new installs."
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-24 px-4">
      <div className="text-center mb-10">
        <h3 className="text-[11px] font-black text-[#f37021] uppercase tracking-[0.4em] mb-3">Service & Support FAQ</h3>
        <h2 className="text-3xl font-black text-[#1a2333] tracking-tighter">Common Questions</h2>
      </div>
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100 p-6 md:p-10">
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">
          Still have questions? <span className="text-[#004a99] hover:text-[#f37021] cursor-pointer transition-colors border-b-2 border-blue-100 pb-0.5 ml-1">Chat with a human expert</span>
        </p>
      </div>
    </div>
  );
};

export default FAQSection;