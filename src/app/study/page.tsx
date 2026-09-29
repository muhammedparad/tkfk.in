'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { BookOpen, ArrowLeft, ArrowRight, Download, FileText, ExternalLink, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

export default function StudyPage() {
  const [activePdf, setActivePdf] = useState<'malayalam' | 'english'>('malayalam');

  const currentPdf = EVENT_CONFIG.studyPdfs?.find(p => p.id === activePdf) || {
    id: 'malayalam',
    language: 'Malayalam',
    languageNative: 'മലയാളം',
    title: 'TKFK Gandhi Jayanti Quiz 2026 - Study Module',
    filename: 'TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module_Malayalam.pdf',
    url: EVENT_CONFIG.studyPdfMalayalamUrl || '/PDF/TKFK%20Gandhi%20Jayanti%20Quiz%202026%20-%20Study%20Module.pdf',
    size: '1.27 MB',
    badge: 'Malayalam (മലയാളം)',
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Registration Callout Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                Official Study Booklet
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Available in Malayalam &amp; English
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold">
              Gandhi Knowledge Challenge 2026 Preparation Guide
            </h2>
            <p className="text-xs text-emerald-100">
              Download the official study module PDFs in your preferred language to prepare for the October 2 online competition.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <a
              href={EVENT_CONFIG.studyPdfMalayalamUrl || "/PDF/TKFK%20Gandhi%20Jayanti%20Quiz%202026%20-%20Study%20Module.pdf"}
              download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module_Malayalam.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00835d] hover:bg-[#007050] text-white font-bold px-4 py-2.5 rounded-full text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Malayalam PDF (1.27 MB)</span>
            </a>

            <a
              href={EVENT_CONFIG.studyPdfEnglishUrl || "/PDF/TKFK_Gandhi_Quiz_Study_Module_260928_182039.pdf"}
              download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module_English.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-full text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>English PDF (63 KB)</span>
            </a>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-4 py-2.5 rounded-full text-xs shadow-sm flex-shrink-0 transition-all ml-auto lg:ml-0"
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
              Official PDF Study Booklets
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Complete Reference Guides • Covers Gandhi&apos;s Life, History, Philosophy &amp; Key Milestones
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Dual Language PDF Download Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Malayalam Edition */}
          <div className={`p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
            activePdf === 'malayalam'
              ? 'bg-[#f0f9f5] border-[#00966b] ring-2 ring-[#00966b]/20 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#00835d] font-extrabold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-[#00835d]" />
                  <span>Malayalam Edition (മലയാളം)</span>
                </div>
                <span className="text-[11px] font-bold bg-[#c2f0dc] text-[#007050] px-2.5 py-0.5 rounded-full">
                  1.27 MB
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                TKFK Gandhi Jayanti Quiz 2026 - Study Module (Malayalam)
              </h3>
              
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Complete comprehensive Malayalam study guide covering Gandhiji&apos;s childhood, South African campaigns, Indian Freedom struggle, and Gandhian philosophy.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
              <a
                href={EVENT_CONFIG.studyPdfMalayalamUrl || "/PDF/TKFK%20Gandhi%20Jayanti%20Quiz%202026%20-%20Study%20Module.pdf"}
                download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module_Malayalam.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#00966b] hover:bg-[#00835d] text-white font-bold px-4 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Malayalam PDF</span>
              </a>

              <a
                href={EVENT_CONFIG.studyPdfMalayalamUrl || "/PDF/TKFK%20Gandhi%20Jayanti%20Quiz%202026%20-%20Study%20Module.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-3 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open</span>
              </a>

              <button
                type="button"
                onClick={() => setActivePdf('malayalam')}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activePdf === 'malayalam'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Card 2: English Edition */}
          <div className={`p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
            activePdf === 'english'
              ? 'bg-[#eff6ff] border-[#2563eb] ring-2 ring-[#2563eb]/20 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#2563eb] font-extrabold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-[#2563eb]" />
                  <span>English Edition</span>
                </div>
                <span className="text-[11px] font-bold bg-[#dbeafe] text-[#1d4ed8] px-2.5 py-0.5 rounded-full">
                  63 KB
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                TKFK Gandhi Knowledge Challenge 2026 - Study Module (English)
              </h3>
              
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Official concise English study booklet covering key historical milestones, Satyagraha principles, timelines, and Gandhi&apos;s legacy for all nationwide participants.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
              <a
                href={EVENT_CONFIG.studyPdfEnglishUrl || "/PDF/TKFK_Gandhi_Quiz_Study_Module_260928_182039.pdf"}
                download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module_English.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-4 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download English PDF</span>
              </a>

              <a
                href={EVENT_CONFIG.studyPdfEnglishUrl || "/PDF/TKFK_Gandhi_Quiz_Study_Module_260928_182039.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-3 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open</span>
              </a>

              <button
                type="button"
                onClick={() => setActivePdf('english')}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activePdf === 'english'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>

        </div>

        {/* Embedded PDF Viewer with Interactive Language Selector Tabs */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>PDF Document Preview</span>
              </h4>
              <p className="text-xs text-slate-500">
                Viewing: <strong className="text-slate-800">{currentPdf.title}</strong>
              </p>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-2">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActivePdf('malayalam')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePdf === 'malayalam'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Malayalam (1.27 MB)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePdf('english')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePdf === 'english'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English (63 KB)
                </button>
              </div>

              <a
                href={currentPdf.url}
                download={currentPdf.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                title={`Download ${currentPdf.language} PDF`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 min-h-[600px]">
            <iframe
              key={activePdf}
              src={currentPdf.url}
              className="w-full h-[750px] border-0"
              title={`${currentPdf.title} PDF Preview`}
            />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

