'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientQuestion, QuizSession, Participant } from '@/types';
import { 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  AlertTriangle, 
  RefreshCw, 
  Camera, 
  XCircle, 
  Eye, 
  AlertCircle, 
  Lock,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { getBestCameraStream, stopCameraStream, getCameraErrorMessage } from '@/lib/camera';

export default function ActiveQuizPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, 'A'|'B'|'C'|'D'>>({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);

  // Proctoring & Anti-Cheat State
  const [isAdminTest, setIsAdminTest] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [warningsCount, setWarningsCount] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [terminated, setTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const scrollPillsRef = useRef<HTMLDivElement>(null);
  const mountedTimeRef = useRef<number>(Date.now());

  const handleAdminForceReset = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/quiz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      await initQuiz();
    } catch {
      setLoading(false);
    }
  };

  // 1. Initialize Quiz & Authenticated Session
  const initQuiz = useCallback(async () => {
    setLoading(true);
    setInitError(null);
    try {
      const meRes = await fetch('/api/participant/me');
      const meData = await meRes.json();

      if (!meRes.ok || !meData.success || !meData.participant) {
        router.push('/login');
        return;
      }

      if (!meData.isConfirmed || !meData.participant.participant_id) {
        router.push('/payment');
        return;
      }

      if (meData.isAdmin) {
        setIsAdminTest(true);
      }

      const p: Participant = meData.participant;
      setParticipant(p);

      const res = await fetch('/api/quiz/session');
      const data = await res.json();

      if (data.isAdminTest) {
        setIsAdminTest(true);
      }

      if (res.ok && data.success) {
        const sess: QuizSession = data.session;
        if (sess.status === 'SUBMITTED' || sess.status === 'EXPIRED') {
          if (data.isAdminTest) {
            // Auto reset for admin test
            await handleAdminForceReset();
            return;
          }
          router.push('/quiz-completed');
          return;
        }

        setSession(sess);
        setQuestions(data.questions || []);
        setAnswers(data.existingAnswers || {});

        const now = Date.now();
        const exp = new Date(sess.expires_at).getTime();
        const remaining = Math.max(0, Math.floor((exp - now) / 1000));
        setTimeLeftSeconds(remaining);
      } else {
        setInitError(data.error || 'The quiz portal could not be initialized.');
      }

    } catch (err: any) {
      setInitError('Network error connecting to the quiz engine.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  // 2. Initialize Camera Feed for Live Proctoring
  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    async function startWebcam() {
      try {
        const stream = await getBestCameraStream();
        streamInstance = stream;
        setCameraStream(stream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('[Camera error in quiz]', err);
        const errInfo = getCameraErrorMessage(err);
        setCameraError(errInfo.title);
      }
    }

    startWebcam();

    return () => {
      if (streamInstance) {
        stopCameraStream(streamInstance);
      }
    };
  }, []);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  // 3. Termination Handler (Tab Switching / Violations)
  const terminateAttempt = useCallback(async (reason: string) => {
    if (isAdminTest) return; // Admin bypass for testing / DevTools inspection
    if (isSubmittingRef.current || terminated) return;
    isSubmittingRef.current = true;
    setTerminated(true);
    setTerminationReason(reason);
    setSubmitting(true);

    try {
      if (session) {
        await fetch('/api/quiz/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id, terminationReason: reason })
        });
      }
    } catch {}

    setTimeout(() => {
      router.push('/quiz-completed');
    }, 3500);
  }, [isAdminTest, session, terminated, router]);

  // 4. Tab Switch / Visibility Change Detection (Bypassed for Admins)
  useEffect(() => {
    if (isAdminTest || loading || !session || terminated) return;

    const handleVisibilityChange = () => {
      // 5-second grace period after mounting to ignore initial permissions / layout transitions
      if (Date.now() - mountedTimeRef.current < 5000) return;

      if (document.hidden && !isSubmittingRef.current) {
        terminateAttempt('Unauthorized window / tab switch or app change detected. In accordance with competition rules, your quiz attempt has been immediately terminated.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdminTest, loading, session, terminated, terminateAttempt]);

  // 5. Anti-Cheat: Block Right Click, Copy, Paste, & Developer Tool Keys (Bypassed when Admin is using the web)
  useEffect(() => {
    if (isAdminTest) return; // Allow DevTools, right-click, inspect, copy/paste for admins

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminTest]);

  // 6. Master 25-Minute Overall Timer
  useEffect(() => {
    if (loading || !session || terminated) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          terminateAttempt('25-minute exam time limit reached. Answers submitted automatically.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, session, terminated, terminateAttempt]);

  // 7. Per-Question 30-Second Recommended Pacing Timer
  useEffect(() => {
    setQuestionTimeLeft(30);
  }, [currentIndex]);

  useEffect(() => {
    if (loading || !session || terminated) return;

    const qTimer = setInterval(() => {
      setQuestionTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(qTimer);
  }, [currentIndex, loading, session, terminated]);

  // 8. Auto-scroll question indicator pills
  useEffect(() => {
    if (scrollPillsRef.current) {
      const activeElement = scrollPillsRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  // 9. Answer Selection with Robust Syncing
  const handleSelectOption = async (qId: string, option: 'A'|'B'|'C'|'D') => {
    if (!session || terminated) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
    setSavingQuestionId(qId);
    setSaveError(null);

    let attempts = 0;
    let saved = false;

    while (attempts < 3 && !saved) {
      attempts++;
      try {
        const res = await fetch('/api/quiz/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            questionId: qId,
            selectedOption: option
          })
        });

        if (res.ok) {
          saved = true;
        } else {
          await new Promise(r => setTimeout(r, 400));
        }
      } catch {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    if (!saved) {
      setSaveError('Answer saved locally. Re-syncing with server...');
    }

    setTimeout(() => setSavingQuestionId(null), 300);
  };

  // 10. Manual Submission
  const handleSubmitQuiz = async () => {
    if (!session || terminated || submitting) return;
    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length || 50;

    const confirmMsg = answeredCount < totalCount
      ? `You have answered ${answeredCount} of ${totalCount} questions. Are you sure you want to finalize and submit now?`
      : 'Are you sure you want to submit your quiz attempt now?';

    if (!confirm(confirmMsg)) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      await fetch('/api/quiz/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      });
    } catch {}

    router.push('/quiz-completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-700">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-bold">Connecting to Secure Quiz Server...</span>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-900">
        <div className="max-w-md w-full bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quiz Portal Notice
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {initError}
          </p>

          <div className="pt-3 space-y-2.5">
            {isAdminTest && (
              <button
                type="button"
                onClick={handleAdminForceReset}
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Fresh Admin Test Attempt</span>
              </button>
            )}

            <Link
              href="/quiz-rules"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-sm"
            >
              <span>Return to Competition Rules</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition-all border border-slate-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Participant Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (terminated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-900">
        <div className="max-w-md w-full bg-white border-2 border-rose-500 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <XCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ATTEMPT TERMINATED
          </h2>
          <p className="text-xs sm:text-sm text-rose-700 font-medium leading-relaxed">
            {terminationReason || 'Rule violation detected. Your attempt has been finalized.'}
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Redirecting to submission results...</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!session || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = session.total_questions || questions.length || 50;
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Quiz Top Sticky Header (Light Theme) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3.5 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <Link href="/" className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight font-sans">
            TKFK <span className="text-[#00966b]">2026</span>
          </Link>
          <span className="hidden sm:inline text-xs text-slate-500 font-semibold border-l border-slate-200 pl-3">
            {participant?.name}
          </span>
          {isAdminTest && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-[10px] font-extrabold text-purple-800">
              <Sparkles className="w-3 h-3 text-purple-700" />
              <span>ADMIN TEST</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-extrabold text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>LIVE PROCTORING</span>
          </span>
        </div>

        {/* Timers & Submit Row */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Total Exam Time */}
          <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full font-mono font-bold text-xs sm:text-sm border shadow-2xs ${
            timeLeftSeconds < 300 
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>{timeFormatted}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      {/* Main Body (Light Theme) */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 flex flex-col justify-between pb-28 lg:pb-8">
        
        {saveError && (
          <div className="mb-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Warning Toast Banner if any */}
        {warningMessage && (
          <div className="mb-3 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-medium flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span><strong>Warning {warningsCount}/2:</strong> {warningMessage}</span>
            </div>
            <button onClick={() => setWarningMessage(null)} className="text-xs font-bold underline text-rose-700 hover:text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Mobile Horizontal Swipeable Question Selector Pills */}
        <div className="lg:hidden mb-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Question Tracker</span>
            <span className="text-emerald-700 font-extrabold">{answeredCount}/{totalQuestions} Answered</span>
          </div>

          <div ref={scrollPillsRef} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'bg-amber-500 text-white border-amber-600 font-extrabold ring-2 ring-amber-300 shadow-sm scale-105'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Proctoring Camera Feed & Palette (Desktop) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-5">
            
            {/* Live Camera Feed Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Proctoring Webcam</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  MONITORED
                </span>
              </div>

              <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror scale-x-[-1]"
                />
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-3 text-center space-y-1">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-[11px] text-amber-300 font-medium">{cameraError}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 text-center font-medium leading-relaxed">
                Only the registered participant must remain in frame. Tab switching is strictly monitored.
              </p>
            </div>

            {/* Desktop Question Palette */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Question Palette</h3>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  {answeredCount} / {totalQuestions} Answered
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-full aspect-square rounded-xl text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'bg-amber-500 text-white border-amber-600 font-extrabold ring-4 ring-amber-200 shadow-sm scale-105'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 font-medium'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-saved to server</span>
                </span>
                {savingQuestionId === currentQ.id && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Question Viewer Card (Light Theme) */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            
            <div className="space-y-5 sm:space-y-7">
              
              {/* Question Header & 30s Pacing Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                      {currentQ.category || 'Gandhi History'}
                    </span>
                  </div>

                  {/* 30 Seconds Pace Indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>30s Pace: <strong className={questionTimeLeft < 10 ? 'text-rose-600 text-sm font-extrabold' : 'text-amber-700 font-bold'}>{questionTimeLeft}s</strong></span>
                  </div>
                </div>

                {/* Pace progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${
                      questionTimeLeft > 10 ? 'bg-emerald-500' : questionTimeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${(questionTimeLeft / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-relaxed tracking-tight select-none">
                {currentQ.question_text}
              </h2>

              {/* Options (Clean Light Theme) */}
              <div className="space-y-3 pt-1">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText = currentQ[`option_${optKey.toLowerCase()}` as keyof ClientQuestion];
                  const isSelected = answers[currentQ.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optKey)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border text-sm sm:text-base font-medium transition-all flex items-center gap-4 active:scale-[0.99] cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-[#00966b] text-white border-[#00966b] font-bold shadow-md ring-2 ring-emerald-300'
                          : 'bg-slate-50 hover:bg-emerald-50/40 hover:border-emerald-300 text-slate-800 border-slate-200 active:bg-slate-100'
                      }`}
                    >
                      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm flex-shrink-0 border transition-all ${
                        isSelected 
                          ? 'bg-white text-emerald-800 border-white shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-300 shadow-xs'
                      }`}>
                        {optKey}
                      </span>
                      <span className="leading-snug flex-1">{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Navigation Controls */}
            <div className="hidden lg:flex pt-6 border-t border-slate-100 items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-5 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs disabled:opacity-30 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#00966b] hover:bg-[#00835d] px-7 py-3 rounded-2xl shadow-md transition-all disabled:opacity-30 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Mobile Floating Mini Webcam Box */}
      <div className="lg:hidden fixed bottom-20 right-3 z-40 w-24 h-18 bg-black rounded-2xl overflow-hidden border-2 border-white shadow-xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror scale-x-[-1]"
        />
        <div className="absolute top-1 left-1 bg-rose-600 w-2 h-2 rounded-full animate-ping" />
      </div>

      {/* Mobile Fixed Bottom Action Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between pb-safe shadow-xl">
        <button
          type="button"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 active:bg-slate-100 px-4 py-2.5 rounded-xl bg-white border border-slate-300 disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <span className="text-xs font-bold text-slate-600 font-mono">
          {currentIndex + 1} / {totalQuestions}
        </span>

        {currentIndex === questions.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#00966b] active:bg-[#00835d] px-5 py-2.5 rounded-xl shadow-md active:scale-95"
          >
            <span>Submit</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#00966b] active:bg-[#00835d] px-5 py-2.5 rounded-xl shadow-md active:scale-95"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
