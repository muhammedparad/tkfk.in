'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { BookOpen, ArrowLeft, ArrowRight, Download, FileText, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StudyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Registration Callout Banner */}
        <div className="bg-emerald-600 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full">
              Official Study Booklet
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold">
              Gandhi Knowledge Challenge 2026 Preparation Guide
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              Download the official study module PDF for all registered participants to prepare for the October 2 online competition.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={EVENT_CONFIG.studyPdfUrl}
              download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-950 hover:bg-black text-white font-bold px-5 py-3 rounded-full text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download PDF Guide (1.27 MB)</span>
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-5 py-3 rounded-full text-xs shadow-sm flex-shrink-0 transition-all"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
              Preparation Hub
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Official PDF Study Booklet
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Complete Reference Guide • Covers Gandhi&apos;s Life, History, Philosophy &amp; Key Milestones
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={EVENT_CONFIG.studyPdfUrl}
              download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-sm transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF (1.27 MB)</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Primary PDF Download Action Box */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>TKFK Official Publication</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold">
                TKFK Gandhi Jayanti Quiz 2026 - Study Module.pdf
              </h3>
              <p className="text-xs text-slate-300">
                Format: PDF Document • File Size: 1.27 MB • Full Syllabus for Gandhi Knowledge Challenge 2026
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <a
                href={EVENT_CONFIG.studyPdfUrl}
                download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-xs shadow-lg transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Booklet</span>
              </a>
              <a
                href={EVENT_CONFIG.studyPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3.5 rounded-xl text-xs border border-slate-700 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open PDF in New Tab</span>
              </a>
            </div>
          </div>

          {/* Embedded PDF Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>PDF Document Preview</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">1.27 MB</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 min-h-[600px]">
              <iframe
                src={EVENT_CONFIG.studyPdfUrl}
                className="w-full h-[750px] border-0"
                title="TKFK Gandhi Jayanti Quiz 2026 - Study Module PDF"
              />
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
