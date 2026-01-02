import React from 'react';
import DrHVACVoiceAgent from './components/DrHVACVoiceAgent';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Header / Branding */}
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Dr. HVAC
        </h1>
        <p className="text-lg text-slate-600">
          Toronto's Heating & Cooling Specialists
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          4-Hour Emergency Response Guaranteed
        </div>
      </div>

      {/* Main Interface */}
      <DrHVACVoiceAgent />

      {/* Rebate Info Section */}
      <div className="max-w-lg w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
               Gas Heating
            </h3>
            <p className="text-slate-600 text-sm">Up to <span className="font-bold text-slate-900">$2,000</span> in rebates available.</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               Electric / Oil
            </h3>
            <p className="text-slate-600 text-sm">Up to <span className="font-bold text-slate-900">$7,500</span> via HRS Program.</p>
         </div>
      </div>

    </div>
  );
};

export default App;