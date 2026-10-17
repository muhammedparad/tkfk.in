'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="flex items-center gap-3 text-[#706e6a] font-medium text-sm sm:text-base">
          <div className="w-5 h-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          <span>Verifying Server Registration Record...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !participant || registration?.payment_status !== 'SUCCESS') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f0] text-[#141412] font-sans antialiased">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-grow flex items-center justify-center p-6 pt-32 pb-16 outline-none">
          <div 
            role="alert" 
            aria-live="assertive" 
            className="bg-white p-8 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center max-w-md space-y-4"
          >
            <div className="w-14 h-14 bg-[#fef2f2] text-[#dc2626] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#fed7d7]">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-medium text-[#141412] tracking-tight">Registration Verification Pending</h2>
            <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed">
              {errorMsg || 'Proof of payment must be verified before accessing confirmed registration pass.'}
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/payment" className="inline-block bg-[#ff6b35] hover:bg-[#e85926] text-white px-6 py-3.5 rounded-full text-sm font-medium shadow-xs transition-colors">
                Complete Payment Now
              </Link>
              <Link href="/login" className="inline-block text-xs font-semibold text-[#706e6a] hover:text-[#141412] transition-colors">
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
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10 outline-none">
        
        {/* Success Header Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0ede8] text-[#ff6b35] rounded-full flex items-center justify-center mx-auto shadow-2xs border border-[#f0ede8]">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            REGISTRATION CONFIRMED
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Congratulations, {name}!
          </h1>

          <p className="text-[#706e6a] text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Your registration for the <strong>TKFK Digital Poster Creation Contest 2026</strong> is officially confirmed.
          </p>
        </div>

        {/* TWO CORE ACTION CARDS: Official Group + Participant ID Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* CARD 1: JOIN OFFICIAL WHATSAPP GROUP */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#eef8f2] text-[#16a34a] rounded-2xl flex items-center justify-center border border-[#cbe8d5]">
                <MessageCircle className="w-7 h-7" />
              </div>
              
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#ff6b35] uppercase tracking-wider block mb-1">
                  Step 1 • Connect with Us
                </span>
                <h2 className="text-xl font-medium text-[#141412] tracking-tight">
                  Join Official WhatsApp Group
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                All competition themes, design guidelines, submission portal links, and updates will be shared directly in the official WhatsApp community.
              </p>

              <div className="bg-[#f8f5f0] p-4 rounded-2xl border border-[#f0ede8] text-xs text-[#706e6a] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1e6f42] flex-shrink-0" />
                  <span>Receive official poster design themes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1e6f42] flex-shrink-0" />
                  <span>Direct support from program coordinators</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1e6f42] flex-shrink-0" />
                  <span>Submission window and result announcements</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={EVENT_CONFIG.whatsAppGroupUrl || 'https://chat.whatsapp.com/B8eZA7FCO9wGSYzLfQfBjc'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enter Official WhatsApp Group</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* CARD 2: PARTICIPANT ID CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#f0ede8] text-[#ff6b35] rounded-2xl flex items-center justify-center border border-[#f0ede8]">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-semibold text-[#ff6b35] uppercase tracking-wider block mb-1">
                  Step 2 • Your Official Credential
                </span>
                <h2 className="text-xl font-medium text-[#141412] tracking-tight">
                  Participant ID Card
                </h2>
              </div>

              <div className="p-3 bg-[#f8f5f0] rounded-2xl border border-[#f0ede8] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9c9a97] uppercase tracking-wider">Your Participant ID</span>
                <span className="text-lg font-mono font-semibold text-[#ff6b35]">{pId}</span>
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
                className="w-full inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="flex items-center gap-3 text-[#706e6a] font-medium text-sm">
          <div className="w-5 h-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          <span>Loading Registration Confirmation...</span>
        </div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
