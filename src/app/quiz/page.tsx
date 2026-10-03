'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientQuestion, QuizSession, Participant } from '@/types';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  XCircle, 
  AlertCircle, 
  Lock, 
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
  
  // Per-Question Persistent Remaining Time (30s per question, locked at 0s upon expiry)
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({});
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
    if (isAdminTest) return;

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

  // 7. Strict Per-Question 30-Second Timer (Never Refills, Permanently Locks at 0s)
  const currentQ = questions[currentIndex];
  const currentQId = currentQ?.id;

  useEffect(() => {
    if (loading || !session || terminated || !currentQId) return;

    // Initialize timer for current question if not visited before
    setQuestionTimers(prev => {
      if (prev[currentQId] === undefined) {
        return { ...prev, [currentQId]: 30 };
      }
      return prev;
    });

    const qInterval = setInterval(() => {
      setQuestionTimers(prev => {
        const remaining = prev[currentQId] !== undefined ? prev[currentQId] : 30;
        if (remaining <= 1) {
          clearInterval(qInterval);
          return { ...prev, [currentQId]: 0 };
        }
        return { ...prev, [currentQId]: remaining - 1 };
      });
    }, 1000);

    return () => clearInterval(qInterval);
  }, [currentQId, loading, session, terminated]);

  // 8. Auto-scroll question indicator pills
  useEffect(() => {
    if (scrollPillsRef.current) {
      const activeElement = scrollPillsRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  // 9. Answer Selection with Robust Syncing & Expiration Check
  const handleSelectOption = async (qId: string, option: 'A'|'B'|'C'|'D') => {
    if (!session || terminated) return;

    // Lock answering if time for this question has expired
    const remainingTime = questionTimers[qId] !== undefined ? questionTimers[qId] : 30;
    if (remainingTime <= 0) return;

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3 text-slate-700">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-bold">Connecting to Secure Quiz Server...</span>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 text-slate-900">
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 text-slate-900">
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

  const totalQuestions = session.total_questions || questions.length || 50;
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const answeredCount = Object.keys(answers).length;

  // Active question metrics
  const activeQuestionTimeRemaining = currentQId ? (questionTimers[currentQId] !== undefined ? questionTimers[currentQId] : 30) : 30;
  const isQuestionExpired = activeQuestionTimeRemaining <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      
      {/* Quiz Top Header (Matches Screenshot) */}
      <header className="bg-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-slate-200/80 sticky top-0 z-40 transition-all">
        {/* Left TKFK 2026 Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-extrabold text-lg sm:text-xl text-[#0f172a] tracking-tight">TKFK</span>
            <span className="font-extrabold text-lg sm:text-xl text-[#00966b] tracking-tight">2026</span>
          </Link>
          {isAdminTest && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-[10px] font-extrabold text-purple-800 ml-2">
              <Sparkles className="w-3 h-3 text-purple-700" />
              <span>ADMIN TEST</span>
            </span>
          )}
        </div>

        {/* Right Header: Master Timer + Live Integrated Webcam + Submit Button */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Master 25-Min Timer Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-xs sm:text-sm border shadow-2xs ${
            timeLeftSeconds < 300 
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
              : 'bg-[#ecfdf5] text-slate-800 border-[#a7f3d0]'
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00966b]" />
            <span>{timeFormatted}</span>
          </div>

          {/* Integrated Webcam Preview in Header */}
          <div className="relative w-11 h-9 sm:w-12 sm:h-9 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-2xs flex items-center justify-center flex-shrink-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror scale-x-[-1]"
            />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2 rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-xl mx-auto w-full px-3.5 sm:px-4 py-3 sm:py-5 space-y-3.5 sm:space-y-4">
        
        {saveError && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Warning Toast Banner if any */}
        {warningMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-medium flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span><strong>Warning {warningsCount}/2:</strong> {warningMessage}</span>
            </div>
            <button onClick={() => setWarningMessage(null)} className="text-xs font-bold underline text-rose-700 hover:text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Questions Tracker Card (Matches Screenshot) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-slate-700">Questions</span>
            <span className="font-extrabold text-[#00966b]">{answeredCount} / {totalQuestions}</span>
          </div>

          <div ref={scrollPillsRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isCurrent = idx === currentIndex;
              const qTimeRem = questionTimers[q.id];
              const isExpired = qTimeRem !== undefined && qTimeRem <= 0 && !isAnswered;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all border flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#f59e0b] text-white border-[#d97706] font-extrabold shadow-xs'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                      : isExpired
                      ? 'bg-rose-50 text-rose-600 border-rose-200 line-through opacity-60'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}

            {currentIndex < questions.length - 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex-shrink-0 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Next question"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Active Question Card (Matches Screenshot) */}
        <div className="bg-white p-4.5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 sm:space-y-5">
          
          {/* Question Meta Header & 30s Pacing Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Question Number Pill */}
              <span className="text-xs font-bold text-slate-700 bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200">
                Question {currentIndex + 1} of {totalQuestions}
              </span>

              {/* Category Pill with Shield-Check */}
              <span className="text-xs font-extrabold text-[#00966b] bg-[#ecfdf5] border border-[#a7f3d0] px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00966b]" />
                <span>{currentQ.category || 'Gandhi History'}</span>
              </span>

              {/* Time Left Indicator */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className={`w-4 h-4 ${isQuestionExpired ? 'text-rose-600' : 'text-amber-500'}`} />
                <span className="flex items-center gap-1">
                  Time Left
                  <strong className={`font-extrabold text-sm ${isQuestionExpired ? 'text-rose-600' : 'text-amber-500'}`}>
                    {isQuestionExpired ? '0s' : `${activeQuestionTimeRemaining}s`}
                  </strong>
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/70">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${
                  isQuestionExpired
                    ? 'w-0 bg-rose-500'
                    : activeQuestionTimeRemaining > 10 
                    ? 'bg-[#65a30d]' 
                    : activeQuestionTimeRemaining > 5 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500'
                }`}
                style={{ width: `${(activeQuestionTimeRemaining / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#0f172a] leading-snug tracking-tight select-none pt-0.5">
            {currentQ.question_text}
          </h2>

          {/* Options (A, B, C, D) */}
          <div className="space-y-2.5 sm:space-y-3 pt-1">
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const optText = currentQ[`option_${optKey.toLowerCase()}` as keyof ClientQuestion];
              const isSelected = answers[currentQ.id] === optKey;

              return (
                <button
                  key={optKey}
                  type="button"
                  disabled={isQuestionExpired}
                  onClick={() => handleSelectOption(currentQ.id, optKey)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm md:text-base font-medium transition-all flex items-center gap-3.5 sm:gap-4 active:scale-[0.99] ${
                    isQuestionExpired
                      ? isSelected
                        ? 'bg-slate-200 text-slate-700 border-slate-300 opacity-70 cursor-not-allowed'
                        : 'bg-[#f8fafc] text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#00966b] text-white border-[#00966b] font-bold shadow-sm ring-2 ring-emerald-300 cursor-pointer'
                      : 'bg-[#f8fafc] hover:bg-emerald-50/20 hover:border-emerald-300 text-slate-800 border-slate-200/80 active:bg-slate-100 cursor-pointer shadow-2xs'
                  }`}
                >
                  <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm flex-shrink-0 border transition-all ${
                    isQuestionExpired
                      ? 'bg-slate-200 text-slate-500 border-slate-300'
                      : isSelected 
                      ? 'bg-white text-[#00966b] border-white shadow-2xs' 
                      : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                  }`}>
                    {optKey}
                  </span>
                  <span className="leading-snug flex-1">{optText}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* 3. Bottom Navigation Controls (Previous / Next) */}
        <div className="flex items-center justify-between pt-1 pb-4">
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-5 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] px-6 sm:px-7 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Submit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] px-6 sm:px-7 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </main>

    </div>
  );
}
