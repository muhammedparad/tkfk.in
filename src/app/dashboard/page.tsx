'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Participant, Registration } from '@/types';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  CheckCircle2, 
  BookOpen, 
  MessageCircle, 
  LogOut, 
  Calendar, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  CreditCard,
  AlertCircle,
  Share2
} from 'lucide-react';
import { 
  getCachedParticipantSession, 
  saveParticipantSessionCache, 
  clearParticipantSessionCache 
} from '@/hooks/useParticipantSession';

export default function DashboardPage() {
  const router = useRouter();
  const cachedInitial = typeof window !== 'undefined' ? getCachedParticipantSession() : null;
  const [participant, setParticipant] = useState<Participant | null>((cachedInitial?.participant as unknown as Participant) || null);
  const [registration, setRegistration] = useState<Registration | null>((cachedInitial?.registration as any) || null);
  const [loading, setLoading] = useState(cachedInitial?.participant ? false : true);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadingIdCard, setDownloadingIdCard] = useState(false);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
          saveParticipantSessionCache({
            participant: data.participant,
            registration: data.registration || null,
          });

          const isNowConfirmed = data.participant?.status === 'ACTIVE' || 
            data.registration?.payment_status === 'SUCCESS' || 
            data.registration?.registration_status === 'CONFIRMED';

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
                    saveParticipantSessionCache({
                      participant: checkData.participant,
                      registration: checkData.registration || null,
                    });
                    if (pollTimer) clearInterval(pollTimer);
                  }
                }
              } catch {}
            }, 2500);
          }
        } else {
          clearParticipantSessionCache();
          router.push('/login');
        }
      } catch {
        if (!cachedInitial?.participant) {
          router.push('/login');
        }
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

  // Generate background high-res ID card canvas
  useEffect(() => {
    if (!participant) return;
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 750;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient (Deep Navy/Emerald Luxury)
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#0a192f');
    bgGradient.addColorStop(0.5, '#062e24');
    bgGradient.addColorStop(1, '#021e17');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Glows
    const glow1 = ctx.createRadialGradient(W - 100, 100, 10, W - 100, 100, 350);
    glow1.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    glow1.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(150, H - 100, 10, 150, H - 100, 300);
    glow2.addColorStop(0, 'rgba(5, 150, 105, 0.18)');
    glow2.addColorStop(1, 'rgba(5, 150, 105, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // Borders
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(60, 60, W - 120, 8);

    // Organization Header
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('THE KNOWLEDGE FORUM KERALA (TKFK)', 75, 125);

    ctx.font = '800 44px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GANDHI KNOWLEDGE CHALLENGE 2026', 75, 185);

    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('OFFICIAL PARTICIPANT IDENTIFICATION PASS', 75, 225);

    // Main Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 255);
    ctx.lineTo(W - 75, 255);
    ctx.stroke();

    // Participant Name
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('PARTICIPANT NAME', 75, 305);

    const upperName = (participant.name || 'CONFIRMED PARTICIPANT').toUpperCase();
    let nameFontSize = 48;
    ctx.font = `800 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(upperName).width > (W - 160) && nameFontSize > 28) {
      nameFontSize -= 2;
      ctx.font = `800 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText(upperName, 75, 365);

    // Participant ID Box (Bottom Left)
    const idBoxW = 540;
    const idBoxH = 130;
    const idBoxX = 75;
    const idBoxY = 425;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(idBoxX, idBoxY, idBoxW, idBoxH, 20);
    } else {
      ctx.rect(idBoxX, idBoxY, idBoxW, idBoxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('UNIQUE PARTICIPANT ID', idBoxX + 30, idBoxY + 40);

    ctx.font = '800 48px monospace, system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(participant.participant_id || 'PENDING', idBoxX + 30, idBoxY + 98);

    // Event Date Box (Bottom Right)
    const dateBoxX = 660;
    const dateBoxY = 425;
    const dateBoxW = 465;
    const dateBoxH = 130;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(dateBoxX, dateBoxY, dateBoxW, dateBoxH, 20);
    } else {
      ctx.rect(dateBoxX, dateBoxY, dateBoxW, dateBoxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('COMPETITION DATE', dateBoxX + 30, dateBoxY + 40);

    ctx.font = '800 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(EVENT_CONFIG.eventDateDisplay || '2 October 2026', dateBoxX + 30, dateBoxY + 92);

    // Bottom Tag
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 620);
    ctx.lineTo(W - 75, 620);
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('AUTHENTICATED PARTICIPANT RECORD • GANDHI KNOWLEDGE CHALLENGE 2026', 75, 665);

    ctx.font = '800 18px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('VERIFIED-TKFK26', W - 260, 665);

  }, [participant]);

  const handleCopyId = () => {
    if (!participant?.participant_id) return;
    navigator.clipboard.writeText(participant.participant_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    try {
      clearParticipantSessionCache();
      await fetch('/api/participant/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  };

  const handleDownloadIdCard = async () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas || !participant) return;

    setDownloadingIdCard(true);
    const fileName = `TKFK26_Participant_ID_${participant.participant_id || 'Pass'}.png`;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          const imageURI = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imageURI;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setDownloadingIdCard(false);
          return;
        }

        // On mobile: Try native Web Share Sheet
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'TKFK 2026 Participant ID Card',
                text: `Official Participant ID: ${participant.participant_id}`
              });
              setDownloadingIdCard(false);
              return;
            } catch (shareErr) {
              // Share cancelled or declined -> fallback to direct blob download
            }
          }
        }

        // Standard Blob Download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1500);

        setDownloadingIdCard(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadingIdCard(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-600 font-semibold text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading Participant Portal...</span>
        </div>
      </div>
    );
  }

  if (!participant) return null;

  const isConfirmed = participant?.status === 'ACTIVE' || 
    registration?.payment_status === 'SUCCESS' || 
    registration?.registration_status === 'CONFIRMED' || 
    registration?.registration_status === 'ACTIVE';

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Hidden Master Canvas for High-Res PNG Generation */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <main id="main-content" tabIndex={-1} className="flex-grow py-5 sm:py-8 px-4 sm:px-6 max-w-lg mx-auto w-full space-y-4 outline-none">
        
        {/* ========================================================
            CARD 1: WELCOME HERO CARD
        ======================================================== */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#e8f7ee] via-[#ecf8f1] to-[#daf1e3] border border-[#c7ebd5]/60 shadow-xs p-6 sm:p-7">
          
          {/* Top Row: Welcome Name + Gandhi Illustration */}
          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="space-y-1.5 max-w-[65%]">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome,
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00875a] tracking-tight leading-tight break-words">
                {participant.name}!
              </h2>

              {/* Status Badge */}
              <div className="pt-2">
                {isConfirmed ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#d4f2de] text-[#0d6e3f] text-xs font-semibold px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-[#0d6e3f] text-white" />
                    <span>Registered Participant</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Payment Pending</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gandhi Sketch Graphic */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 -mt-2 -mr-2">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-400/40 shadow-inner bg-emerald-100/50 flex items-center justify-center">
                <img 
                  src="/images/gandhi_sketch_portal.jpg" 
                  alt="Mahatma Gandhi" 
                  className="w-full h-full object-cover object-center mix-blend-multiply select-none pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Inner Card: Participant ID + Copy & Logout Buttons */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100/80 shadow-2xs flex items-center justify-between mt-5 relative z-10">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 tracking-wider">
                Participant ID
              </span>
              <span className="text-lg sm:text-2xl font-black text-[#00875a] font-mono tracking-tight">
                {participant.participant_id || 'PENDING'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy ID Button */}
              {participant.participant_id && (
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Participant ID"
                  aria-label="Copy Participant ID"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Log Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fef2f2] hover:bg-rose-100 text-[#ef4444] font-bold text-xs border border-rose-100 transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================
            PAYMENT PENDING BANNER (If not confirmed)
        ======================================================== */}
        {!isConfirmed && (
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Payment Confirmation Pending</span>
              </div>
              <p className="text-xs text-amber-700">
                Complete your ₹99 registration fee payment to unlock your official Participant ID Badge and Quiz access.
              </p>
            </div>
            <Link
              href="/payment"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm flex-shrink-0 w-full sm:w-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Complete Payment</span>
            </Link>
          </div>
        )}

        {/* ========================================================
            CARD 2: PARTICIPANT ID CARD
        ======================================================== */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#e6f4ea] text-[#00875a] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <circle cx="8" cy="11" r="2.5" />
                  <path d="M13.5 9h4" />
                  <path d="M13.5 13h4" />
                  <path d="M5 17c0-1.66 1.34-3 3-3s3 1.34 3 3" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Participant ID Card
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Download your official participant badge.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />
          </div>

          {isConfirmed ? (
            <button
              type="button"
              onClick={handleDownloadIdCard}
              disabled={downloadingIdCard}
              className="w-full flex items-center justify-center gap-2 bg-[#00875a] hover:bg-[#00744e] text-white font-bold py-3.5 rounded-2xl text-sm sm:text-base shadow-md shadow-emerald-700/10 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{downloadingIdCard ? 'Generating Pass...' : 'Download ID Card'}</span>
            </button>
          ) : (
            <Link
              href="/payment"
              className="w-full flex items-center justify-center gap-2 bg-[#00875a] hover:bg-[#00744e] text-white font-bold py-3.5 rounded-2xl text-sm sm:text-base shadow-md transition-all active:scale-[0.99]"
            >
              <CreditCard className="w-5 h-5" />
              <span>Complete Payment to Unlock ID Card</span>
            </Link>
          )}
        </div>

        {/* ========================================================
            CARD 3: STUDY MATERIAL
        ======================================================== */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Study Material
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Prepare with the official PDF booklet.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />
          </div>

          <a
            href="/PDF/TKFK Gandhi Jayanti Quiz 2026 - Study Module.pdf"
            download="TKFK Gandhi Jayanti Quiz 2026 - Study Module.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] font-bold py-3.5 rounded-2xl text-sm sm:text-base transition-all active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF Booklet</span>
          </a>
        </div>

        {/* ========================================================
            CARD 4: OFFICIAL GROUP & HELP
        ======================================================== */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#e6f7ef] text-[#25d366] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Official Group & Help
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Join the official WhatsApp group for updates and support.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />
          </div>

          <a
            href={EVENT_CONFIG.whatsAppGroupUrl || 'https://chat.whatsapp.com/B8eZA7FCO9wGSYzLfQfBjc'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#00875a] hover:bg-[#00744e] text-white font-bold py-3.5 rounded-2xl text-sm sm:text-base shadow-md shadow-emerald-700/10 transition-all active:scale-[0.99] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Join WhatsApp Group</span>
          </a>
        </div>

        {/* ========================================================
            CARD 5: QUIZ PORTAL (LAST)
        ======================================================== */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fef7e0] text-[#f29900] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Quiz Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Scheduled for <span className="font-bold text-slate-800">2 October 2026.</span>
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  50 Questions • 25 Minutes.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />
          </div>

          <Link
            href="/quiz"
            className="w-full flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-3.5 rounded-2xl text-sm sm:text-base shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
            <span>Enter Quiz Portal</span>
          </Link>
        </div>

        {/* ========================================================
            FOOTER LOGO BRAND
        ======================================================== */}
        <div className="py-6 flex flex-col items-center justify-center space-y-1.5 text-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="21" x2="21" y2="21" />
                <line x1="6" y1="21" x2="6" y2="10" />
                <line x1="10" y1="21" x2="10" y2="10" />
                <line x1="14" y1="21" x2="14" y2="10" />
                <line x1="18" y1="21" x2="18" y2="10" />
                <polygon points="12 3 2 10 22 10 12 3" />
              </svg>
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
              TKFK <span className="text-[#00875a]">2026</span>
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            The Knowledge Forum Kerala
          </p>
        </div>

      </main>
    </div>
  );
}
