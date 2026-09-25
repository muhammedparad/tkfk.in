import React from 'react';
import { EVENT_CONFIG } from '@/lib/config';
import { BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
            About The Challenge
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Honoring Mahatma Gandhi through Knowledge & Truth
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            The Gandhi Knowledge Challenge 2026 is an online national-level competition organized by <span className="font-bold text-slate-900">{EVENT_CONFIG.organizer}</span> on Gandhi Jayanti (2 October 2026).
          </p>
        </div>

        <div className="mt-8 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100/80 shadow-xs space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Curated 10 Modules</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Covers Gandhi&apos;s early life, South African movements, Satyagraha philosophy, freedom struggle, and global legacy.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-100/80 shadow-xs space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Fair & Verified</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Server-enforced timing, secure auto-saving, anti-fraud auditing, and controlled verification before result declaration.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-sky-50/50 to-white border border-sky-100/80 shadow-xs space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Prizes & Certificates</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              First prize of {EVENT_CONFIG.firstPrizeDisplay}, merit trophies, and downloadable verified certificates for all participants.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
