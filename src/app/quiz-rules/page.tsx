'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Participant } from '@/types';
import { 
  getBestCameraStream, 
  getCameraErrorMessage, 
  stopCameraStream, 
  CameraErrorInfo 
} from '@/lib/camera';

export default function QuizRulesPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(true);
  
  // Camera State
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [cameraErrorInfo, setCameraErrorInfo] = useState<CameraErrorInfo | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const eventTime = new Date(EVENT_CONFIG.quiz_open_at).getTime();
  const isQuizOpen = isAdmin || Date.now() >= eventTime || process.env.NODE_ENV !== 'production' || process.env.BYPASS_EVENT_WINDOWS === 'true';

  useEffect(() => {
    fetch('/api/participant/me')
      .then(res => res.json())
      .then(data => {
        if (data.isAdmin) {
          setIsAdmin(true);
        }
        if (data.success && data.participant && data.isConfirmed && data.participant.participant_id) {
          setParticipant(data.participant);
        } else if (data.isAdmin && data.participant) {
          setParticipant(data.participant);
        } else if (data.participant && !data.isConfirmed) {
          router.push('/payment');
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  // Request & Test Camera Access with Tiered Fallback
  const requestCameraAccess = async () => {
    setCameraStatus('requesting');
    setCameraErrorInfo(null);

    if (cameraStream) {
      stopCameraStream(cameraStream);
      setCameraStream(null);
    }

    try {
      const stream = await getBestCameraStream();
      setCameraStream(stream);
      setCameraStatus('granted');
      setCameraErrorInfo(null);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[Camera Access Error]', err);
      setCameraStatus('denied');
      setCameraErrorInfo(getCameraErrorMessage(err));
    }
  };

  useEffect(() => {
    if (cameraStatus === 'granted' && cameraStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = cameraStream;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [cameraStatus, cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        stopCameraStream(cameraStream);
      }
    };
  }, [cameraStream]);

  const handleProceedToQuiz = async () => {
    if (!agreedConsent) {
      setShowRulesPopup(true);
      return;
    }
    if (cameraStatus !== 'granted' && !isAdmin) {
      alert('Please allow and test camera access before launching the quiz.');
      return;
    }

    // Attempt to enter fullscreen on proceed
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      }
    } catch {}

    router.push('/quiz');
  };

  const handleConfirmRulesInModal = () => {
    if (agreedConsent) {
      setShowRulesPopup(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full space-y-5">
        
        {/* Title Header */}
        <div className="text-center space-y-1.5">
          {isAdmin && (
            <div className="inline-block bg-purple-100 border border-purple-200 text-purple-900 px-3 py-0.5 rounded-full text-xs font-bold mb-1">
              Admin Testing Mode Enabled • Date Gating Bypassed
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Gandhi Jayanti Online Quiz
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            4 October 2026 • 3:00 PM – 5:00 PM IST • 50 Questions (25 mins)
          </p>
        </div>

        {/* Rules Status Ribbon */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${agreedConsent ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="text-xs font-semibold text-slate-800">
              {agreedConsent ? 'Competition Rules Acknowledged' : 'Rules Agreement Pending'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowRulesPopup(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {agreedConsent ? 'Review Rules' : 'Read Rules'}
          </button>
        </div>

        {/* Camera Permission & Readiness Section */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Camera Access & Readiness
            </h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              cameraStatus === 'granted'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : cameraStatus === 'denied'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              {cameraStatus === 'granted' ? 'Camera Connected' : cameraStatus === 'denied' ? 'Permission Required' : 'Not Tested'}
            </span>
          </div>

          {/* Camera Feed & Controls */}
          <div className="space-y-4">
            <div className="relative w-full aspect-video max-w-xs mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 flex items-center justify-center shadow-inner">
              {cameraStatus === 'granted' ? (
                <video 
                  ref={videoPreviewRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover mirror scale-x-[-1]" 
                />
              ) : (
                <div className="text-center p-4 space-y-1">
                  <span className="block text-xs text-slate-400 font-medium">Webcam Feed Preview</span>
                  <span className="block text-[10px] text-slate-500">Tap below to grant camera access</span>
                </div>
              )}
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Ensure your face is clearly visible, well-lit, and that no other persons are in frame.
              </p>

              {cameraStatus !== 'granted' && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={requestCameraAccess}
                    disabled={cameraStatus === 'requesting'}
                    className="bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {cameraStatus === 'requesting' ? 'Requesting Access...' : 'Allow & Test Camera'}
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setCameraStatus('granted');
                        setCameraErrorInfo(null);
                      }}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Admin Camera Bypass
                    </button>
                  )}
                </div>
              )}

              {cameraStatus === 'granted' && (
                <p className="text-xs text-emerald-700 font-bold">
                  Camera is active and ready for the quiz.
                </p>
              )}

              {cameraStatus === 'denied' && cameraErrorInfo && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 text-left space-y-1">
                  <span className="font-bold block">{cameraErrorInfo.title}</span>
                  <span className="block text-slate-600">{cameraErrorInfo.hint}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Launch Button */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {!isQuizOpen ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Quiz Portal Opens on {EVENT_CONFIG.eventDateDisplay} ({EVENT_CONFIG.quizTimingDisplay})
                </h3>
                <p className="text-xs text-slate-600">
                  The active quiz will unlock automatically during the competition window.
                </p>
                <Link href="/study" className="inline-block bg-[#00966b] text-white font-bold px-5 py-2 rounded-xl text-xs mt-1 shadow-xs">
                  Open Study Materials
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleProceedToQuiz}
                disabled={!agreedConsent || (cameraStatus !== 'granted' && !isAdmin)}
                className="w-full flex items-center justify-center gap-2 bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Proceed to Quiz</span>
              </button>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Logged in: <strong className="text-slate-800">{participant?.name || 'Participant'}</strong></span>
              <span className="font-bold text-emerald-800">TKFK 2026</span>
            </div>
          </div>

        </div>

      </main>

      {/* Rules Popup Modal */}
      {showRulesPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Gandhi Jayanti Online Quiz — Rules
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Date: 4 October • Time: 3:00 PM – 5:00 PM • 50 Questions (25 mins)
                </p>
              </div>
            </div>

            {/* Modal Scrollable Body: Bulleted Rules */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Important Rules & Regulations
                </span>
                
                <ul className="space-y-2 list-disc pl-5">
                  <li>Quiz must be completed strictly <strong>individually</strong>. One attempt per registered participant.</li>
                  <li><strong>Mandatory Fullscreen Mode:</strong> The quiz runs strictly in fullscreen mode. Exiting fullscreen will lock the screen and block answering until fullscreen is re-enabled.</li>
                  <li><strong>No Page Reloading or Refreshing:</strong> Refreshing or reloading the page after entering the quiz portal is strictly prohibited.</li>
                  <li><strong>Camera access is mandatory</strong> throughout the quiz attempt.</li>
                  <li>Only the registered participant should be visible on camera.</li>
                  <li>More than one person on camera will trigger <strong>2 warnings</strong>, then automatic termination.</li>
                  <li><strong>No switching tabs, apps, or browser windows</strong> after starting. Doing so will lead to immediate termination.</li>
                  <li>No Google, AI tools, other websites, books, messaging apps, or outside assistance.</li>
                  <li>Each question has <strong>30 seconds</strong> pacing (25 minutes total exam time limit).</li>
                  <li><strong>Highest score wins</strong>. In case of a tie in score, <strong>shorter completion time</strong> will be considered.</li>
                  <li>Organisers will monitor the quiz and may disqualify rule violations.</li>
                  <li>Organisers&apos; decision regarding results will be final.</li>
                </ul>
              </div>

            </div>

            {/* Modal Footer: Tick of Assurance & Confirmation Button */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              
              <label className="flex items-start gap-2.5 text-xs text-slate-800 leading-snug cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedConsent}
                  onChange={(e) => setAgreedConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0 cursor-pointer"
                />
                <span className="font-medium">
                  I have read and agree to all the competition rules. I confirm I will complete the quiz individually in fullscreen with camera enabled, and will not reload the page or switch tabs/apps.
                </span>
              </label>

              <button
                type="button"
                onClick={handleConfirmRulesInModal}
                disabled={!agreedConsent}
                className="w-full bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Accept Rules & Continue
              </button>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
