import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const TimelineSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full">
            Schedule & Important Dates
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Event Timeline 2026
          </h2>
        </div>

        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Stage 1</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">Registration Opens</h4>
            <p className="text-xs text-slate-600 mt-1">Open for all students across India</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Stage 2</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">Registration Closes</h4>
            <p className="text-xs text-slate-600 mt-1">{EVENT_CONFIG.registrationDeadline}</p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500 text-white text-left shadow-lg">
            <div className="flex items-center gap-2 text-amber-100 font-bold text-xs uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>MAIN EVENT</span>
            </div>
            <h4 className="font-bold text-white text-base">Gandhi Jayanti Quiz</h4>
            <p className="text-xs text-amber-100 mt-1">2 October 2026 (Online Portal)</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Stage 4</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">Results & Certificates</h4>
            <p className="text-xs text-slate-600 mt-1">{EVENT_CONFIG.resultsReleaseDate}</p>
          </div>

        </div>

      </div>
    </section>
  );
};
