'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Participant } from '@/types';
import { CheckCircle2, Lock, LayoutDashboard, ArrowRight, Play, RefreshCw, AlertCircle } from 'lucide-react';

export default function QuizCompletedPage() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const meRes = await fetch('/api/participant/me');
        const meData = await meRes.json();
        if (meData.success && meData.participant) {
          setParticipant(meData.participant);
        }

        const sessRes = await fetch('/api/quiz/session?checkOnly=true');
        const sessData = await sessRes.json();
        if (sessData.session) {
          setSessionStatus(sessData.session.status);
        } else {
          setSessionStatus('NONE');
        }
      } catch {}
      setLoading(false);
    }

    checkStatus();
  }, []);

  const canAttemptQuiz = sessionStatus === 'NONE' || sessionStatus === 'IN_PROGRESS';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full text-center space-y-6">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold">Checking submission status...</span>
          </div>
        ) : canAttemptQuiz ? (
          /* Participant has 0 sessions or active reset session -> ALLOW RETRY */
          <div className="space-y-6 animate-in fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Play className="w-10 h-10 ml-1 fill-emerald-600 text-emerald-600" />
            </div>

            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
              Quiz Attempt Unlocked & Active
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready to Take the Quiz, {participant?.name || 'Participant'}?
            </h1>

            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Your quiz attempt is available. You have <strong>25 minutes</strong> to complete the 50 multiple choice questions.
            </p>

            <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-xl space-y-4 text-left">
              <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>Single Attempt Access Granted</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure you are in a quiet room, have stable internet, and grant camera permission before beginning.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                href="/quiz-rules"
                className="w-full flex items-center justify-center gap-3 bg-[#00966b] hover:bg-[#00835d] text-white font-extrabold py-4 rounded-2xl shadow-lg transition-all text-sm sm:text-base cursor-pointer"
              >
                <span>Start Quiz Attempt Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Participant Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Normal Submitted State */
          <div className="space-y-6 animate-in fade-in">
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
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
