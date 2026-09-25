'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Participant, QuizSession, Certificate, ResultsReleaseConfig } from '@/types';
import { CertificateCanvas } from '@/components/ui/CertificateCanvas';
import { Lock, Award, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [releaseConfig, setReleaseConfig] = useState<ResultsReleaseConfig>({ published: false });

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/participant/me');
        const meData = await meRes.json();
        if (!meRes.ok || !meData.success || !meData.participant) {
          router.push('/login');
          return;
        }

        const p: Participant = meData.participant;
        setParticipant(p);

        const res = await fetch('/api/results');
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.releaseConfig) setReleaseConfig(data.releaseConfig);
          if (data.session) setSession(data.session);
          if (data.certificate) setCertificate(data.certificate);
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-semibold">
        Loading Results & Certificate Portal...
      </div>
    );
  }

  if (!participant) return null;

  const totalQ = session?.total_questions || 50;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
              Results & Certificate Center
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
              Official Performance Scorecard
            </h1>
            <p className="text-xs text-slate-500">
              Participant ID: <span className="font-mono font-bold text-emerald-700">{participant.participant_id}</span>
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Controlled Release Check */}
        {!releaseConfig.published ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center max-w-2xl mx-auto space-y-6">
            
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Release Verification Pending
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Official Results Lock
              </h2>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              {releaseConfig.note || "Quiz attempt responses are currently undergoing academic review by the TKFK Committee. Official scores and downloadable certificates will unlock post-verification."}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md mx-auto">
              <strong className="block font-bold text-slate-900">Submission Receipt:</strong>
              <span>Status: <strong className="text-emerald-700 font-bold">ATTEMPT SUBMITTED</strong></span>
            </div>

          </div>
        ) : certificate ? (
          <div className="space-y-8">
            
            {/* Scorecard Banner */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Secured</span>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1">{session?.score || 0} / {totalQ}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Percentage</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{certificate.score_percentage}%</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Award Grade</span>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{certificate.grade}</p>
              </div>
            </div>

            {/* PNG Canvas Certificate View */}
            <CertificateCanvas certificate={certificate} participant={participant} />

          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
            <p className="text-xs text-slate-600">Please complete the quiz attempt first.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
