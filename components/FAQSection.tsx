
import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`transition-all duration-300 rounded-[2rem] mb-5 border-2 ${isOpen ? 'bg-white border-[#004a99]/20 shadow-xl' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-10 px-10 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-[22px] font-black tracking-tight transition-all duration-300 ${isOpen ? 'text-[#004a99] translate-x-2' : 'text-slate-950 group-hover:text-[#004a99] group-hover:translate-x-2'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 ml-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#004a99] text-white rotate-180 shadow-lg' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100 pb-12 px-10' : 'max-h-0 opacity-0 px-10'}`}
      >
        <div className="pl-0 border-l-8 border-blue-100 ml-1 pl-10">
          <p className="text-[20px] text-black leading-relaxed font-bold">
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
    },
    {
      question: "What financing options do you offer?",
      answer: "We offer industry-leading financing including 0% interest for 6-12 months O.A.C., and low-interest monthly payment plans designed to make energy-efficient upgrades affordable for every GTA homeowner."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-24 px-4">
      <div className="text-center mb-16">
        <h3 className="text-[17px] font-black text-[#f37021] uppercase tracking-[0.5em] mb-4">Customer Support Center</h3>
        <h2 className="text-6xl font-black text-black tracking-tighter">Frequently Asked Questions</h2>
      </div>
      
      <div className="bg-white rounded-[4rem] shadow-2xl border-4 border-slate-100 p-12 md:p-16">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
      
      <div className="mt-20 text-center">
        <p className="text-[19px] text-slate-900 font-black uppercase tracking-widest">
          Need more help? <span className="text-[#004a99] hover:text-[#f37021] cursor-pointer transition-colors border-b-4 border-blue-200 pb-1 ml-2">Speak with a Live Human Dispatcher</span>
        </p>
      </div>
    </div>
  );
};

export default FAQSection;
