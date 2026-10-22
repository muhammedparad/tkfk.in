'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Participant, Registration } from '@/types';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  CheckCircle2, 
  MessageCircle, 
  LogOut, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  CreditCard,
  AlertCircle,
  Award,
  ArrowRight,
  FileText
} from 'lucide-react';
import { ContestRulesModal } from '@/components/contest/ContestRulesModal';
import { 
  getCachedParticipantSession, 
  saveParticipantSessionCache, 
  clearParticipantSessionCache 
} from '@/hooks/useParticipantSession';

export default function DashboardPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadingIdCard, setDownloadingIdCard] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    // Load from cache first on client mount
    const cached = getCachedParticipantSession();
    if (cached?.participant) {
      setParticipant(cached.participant as unknown as Participant);
      if (cached.registration) setRegistration(cached.registration as any);
      setLoading(false);
    }

    async function loadSession() {
      try {
        const res = await fetch('/api/participant/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.participant) {
          const isNowConfirmed = Boolean(
            data.isAdmin ||
            data.isConfirmed ||
            (data.participant?.participant_id &&
            (data.participant?.status === 'ACTIVE' || data.registration?.payment_status === 'SUCCESS' || data.registration?.registration_status === 'CONFIRMED'))
          );

          if (!isNowConfirmed) {
            clearParticipantSessionCache();
            router.replace('/payment');
            return;
          }

          setParticipant(data.participant);
          if (data.registration) setRegistration(data.registration);
          saveParticipantSessionCache({
            participant: data.participant,
            registration: data.registration || null,
          });
        } else {
          clearParticipantSessionCache();
          router.push('/login');
        }
      } catch {
        const cached = getCachedParticipantSession();
        if (!cached?.participant || !cached.participant.participant_id) {
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

  // Generate background high-res ID card canvas using official template
  useEffect(() => {
    if (!participant) return;
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = '/certificate/TKFK%20Digital%20Poster%20Contest%20Pass.png';

    const render = () => {
      const W = 1586;
      const H = 992;
      canvas.width = W;
      canvas.height = H;

      // 1. Draw Official Template
      ctx.drawImage(img, 0, 0, W, H);

      // 2. Participant Name (Center: x=793, y=524)
      const upperName = (participant.name || 'CONFIRMED PARTICIPANT').toUpperCase().trim();
      let nameFontSize = 46;
      ctx.font = `700 ${nameFontSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
      while (ctx.measureText(upperName).width > 1250 && nameFontSize > 22) {
        nameFontSize -= 2;
        ctx.font = `700 ${nameFontSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
      }
      ctx.fillStyle = '#141412';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(upperName, 793, 524);

      // 3. Unique Participant ID (Center: x=430, y=729)
      ctx.font = "700 38px 'Space Mono', 'Courier New', monospace, system-ui";
      ctx.fillStyle = '#ff6b35';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(participant.participant_id || 'PENDING', 430, 729);

      // 4. Competition Date (Center: x=1156, y=729)
      ctx.font = "600 34px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = '#141412';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(EVENT_CONFIG.eventDateDisplay || '30 November 2026', 1156, 729);
    };

    img.onload = render;
    if (img.complete) {
      render();
    }
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
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem('tkfk_logged_out', '1');
        } catch {}
      }
      await fetch('/api/participant/logout', { 
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    window.location.replace('/login?logged_out=1');
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-[#706e6a] font-medium text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          <span>Loading Participant Portal...</span>
        </div>
      </div>
    );
  }

  const isConfirmed = Boolean(
    participant?.participant_id &&
    (participant?.status === 'ACTIVE' || registration?.payment_status === 'SUCCESS' || registration?.registration_status === 'CONFIRMED')
  );

  if (!participant || !isConfirmed) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f0] text-[#141412] font-sans antialiased">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-grow flex items-center justify-center p-6 pt-8 pb-16 outline-none">
          <div 
            role="alert" 
            aria-live="assertive" 
            className="bg-white p-8 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center max-w-md space-y-4"
          >
            <div className="w-14 h-14 bg-[#fef2f2] text-[#dc2626] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#fed7d7]">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-medium text-[#141412] tracking-tight">Payment Confirmation Required</h2>
            <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed">
              Your official participant ID and portal access are generated upon successful payment completion.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/payment" className="inline-block bg-[#ff6b35] hover:bg-[#e85926] text-white px-6 py-3.5 rounded-full text-sm font-medium shadow-xs transition-colors">
                Complete Payment Now (₹99)
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      {/* Hidden Master Canvas for High-Res PNG Generation */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-4 sm:pt-6 pb-16 px-4 sm:px-6 max-w-lg mx-auto w-full space-y-5 outline-none">
        
        {/* ========================================================
            CARD 1: WELCOME HERO CARD
        ======================================================== */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#f0ede8]/70 border border-[#f0ede8] shadow-soft p-6 sm:p-8">
          
          {/* Top Row: Welcome Name + Contest Badge */}
          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="space-y-1.5 max-w-[72%]">
              <span className="text-xs font-mono font-semibold text-[#9c9a97] uppercase tracking-wider block">
                PARTICIPANT DESK
              </span>
              <h1 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-[-0.03em] leading-tight">
                Welcome,
              </h1>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#ff6b35] tracking-[-0.03em] leading-tight break-words">
                {participant.name}!
              </h2>

              {/* Status Badge */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/90 border border-[#f0ede8] text-[#141412] text-xs font-medium px-3 py-1.5 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>Digital Poster Contest 2026</span>
                </span>
              </div>
            </div>

            {/* Brand Logo Graphic */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-[#f0ede8] shadow-2xs bg-white p-2 flex items-center justify-center">
                <Image 
                  src="/tkfk@4x.png" 
                  alt="TKFK Logo" 
                  width={43}
                  height={43}
                  className="w-[43px] h-[43px] object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Bottom Inner Card: Participant ID + Copy & Logout Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-[#f0ede8] shadow-2xs flex items-center justify-between mt-6 relative z-10">
            <div>
              <span className="block text-[11px] font-mono font-semibold text-[#9c9a97] tracking-wider uppercase">
                Participant ID
              </span>
              <span className="text-lg sm:text-2xl font-mono font-semibold text-[#ff6b35] tracking-tight">
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
                  className="p-2.5 rounded-xl bg-[#f8f5f0] hover:bg-[#f0ede8] text-[#141412] border border-[#f0ede8] transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-[#1e6f42]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Log Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fef2f2] hover:bg-[#fed7d7] text-[#dc2626] font-medium text-xs border border-[#fee2e2] transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================
            CARD 2: PARTICIPANT ID CARD PASS
        ======================================================== */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#f0ede8] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] text-[#ff6b35] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <circle cx="8" cy="11" r="2.5" />
                  <path d="M13.5 9h4" />
                  <path d="M13.5 13h4" />
                  <path d="M5 17c0-1.66 1.34-3 3-3s3 1.34 3 3" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-[#141412] leading-snug">
                  Participant ID Card
                </h3>
                <p className="text-xs sm:text-sm text-[#706e6a]">
                  Download your official digital participant badge.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9c9a97] flex-shrink-0" />
          </div>

          <button
            type="button"
            onClick={handleDownloadIdCard}
            disabled={downloadingIdCard}
            className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingIdCard ? 'Generating Pass...' : 'Download ID Card'}</span>
          </button>
        </div>

        {/* ========================================================
            CARD 3: CONTEST RULES & SUBMISSION GUIDELINES
        ======================================================== */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#f0ede8] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-[#141412] leading-snug">
                  Contest Rules & Submission Guidelines
                </h3>
                <p className="text-xs sm:text-sm text-[#706e6a]">
                  1080 × 1350 px (4:5) • Photoshop (.PSD) Required • AI Policy & 100-Pt Rubric
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9c9a97] flex-shrink-0" />
          </div>

          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#ff6b35]" />
            <span>View Official Rules & Rubric</span>
          </button>
        </div>


        {/* ========================================================
            CARD 4: OFFICIAL GROUP & COMMUNITY DESK (MANDATORY FOR CONTEST)
        ======================================================== */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#f0ede8] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#eef8f2] text-[#16a34a] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-medium text-[#141412] leading-snug">
                    Poster Contest WhatsApp Group
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef8f2] text-[#16a34a] border border-[#bbf7d0]">
                    Mandatory
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#706e6a]">
                  Mandatory to join for contest themes, design guidelines, and submission links.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9c9a97] flex-shrink-0" />
          </div>

          <a
            href={EVENT_CONFIG.contestWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba59] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enter Contest WhatsApp Group</span>
          </a>
        </div>

        {/* ========================================================
            CARD 5: CONTEST SUPPORT & GUIDELINES
        ======================================================== */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#f0ede8] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede8] text-[#ff6b35] flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-[#141412] leading-snug">
                  Support & Assistance
                </h3>
                <p className="text-xs sm:text-sm text-[#706e6a]">
                  Have questions regarding your submission or ID pass?
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9c9a97] flex-shrink-0" />
          </div>

          <Link
            href="/contact"
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>Contact TKFK Helpdesk</span>
            <ArrowRight className="w-4 h-4 text-[#ff6b35]" />
          </Link>
        </div>

        {/* Official Contest Rules Modal */}
        <ContestRulesModal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          defaultView="brief"
          participantName={participant?.name}
        />

      </main>

      <Footer />
    </div>
  );
}
