'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Participant } from '@/types';
import { CheckCircle2, Lock, Clock, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function QuizCompletedPage() {
  const [participant, setParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    fetch('/api/participant/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.participant) {
          setParticipant(data.participant);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full text-center space-y-6">
        
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full">
          Quiz Attempt Submitted
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank You, {participant?.name || 'Participant'}!
        </h1>

        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Your answers have been securely logged on the server.
        </p>

        {/* Controlled Release Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4 text-left">
          
          <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs font-bold">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <span>Controlled Academic Results Release</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            In accordance with TKFK competition rules, final score breakdowns, answer solutions, rankings, and downloadable certificates are subject to anti-fraud academic review.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Scheduled Results Announcement:</span>
            <p className="text-emerald-700 font-bold">{EVENT_CONFIG.resultsReleaseDate}</p>
          </div>

        </div>

        <div className="pt-4 space-y-3">
          <Link
            href="/results"
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-sm"
          >
            <span>Check Results Release Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-xs"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Participant Dashboard</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
