'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticipantIdCardCanvas } from '@/components/ui/ParticipantIdCardCanvas';
import { Participant, Registration } from '@/types';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  MessageCircle, 
  LogOut, 
  Calendar, 
  Award,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Download,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<any | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [studyConfig, setStudyConfig] = useState<{ url: string; title: string }>({ url: '/study', title: 'Study Material' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    async function loadSession() {
      try {
        const res = await fetch('/api/participant/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.participant) {
          setParticipant(data.participant);
          if (data.registration) setRegistration(data.registration);
          if (data.studyMaterial) setStudyConfig(data.studyMaterial);

          const isNowConfirmed = data.participant?.status === 'ACTIVE' || 
            data.registration?.payment_status === 'SUCCESS' || 
            data.registration?.registration_status === 'CONFIRMED';

          // If not confirmed yet, poll in background every 2.5s for up to 15 attempts (~37s)
          // so as soon as payment webhook/verification completes, it updates automatically!
          if (!isNowConfirmed) {
            let pollCount = 0;
            pollTimer = setInterval(async () => {
              if (!isMounted) return;
              pollCount++;
              if (pollCount > 15) {
                if (pollTimer) clearInterval(pollTimer);
                return;
              }
              try {
                const checkRes = await fetch('/api/participant/me', {
                  cache: 'no-store',
                  headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });
                if (checkRes.ok) {
                  const checkData = await checkRes.json();
                  if (checkData.participant?.status === 'ACTIVE' || checkData.registration?.payment_status === 'SUCCESS') {
                    setParticipant(checkData.participant);
                    if (checkData.registration) setRegistration(checkData.registration);
                    if (pollTimer) clearInterval(pollTimer);
                  }
                }
              } catch {}
            }, 2500);
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSession();

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/participant/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-semibold">
        Loading Participant Dashboard...
      </div>
    );
  }

  if (!participant) return null;

  const isConfirmed = participant?.status === 'ACTIVE' || registration?.payment_status === 'SUCCESS' || registration?.registration_status === 'CONFIRMED' || registration?.registration_status === 'ACTIVE';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-5 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-8 outline-none">
        
        {/* Welcome Banner */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Participant Portal
              </span>
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONFIRMED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>PAYMENT PENDING</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              Welcome, {participant.name}!
            </h1>
            <p className="text-xs text-slate-500">
              Institution: {participant.college || 'Registered Participant'} • {participant.state}
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end gap-2 bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Participant ID</span>
              <span className="text-lg sm:text-2xl font-extrabold text-emerald-700 font-mono tracking-wider">
                {participant.participant_id || 'PENDING PAYMENT'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Payment Pending Alert Banner if not confirmed */}
        {!isConfirmed && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Registration Payment Pending (₹99)</span>
              </div>
              <p className="text-xs text-amber-700">
                Your registration is registered on the server but requires a confirmed fee payment to receive your official Participant ID and unlock full access.
              </p>
            </div>
            <Link
              href="/payment"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm flex-shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Complete Payment Now</span>
            </Link>
          </div>
        )}

        {/* Official Participant ID Card Download Section */}
        {isConfirmed && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Official Credentials
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Participant ID Card
                </h2>
                <p className="text-xs text-slate-500">
                  Download your high-resolution official Gandhi Knowledge Challenge 2026 Participant ID Badge.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>VERIFIED PARTICIPANT BADGE</span>
              </div>
            </div>

            <div className="max-w-2xl mx-auto pt-2">
              <ParticipantIdCardCanvas
                participantName={participant.name}
                participantId={participant.participant_id}
                eventDateDisplay={EVENT_CONFIG.eventDateDisplay || "2 October 2026"}
              />
            </div>
          </div>
        )}

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Study Material */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Study Material</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prepare for the competition with 10 structured history and philosophy modules.
              </p>
            </div>
            <a
              href={EVENT_CONFIG.studyPdfUrl}
              download="TKFK_Gandhi_Jayanti_Quiz_2026_Study_Module.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3.5 rounded-xl sm:rounded-2xl text-xs shadow-xs transition-all active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>DOWNLOAD OFFICIAL PDF BOOKLET</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 2: Quiz Launch */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Quiz Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scheduled for <strong>2 October 2026</strong>. 50 Questions • 25 Minutes.
              </p>
            </div>
            <Link
              href="/quiz-rules"
              className="w-full inline-flex items-center justify-between bg-slate-900 active:bg-slate-800 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-xl sm:rounded-2xl text-xs shadow-xs transition-all active:scale-[0.99]"
            >
              <span>ENTER QUIZ PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: WhatsApp Group & Support */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Official Group & Help</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join the official broadcast channel for live updates, announcements, and help desk.
              </p>
            </div>
            <a
              href={EVENT_CONFIG.whatsAppGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl sm:rounded-2xl text-xs shadow-xs transition-all"
            >
              <span>JOIN WHATSAPP GROUP</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
