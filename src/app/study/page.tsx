'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { STUDY_MODULES } from '@/lib/config';
import { BookOpen, Clock, ChevronRight, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function StudyPage() {
  const [activeModuleId, setActiveModuleId] = useState(STUDY_MODULES[0].id);
  const activeMod = STUDY_MODULES.find(m => m.id === activeModuleId) || STUDY_MODULES[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Registration Callout Banner */}
        <div className="bg-emerald-600 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full">
              Open Access Study Material
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold">
              Preparing for Gandhi Knowledge Challenge 2026?
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              Access all 10 official modules below. Register for ₹99 to participate in the October 2 online competition and earn your verified certificate.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-full text-xs shadow-sm flex-shrink-0 transition-all"
          >
            <span>Register Now (₹99)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
              Preparation Hub
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Gandhi Knowledge Study Material
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              10 Comprehensive Modules • Covers History, Philosophy &amp; Key Events
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Layout Grid: Sidebar Selector + Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Module Selector Sidebar */}
          <div className="lg:col-span-4 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
              Select Module (1 to 10)
            </h3>
            <div className="space-y-2">
              {STUDY_MODULES.map((mod) => {
                const isActive = mod.id === activeModuleId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleId(mod.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm leading-tight">{mod.title}</h4>
                      <p className={`text-[11px] mt-1 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {mod.read_time}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Reader Container */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-5 space-y-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {activeMod.read_time}
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
                {activeMod.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {activeMod.description}
              </p>
            </div>

            {/* Key Examination Highlights */}
            <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Key Examination Takeaways</span>
              </h4>
              <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                {activeMod.key_points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Lesson Body */}
            <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line pt-2">
              {activeMod.content}
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
