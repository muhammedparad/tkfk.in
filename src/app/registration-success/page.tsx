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
  MessageCircle, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

function RegistrationSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<any | null>(null);
  const [registration, setRegistration] = useState<any | null>(null);
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
          <RefreshCw className="w-5 h-5 animate-spin text-[#0066FF]" />
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
              <Link href="/payment" className="inline-block bg-[#0066FF] text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-[#0052cc] transition-colors">
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8 outline-none">
        
        {/* Success Header Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-[#0066FF] rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-200">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
            REGISTRATION CONFIRMED
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Congratulations, {name}!
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Your registration for the <strong>TKFK Digital Poster Creation Contest 2026</strong> is officially confirmed.
          </p>
        </div>

        {/* TWO CORE ACTION CARDS: Official Group + Participant ID Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* CARD 1: JOIN OFFICIAL WHATSAPP GROUP */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <MessageCircle className="w-7 h-7" />
              </div>
              
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Step 1 • Connect with Us
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Join Official WhatsApp Group
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                All competition themes, design guidelines, submission portal links, and updates will be shared directly in the official WhatsApp community.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Receive official poster design themes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Direct support from program coordinators</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Submission window and result announcements</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={EVENT_CONFIG.whatsAppGroupUrl || 'https://chat.whatsapp.com/B8eZA7FCO9wGSYzLfQfBjc'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-4 px-6 rounded-2xl text-sm sm:text-base shadow-sm transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enter Official WhatsApp Group</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* CARD 2: PARTICIPANT ID CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-[#0066FF] rounded-2xl flex items-center justify-center border border-blue-100">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#0066FF] uppercase tracking-wider block mb-1">
                  Step 2 • Your Official Credential
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Participant ID Card
                </h2>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Participant ID</span>
                <span className="text-lg font-extrabold text-[#0066FF] font-mono">{pId}</span>
              </div>

              {/* ID Card Generator Canvas */}
              <div className="pt-1">
                <ParticipantIdCardCanvas
                  participantName={name}
                  participantId={pId}
                  eventDateDisplay={EVENT_CONFIG.eventDateDisplay || "November 2026"}
                />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold py-4 px-6 rounded-2xl text-sm sm:text-base shadow-sm transition-all active:scale-[0.99]"
              >
                <span>Go to My Participant Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
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
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0066FF]" />
          <span>Loading Registration Confirmation...</span>
        </div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
