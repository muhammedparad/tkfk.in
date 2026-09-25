import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  { step: '01', title: 'Register Online', desc: 'Fill out your basic details (Name, Email, Phone, State) on the portal.' },
  { step: '02', title: 'Complete Payment (₹99)', desc: 'Process the registration fee via secure payment system.' },
  { step: '03', title: 'Receive Participant ID', desc: 'Get your unique ID in format TKFK26-XXXXXX for login.' },
  { step: '04', title: 'Study Provided Material', desc: 'Access 10 curated Gandhian history modules from your portal.' },
  { step: '05', title: 'Attempt Quiz on 2 Oct', desc: 'Complete 50 questions in 25 minutes with live server auto-save.' },
  { step: '06', title: 'Download Verified Cert', desc: 'After TKFK verification, download your rank card and certificate.' },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-20 bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-800">
            Step-By-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How The Competition Works
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Participate seamlessly from your smartphone or computer in 6 simple steps.
          </p>
        </div>

        <div className="mt-8 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {STEPS.map((item) => (
            <div key={item.step} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-start gap-4 active:scale-[0.99] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 font-extrabold font-mono text-sm flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                {item.step}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-2xl sm:rounded-full shadow-lg text-sm sm:text-base transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>Start Registration Now (₹99)</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};
