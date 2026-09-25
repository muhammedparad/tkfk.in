'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Trophy, ShieldCheck, Scale, Award } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            Official Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Competition Rules & Prize Breakdown
          </h1>
          <p className="text-xs text-slate-600">
            Gandhi Knowledge Challenge 2026 — 2 October 2026
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>1. Prize Structure & Headline Award</span>
            </h2>
            <p>
              The <strong>First Prize winner</strong> of the Gandhi Knowledge Challenge 2026 will be awarded a cash prize of <strong>{EVENT_CONFIG.firstPrizeDisplay}</strong> along with an official Certificate of Merit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>2. Ranking & Tie-Break Evaluation Protocol</span>
            </h2>
            <p>
              Winner determination and leaderboard ranking are strictly computed by the server using the following 3-tier tie-break algorithm:
            </p>
            <ol className="list-decimal pl-5 space-y-2 font-medium">
              <li>
                <strong>Total Score:</strong> Highest number of correct answers scored out of {EVENT_CONFIG.totalQuestions} questions.
              </li>
              <li>
                <strong>Completion Speed:</strong> In the case of equal scores, the participant who completed the quiz in the shortest time (total duration in seconds) ranks higher.
              </li>
              <li>
                <strong>Earliest Submission Timestamp:</strong> If score and duration are identical, the participant who submitted earlier in time ranks higher.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>3. Legal & Statutory Tax Compliance</span>
            </h2>
            <p>
              <strong>Taxation on Winnings:</strong> Cash prize awards are subject to applicable Indian Income Tax regulations, including Tax Deducted at Source (TDS) under Section 194B of the Income Tax Act 1961 where applicable. Winners must provide valid PAN and identity verification details prior to prize disbursement.
            </p>
            <p>
              <strong>Prize Competition Standards:</strong> This event is conducted purely as an educational knowledge assessment competition based on skill, historical knowledge, and academic study of Mahatma Gandhi&apos;s life and philosophy. It does not constitute gambling or betting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. General Competition Rules</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each participant is permitted exactly one registered attempt.</li>
              <li>The quiz contains {EVENT_CONFIG.totalQuestions} multiple-choice questions with a maximum duration of {EVENT_CONFIG.timeLimitMinutes} minutes.</li>
              <li>All participant decisions by the {EVENT_CONFIG.organizer} Academic Committee are final and binding.</li>
            </ul>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
