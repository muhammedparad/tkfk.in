'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Participant, QuizSession, Certificate, ResultsReleaseConfig } from '@/types';
import { CertificateCanvas } from '@/components/ui/CertificateCanvas';
import { Lock, ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-[#706e6a] font-medium text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          <span>Loading Results Portal...</span>
        </div>
      </div>
    );
  }

  if (!participant) return null;

  const totalQ = session?.total_questions || 50;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8 outline-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f0ede8] pb-6">
          <div>
            <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">
              PERFORMANCE RECORD
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-[-0.03em]">
              Official Performance Scorecard
            </h1>
            <p className="text-xs text-[#706e6a]">
              Participant ID: <span className="font-mono font-semibold text-[#ff6b35]">{participant.participant_id}</span>
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#141412] hover:text-[#ff6b35] bg-white px-4 py-2.5 rounded-full border border-[#f0ede8] shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Controlled Release Check */}
        {!releaseConfig.published ? (
          <div className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center max-w-2xl mx-auto space-y-6">
            
            <div className="w-16 h-16 bg-[#f0ede8] text-[#ff6b35] rounded-full flex items-center justify-center mx-auto border border-[#f0ede8]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#ff6b35] bg-[#f0ede8] px-3 py-1 rounded-full border border-[#e2ded8]">
                Review Underway
              </span>
              <h2 className="text-2xl font-medium text-[#141412] tracking-tight">
                Official Results Lock
              </h2>
            </div>

            <p className="text-[#706e6a] text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-normal">
              {releaseConfig.note || "Contest submissions are currently undergoing independent jury review by the TKFK Committee. Official scores, rankings, and downloadable certificates will unlock post-verification."}
            </p>

            <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-xs text-[#706e6a] max-w-md mx-auto space-y-1">
              <strong className="block font-medium text-[#141412]">Submission Status:</strong>
              <span>Verified entry received in records</span>
            </div>

          </div>
        ) : certificate ? (
          <div className="space-y-8">
            
            {/* Scorecard Banner */}
            <div className="bg-white p-8 rounded-[28px] border border-[#f0ede8] shadow-soft grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider">Score Secured</span>
                <p className="text-3xl font-medium text-[#141412] mt-1">{session?.score || 0} / {totalQ}</p>
              </div>
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider">Percentage</span>
                <p className="text-3xl font-medium text-[#141412] mt-1">{certificate.score_percentage}%</p>
              </div>
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider">Award Grade</span>
                <p className="text-3xl font-medium text-[#ff6b35] mt-1">{certificate.grade}</p>
              </div>
            </div>

            {/* PNG Canvas Certificate View */}
            <CertificateCanvas certificate={certificate} participant={participant} />

          </div>
        ) : (
          <div className="bg-white p-8 rounded-[28px] border border-[#f0ede8] text-center shadow-soft">
            <p className="text-xs sm:text-sm text-[#706e6a]">Please complete the competition submission attempt first.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
