'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Participant } from '@/types';
import { 
  ShieldCheck, 
  Clock, 
  Camera, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Eye, 
  XCircle, 
  Trophy,
  Scale,
  Video
} from 'lucide-react';

export default function QuizRulesPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const eventTime = new Date(EVENT_CONFIG.eventIsoDate).getTime();
  const isQuizOpen = Date.now() >= eventTime || process.env.NODE_ENV !== 'production' || process.env.BYPASS_EVENT_WINDOWS === 'true';

  useEffect(() => {
    fetch('/api/participant/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.participant && data.isConfirmed && data.participant.participant_id) {
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

  // Request & Test Camera Access
  const requestCameraAccess = async () => {
    setCameraStatus('requesting');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: false 
      });
      setCameraStream(stream);
      setCameraStatus('granted');
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('[Camera Access Error]', err);
      setCameraStatus('denied');
    }
  };

  useEffect(() => {
    if (cameraStatus === 'granted' && cameraStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = cameraStream;
    }
  }, [cameraStatus, cameraStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  const handleProceedToQuiz = () => {
    if (!agreedConsent) return;
    router.push('/quiz');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
            Official Pre-Quiz Instructions
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            GANDHI JAYANTI ONLINE QUIZ — RULES
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Date: <strong>4 October 2026</strong> • Portal Opening Time: <strong>3:00 PM – 5:00 PM IST</strong>
          </p>
        </div>

        {/* Main Briefing Card */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">4 October 2026</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal Time</span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">3:00 PM – 5:00 PM</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">50 MCQs</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Limit</span>
              <p className="text-sm sm:text-base font-extrabold text-emerald-700">30s/Q (25 Mins Total)</p>
            </div>
          </div>

          {/* Detailed Official Rules List */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Important Competition Rules</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Individual Attempt</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  Quiz must be completed strictly <strong>individually</strong>. One attempt per participant.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <Camera className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Mandatory Camera Access</span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
                  <strong>Camera access is mandatory.</strong> Only the registered participant should be visible on camera.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Multiple Person Policy</span>
                </div>
                <p className="text-[11px] sm:text-xs text-rose-900 leading-relaxed">
                  More than one person on camera → <strong>2 warnings</strong>, then automatic termination.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>No Tab / App Switching</span>
                </div>
                <p className="text-[11px] sm:text-xs text-rose-900 leading-relaxed">
                  No switching tabs, apps or windows after starting. Doing so will lead to <strong>immediate termination</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>No Outside Assistance</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  No Google, AI tools, other websites, books, messaging apps or outside assistance allowed.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>30 Seconds Per Question</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  Each question has <strong>30 seconds</strong> pacing. Server auto-submits upon exam time expiration.
                </p>
              </div>

            </div>

            {/* Tie Break and Decision Info */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Trophy className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Leaderboard & Tie-Break Evaluation</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-emerald-900/90 text-[11px] sm:text-xs">
                <li><strong>Highest score wins.</strong></li>
                <li>In case of a tie in score, <strong>shorter completion time</strong> will be considered to determine rankings.</li>
                <li>Organisers will monitor the quiz and may disqualify rule violations. Organisers&apos; decision regarding results will be final.</li>
              </ul>
            </div>
          </div>

          {/* Live Camera Test Preview Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold">Mandatory Camera Readiness Check</span>
              </div>
              {cameraStatus === 'granted' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Camera Active</span>
                </span>
              ) : cameraStatus === 'denied' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Camera Blocked</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                  <span>Not Tested Yet</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-40 h-28 sm:w-48 sm:h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                {cameraStatus === 'granted' ? (
                  <video 
                    ref={videoPreviewRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror scale-x-[-1]" 
                  />
                ) : (
                  <div className="text-center p-3 space-y-1 text-slate-500">
                    <Camera className="w-6 h-6 mx-auto text-slate-600" />
                    <span className="text-[10px] block">Live Webcam Feed</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-300 text-center sm:text-left flex-1">
                <p className="font-semibold text-slate-200">
                  Ensure your face is clearly visible, well-lit, and that no other persons are in frame.
                </p>
                {cameraStatus !== 'granted' ? (
                  <button
                    type="button"
                    onClick={requestCameraAccess}
                    disabled={cameraStatus === 'requesting'}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{cameraStatus === 'requesting' ? 'Requesting Permission...' : 'Allow & Test Camera'}</span>
                  </button>
                ) : (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Your camera is working properly. The proctoring system will monitor your video feed during the quiz.
                  </p>
                )}
                {cameraStatus === 'denied' && (
                  <p className="text-[11px] text-rose-400">
                    ⚠️ Camera permission was blocked by your browser. Please tap the lock/camera icon in your address bar and allow camera access.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mandatory Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
            <label className="flex items-start gap-3 text-xs text-slate-800 leading-relaxed cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={(e) => setAgreedConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500 flex-shrink-0 cursor-pointer"
              />
              <span className="font-medium">
                I have read and agree to all the competition rules above. I confirm that I will attempt the quiz <strong>individually</strong> with camera enabled, and I understand that <strong>switching tabs, apps, or windows will lead to immediate termination</strong>.
              </span>
            </label>
          </div>

          {/* Action Launch Section */}
          <div className="pt-2 space-y-3">
            {!isQuizOpen ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Quiz Portal Opens on {EVENT_CONFIG.eventDateDisplay} ({EVENT_CONFIG.quizTimingDisplay})
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  The active quiz will unlock automatically on <strong>{EVENT_CONFIG.eventDateDisplay}</strong> between <strong>{EVENT_CONFIG.quizTimingDisplay}</strong>. Prepare now using the study modules!
                </p>
                <Link href="/study" className="inline-block bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs mt-2 shadow-sm">
                  Open Study Materials
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleProceedToQuiz}
                disabled={!agreedConsent}
                className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Be ready before starting — Launch Quiz Attempt</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Logged in as: <strong className="text-slate-700">{participant?.name || 'Participant'}</strong> ({participant?.participant_id || 'CONFIRMED'})</span>
              <span className="font-bold text-emerald-800">TKFK 2026</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

