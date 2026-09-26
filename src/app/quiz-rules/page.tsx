'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Participant } from '@/types';
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

export default function QuizRulesPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);

  const eventTime = new Date(EVENT_CONFIG.eventIsoDate).getTime();
  const isQuizOpen = Date.now() >= eventTime || process.env.NODE_ENV !== 'production';

  useEffect(() => {
    fetch('/api/participant/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.participant && data.isConfirmed && data.participant.participant_id) {
          setParticipant(data.participant);
        } else if (data.participant && !data.isConfirmed) {
          router.push('/payment');
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            Pre-Quiz Briefing
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quiz Rules & Guidelines
          </h1>
          <p className="text-xs text-slate-600">
            Please read these official rules carefully before launching your attempt.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          {/* Specs Bar */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Questions</span>
              <p className="text-lg font-extrabold text-slate-900">{EVENT_CONFIG.totalQuestions} MCQs</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Time Limit</span>
              <p className="text-lg font-extrabold text-slate-900">{EVENT_CONFIG.timeLimitMinutes} Mins</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Negative Marking</span>
              <p className="text-lg font-extrabold text-emerald-700">None</p>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-4 text-xs text-slate-700">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Official Guidelines</h3>
            
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Auto-Saving Answers:</strong>
                Every option you select is saved instantly to the server. If your connection drops, your draft choices remain safely stored.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Server-Enforced Timer:</strong>
                The {EVENT_CONFIG.timeLimitMinutes}-minute countdown starts when you launch your quiz. If the timer expires before manual submission, the server scores your auto-saved answers.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Single Attempt Only:</strong>
                Once submitted, your responses are finalized and evaluated by the system.
              </div>
            </div>
          </div>

          {/* Date Gating or Action Button */}
          <div className="pt-4 space-y-3">
            {!isQuizOpen ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Quiz Portal Scheduled for {EVENT_CONFIG.eventDateDisplay}</h4>
                <p className="text-xs text-slate-600">
                  The active competition interface will open on <strong>{EVENT_CONFIG.eventDateDisplay}</strong>. Prepare using the study modules!
                </p>
                <Link href="/study" className="inline-block bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl text-xs mt-2">
                  Open Study Material
                </Link>
              </div>
            ) : (
              <Link
                href="/quiz"
                className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-base"
              >
                <span>I Understand — Start Quiz Attempt</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            
            <p className="text-center text-[11px] text-slate-400">
              Logged in as: <strong className="text-slate-700">{participant?.name || 'Participant'}</strong> ({participant?.participant_id || 'CONFIRMED'})
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
