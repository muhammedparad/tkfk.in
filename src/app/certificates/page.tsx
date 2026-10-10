'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Award, ArrowRight, CheckCircle2, Home } from 'lucide-react';

export default function CertificatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex items-center justify-center">
        
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-lg text-center space-y-6 w-full">
          
          {/* Concluded Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Event & Distribution Concluded</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Certificate Distribution Closed
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed pt-1">
              The certificate download and issuance window for past competitions (including Gandhi Jayanti Online Quiz 2026) has officially concluded. All records and distributions for this event are closed.
            </p>
          </div>

          {/* Active Contest Highlight */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-left space-y-2">
            <span className="text-[11px] font-bold text-[#0066FF] uppercase tracking-wider block">
              Active Programme
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Digital Poster Creation Contest 2026
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Registrations are currently open for our upcoming national digital design contest. Enter the official community desk and download your official Participant ID pass today!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
            >
              <span>Explore Poster Contest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
