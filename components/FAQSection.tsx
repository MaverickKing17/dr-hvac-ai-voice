
import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`transition-all duration-300 rounded-3xl mb-4 border-2 ${isOpen ? 'bg-white border-[#004a99]/20 shadow-lg' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 px-8 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-[17px] font-black tracking-tight transition-all duration-300 ${isOpen ? 'text-[#004a99] translate-x-1' : 'text-slate-900 group-hover:text-[#004a99] group-hover:translate-x-1'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#004a99] text-white rotate-180' : 'bg-slate-200 text-slate-600'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[400px] opacity-100 pb-8 px-8' : 'max-h-0 opacity-0 px-8'}`}
      >
        <div className="pl-6 border-l-4 border-blue-100">
          <p className="text-[15px] text-slate-700 leading-relaxed font-semibold">
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
      answer: "The Heat Pump Rebate (HRS) Program provides up to $7,500 for homeowners currently using oil or electric heat who switch to a cold-climate heat pump system. Dr. HVAC handles all the paperwork and audit coordination for you."
    },
    {
      question: "What exactly is the 4-hour emergency guarantee?",
      answer: "We understand that losing heat in a Toronto winter is an emergency. We guarantee a technician will be at your door within 4 hours of your call, or your diagnostic visit is FREE."
    },
    {
      question: "Can Sarah book my regular maintenance?",
      answer: "Yes! Sarah is programmed to gather your address and contact details. Once she has them, our human dispatch team is instantly notified to lock in your preferred time slot."
    },
    {
      question: "Is Sarah a real person?",
      answer: "Sarah is our advanced AI Lead Specialist. She is available 24/7 to provide instant service quotes, verify rebate eligibility, and prioritize emergency dispatching when every minute counts."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 px-4">
      <div className="text-center mb-12">
        <h3 className="text-[13px] font-black text-[#f37021] uppercase tracking-[0.4em] mb-4">Customer Support Center</h3>
        <h2 className="text-4xl font-black text-black tracking-tighter">Frequently Asked Questions</h2>
      </div>
      
      <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 p-8 md:p-12">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[14px] text-slate-500 font-black uppercase tracking-widest">
          Need more help? <a href="https://www.drhvac.ca/contact/" target="_blank" rel="noopener noreferrer" className="text-[#004a99] hover:text-[#f37021] cursor-pointer transition-colors border-b-2 border-blue-100 pb-0.5 ml-2">Speak with a Live Human</a>
        </p>
      </div>
    </div>
  );
};

export default FAQSection;
