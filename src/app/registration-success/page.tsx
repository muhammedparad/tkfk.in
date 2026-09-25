'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticipantIdCardCanvas } from '@/components/ui/ParticipantIdCardCanvas';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  CheckCircle2, 
  BookOpen, 
  Award, 
  LogIn, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  Download
} from 'lucide-react';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<any | null>(null);
  const [registration, setRegistration] = useState<any | null>(null);
  const [studyConfig, setStudyConfig] = useState<{ url: string; title: string }>({
    url: '/study',
    title: 'Official Gandhi Knowledge Challenge 2026 Preparation Modules'
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/participant/me');
        const data = await res.json();

        if (res.ok && data.participant && data.registration) {
          if (data.registration.payment_status !== 'SUCCESS') {
            setErrorMsg('Payment verification is pending. Please complete payment to confirm your registration.');
          } else {
            setParticipant(data.participant);
            setRegistration(data.registration);
            if (data.studyMaterial) {
              setStudyConfig(data.studyMaterial);
            }
          }
        } else {
          setErrorMsg(data.error || 'Registration record not found or server verification failed.');
        }
      } catch {
        setErrorMsg('Failed to fetch confirmed registration record.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm sm:text-base">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Verifying Server Registration Record...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !participant || registration?.payment_status !== 'SUCCESS') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-grow flex items-center justify-center p-6 outline-none">
          <div 
            role="alert" 
            aria-live="assertive" 
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Registration Verification Pending</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {errorMsg || 'Proof of payment must be verified server-side before accessing confirmed registration.'}
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/payment" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                Complete Payment Now
              </Link>
              <Link href="/login" className="inline-block text-sm font-semibold text-slate-600 hover:underline">
                Go to Participant Login
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const name = participant.name || 'Valued Participant';
  const pId = participant.participant_id;

  // Real masked phone format - NEVER fabricate fake phone string
  const rawPhone = participant.phone ? String(participant.phone).trim() : '';
  const maskedPhone = participant.masked_phone 
    ? participant.masked_phone 
    : (rawPhone.length >= 10 
        ? `${rawPhone.slice(0, 2)}******${rawPhone.slice(-2)}` 
        : (rawPhone || null));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8 outline-none">
        
        {/* Success Header Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-200">
            REGISTRATION CONFIRMED
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Congratulations, {name}!
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Your registration for the TKFK Gandhi Knowledge Challenge 2026 is officially confirmed.
          </p>
        </div>

        {/* EXACTLY THREE CARDS DESIGN: Study Material | Participant ID Card (with generator) | Quiz Portal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: STUDY MATERIAL */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Study Material</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prepare for the Gandhi Jayanti 2026 Knowledge Challenge with structured study resources and reading materials.
              </p>
            </div>

            <a
              href={EVENT_CONFIG.studyPdfUrl}
              download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-sm transition-all active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Download Official PDF Guide</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* CARD 2: PARTICIPANT ID CARD (Preview + Download fully inside Card 2) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between md:col-span-1">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Participant ID Card</h2>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Official Participant ID</span>
                <p className="text-xl font-extrabold text-emerald-700 font-mono tracking-wider">{pId}</p>
              </div>

              {/* ID Card Generator Canvas embedded cleanly inside Card 2 */}
              <div className="pt-2">
                <ParticipantIdCardCanvas
                  participantName={name}
                  participantId={pId}
                  eventDateDisplay={EVENT_CONFIG.eventDateDisplay || "2 October 2026"}
                />
              </div>
            </div>
          </div>

          {/* CARD 3: QUIZ PORTAL */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Quiz Portal</h2>
              
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Participant ID</span>
                  <span className="font-mono font-bold text-slate-900">{pId}</span>
                </div>
                {maskedPhone && (
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Registered Mobile</span>
                    <span className="font-mono font-bold text-slate-700">{maskedPhone}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Access your candidate portal to practice mock tests and enter the active quiz room on event day.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
