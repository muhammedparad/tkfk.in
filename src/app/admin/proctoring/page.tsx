'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ShieldCheck, Users, PlayCircle, ArrowRight } from 'lucide-react';

export default function AdminLiveProctoringPage() {
  return (
    <div className="flex min-h-screen bg-[#0d0c0a] text-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[#141412] border border-[#262522] p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/50">
              Feature Decommissioned
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight pt-2">
              Camera & Video Surveillance Retired
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Camera and video proctoring features have been permanently retired to ensure optimal system reliability, low latency, and zero bandwidth overhead during peak examination hours.
            </p>
          </div>

          <div className="p-4 bg-[#1b1a17] rounded-2xl border border-[#2e2d29] text-left text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-white">Active Examination Safeguards Preserved:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Full-screen lock & blur/tab-switch instant termination</li>
              <li>Server-side 25-minute countdown verification</li>
              <li>Single active session token locking & audit logging</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/admin/participants"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl text-xs transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Participant Directory</span>
            </Link>
            <Link
              href="/admin/quiz-test"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#262522] hover:bg-[#33322e] text-slate-200 font-medium py-3 rounded-xl text-xs transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Quiz Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
