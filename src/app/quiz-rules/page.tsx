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
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  
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

  const handleProceedToQuiz = () => {
    if (!agreedConsent) return;
    router.push('/quiz');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-6">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          {isAdmin && (
            <div className="inline-block bg-purple-100 border border-purple-200 text-purple-900 px-3.5 py-1 rounded-full text-xs font-bold mb-1">
              Admin Testing Mode Enabled • Date Gating Bypassed
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gandhi Jayanti Online Quiz
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Date: <strong>4 October 2026</strong> • Portal Time: <strong>3:00 PM – 5:00 PM IST</strong> • <strong>50 Questions</strong> (30s/Question, 25 mins total)
          </p>
        </div>

        {/* Main Briefing Card (Clean Light Theme) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Bulleted Instructions List (No icons, no emojis) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Important Instructions
              </h2>
              <button
                type="button"
                onClick={() => setShowRulesPopup(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                View Full Rules Popup
              </button>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed list-disc pl-5">
              <li>Quiz must be completed strictly <strong>individually</strong>. One attempt per registered participant.</li>
              <li><strong>Camera access is mandatory</strong> throughout the quiz attempt. Only the registered participant must be visible.</li>
              <li>More than one person visible on camera will trigger <strong>2 warnings</strong> before automatic termination.</li>
              <li><strong>No switching tabs, apps, or browser windows</strong> after starting. Doing so will lead to immediate termination.</li>
              <li>No search engines, AI tools, other websites, books, or outside assistance allowed during the quiz.</li>
              <li>Each question has <strong>30 seconds</strong> pacing. Server auto-submits upon reaching the 25-minute total limit.</li>
              <li><strong>Highest score wins</strong>. In case of a tie in score, shorter completion time will be considered to determine rankings.</li>
              <li>Organisers&apos; decision regarding evaluation and results will be final.</li>
            </ul>
          </div>

          {/* Compact Camera Readiness Check (Clean, minimal light styling) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Camera Readiness Check
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                cameraStatus === 'granted'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : cameraStatus === 'denied'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {cameraStatus === 'granted' ? 'Camera Connected' : cameraStatus === 'denied' ? 'Permission Required' : 'Not Tested'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-32 h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center flex-shrink-0">
                {cameraStatus === 'granted' ? (
                  <video 
                    ref={videoPreviewRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror scale-x-[-1]" 
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium text-center px-2">Webcam Feed</span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 flex-1 text-center sm:text-left">
                <p className="font-medium">
                  Ensure your face is clearly visible and well-lit.
                </p>

                {cameraStatus !== 'granted' && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={requestCameraAccess}
                      disabled={cameraStatus === 'requesting'}
                      className="bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {cameraStatus === 'requesting' ? 'Connecting...' : 'Allow & Test Camera'}
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setCameraStatus('granted');
                          setCameraErrorInfo(null);
                        }}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Admin Camera Bypass
                      </button>
                    )}
                  </div>
                )}

                {cameraStatus === 'granted' && (
                  <p className="text-[11px] text-emerald-700 font-bold">
                    Camera is active and ready for proctoring.
                  </p>
                )}

                {cameraStatus === 'denied' && cameraErrorInfo && (
                  <p className="text-[11px] text-rose-700 font-medium">
                    {cameraErrorInfo.title}: Please enable camera access in your browser settings.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 leading-relaxed cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={(e) => setAgreedConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0 cursor-pointer"
              />
              <span className="font-medium">
                I have read and agree to all the competition instructions. I will complete the quiz individually with my camera enabled, and I acknowledge that switching tabs, applications, or windows will lead to immediate termination.
              </span>
            </label>
          </div>

          {/* Action Launch Button */}
          <div className="pt-2 space-y-3">
            {!isQuizOpen ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Quiz Portal Opens on {EVENT_CONFIG.eventDateDisplay} ({EVENT_CONFIG.quizTimingDisplay})
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  The active quiz will unlock automatically on {EVENT_CONFIG.eventDateDisplay} between {EVENT_CONFIG.quizTimingDisplay}.
                </p>
                <Link href="/study" className="inline-block bg-[#00966b] text-white font-bold px-6 py-2.5 rounded-xl text-xs mt-2 shadow-xs">
                  Open Study Materials
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleProceedToQuiz}
                disabled={!agreedConsent}
                className="w-full flex items-center justify-center gap-2 bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Launch Quiz Attempt</span>
              </button>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Logged in as: <strong className="text-slate-800">{participant?.name || 'Participant'}</strong> ({participant?.participant_id || 'CONFIRMED'})</span>
              <span className="font-bold text-emerald-800">TKFK 2026</span>
            </div>
          </div>

        </div>

      </main>

      {/* Rules Popup Modal */}
      {showRulesPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                Full Competition Rules & Guidelines
              </h3>
              <button
                type="button"
                onClick={() => setShowRulesPopup(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">1. Eligibility & Single Attempt</h4>
                <p className="text-slate-600">The competition is open to all registered participants. Each participant is permitted exactly one official attempt.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">2. Mandatory Proctoring & Video</h4>
                <p className="text-slate-600">Continuous webcam access is mandatory. The participant&apos;s face must remain centered and clearly visible throughout. Detection of multiple faces will issue 2 warnings before terminating the attempt.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">3. Window & Tab Switch Policy</h4>
                <p className="text-slate-600">Navigating away from the quiz tab, minimizing the browser, or opening other applications is strictly prohibited and results in immediate automated termination.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">4. Time Limit & Submission</h4>
                <p className="text-slate-600">The exam consists of 50 multiple-choice questions with a total time limit of 25 minutes (30 seconds recommended pace per question). When the timer expires, answers are automatically finalized.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">5. Scoring & Tie-Breaker</h4>
                <p className="text-slate-600">Each correct answer is awarded 1 point with no negative marking. In the event of a tie in points, the participant with the shorter overall completion time will receive the higher ranking.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">6. Final Authority</h4>
                <p className="text-slate-600">The organisers reserve the right to review proctoring logs and disqualify any attempts with confirmed rule violations. The decision of the organising committee is final.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRulesPopup(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                I Understand
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
