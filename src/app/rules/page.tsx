'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  Trophy, 
  ShieldCheck, 
  Scale, 
  Award, 
  Camera, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  XCircle, 
  Lock, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Title & Header */}
        <div className="text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 bg-slate-200 px-3.5 py-1 rounded-full">
              Conducted Flagship Event
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Completed
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            GANDHI JAYANTI ONLINE QUIZ — RULES
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {EVENT_CONFIG.organizer} • Conducted in October 2026
          </p>
        </div>

        {/* Transition Notice for Digital Poster Contest */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h3 className="font-bold text-[#0066FF] text-sm sm:text-base">
              Looking for our active competition?
            </h3>
            <p className="text-xs text-slate-600">
              The Gandhi Jayanti Quiz has finished. Registrations are now open for the <strong>Digital Poster Creation Contest 2026</strong>!
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <span>Register for Poster Contest</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Schedule & Key Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="space-y-1 p-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">4 October 2026</p>
          </div>
          <div className="space-y-1 p-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Portal Entry Window</span>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">{EVENT_CONFIG.quizTimingDisplay}</p>
          </div>
          <div className="space-y-1 p-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">50 Questions</p>
          </div>
          <div className="space-y-1 p-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time Allowed</span>
            <p className="text-base sm:text-lg font-extrabold text-emerald-700">30s/Q • 25 Mins</p>
          </div>
        </div>

        {/* Main Rules Content Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          {/* Important Rules Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wide">
                Important Competition Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Individual Attempt</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quiz must be completed strictly <strong>individually</strong>. Exactly <strong>one attempt</strong> per registered participant.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                  <Camera className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Mandatory Camera Access</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Camera access is mandatory.</strong> Only the registered participant should be visible on camera throughout the quiz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Multiple Person Policy</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">
                  More than one person visible on camera → <strong>2 warnings</strong>, then automatic termination.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Strict Tab & App Switching Policy</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">
                  <strong>No switching tabs, apps or windows after starting.</strong> Any switch or backgrounding will lead to <strong>immediate termination</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>Zero Outside Assistance</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No Google, AI tools, other websites, books, messaging apps, or outside assistance allowed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>30 Seconds Per Question</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each question has a <strong>30-second</strong> pacing benchmark, with 25 minutes total exam time limit.
                </p>
              </div>

            </div>
          </section>

          {/* Tie Break & Evaluation Section */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Ranking & Tie-Break Evaluation Protocol</span>
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <ol className="list-decimal pl-5 space-y-1.5 font-medium text-emerald-950 text-xs sm:text-sm">
                <li>
                  <strong>Highest Score:</strong> The participant with the maximum number of correct answers scored out of {EVENT_CONFIG.totalQuestions} wins.
                </li>
                <li>
                  <strong>Shorter Completion Time:</strong> In case of a tie in score, the participant who completed the quiz in the <strong>shorter completion time</strong> will be ranked higher.
                </li>
                <li>
                  <strong>Organiser Decision:</strong> Organisers will monitor the quiz and may disqualify rule violations. Organisers&apos; decision regarding results will be final.
                </li>
              </ol>
            </div>
          </section>

          {/* Prize Section */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Prize Structure</span>
            </h3>
            <p className="text-slate-600">
              The <strong>First Prize winner</strong> of the Gandhi Jayanti Online Quiz 2026 will be awarded <strong>{EVENT_CONFIG.firstPrizeDisplay}</strong> cash prize and an official Certificate of Merit. All active participants receive an authentic Digital Certificate of Participation.
            </p>
          </section>

          {/* Callout Notice */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-2">
            <p className="font-bold text-sm sm:text-base text-emerald-400">
              Be ready before starting. Once the quiz begins, stay focused and follow the rules.
            </p>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
              — The Knowledge Forum Kerala (TKFK) —
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/study"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Prepare with Study Modules
            </Link>
            <Link
              href="/quiz-rules"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 shadow-md"
            >
              <span>Test Camera & Enter Quiz Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
