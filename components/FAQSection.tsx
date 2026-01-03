import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-sm font-bold tracking-tight transition-colors duration-200 ${isOpen ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-500'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {answer}
        </p>
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
    <div className="w-full max-w-lg mx-auto mt-16 px-4">
      <div className="text-center mb-8">
        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Common Questions</h3>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Everything you need to know</h2>
      </div>
      
      <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-slate-100 p-8">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Still have questions? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Chat with a human expert</span>
        </p>
      </div>
    </div>
  );
};

export default FAQSection;
