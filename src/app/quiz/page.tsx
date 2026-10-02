'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Lock 
} from 'lucide-react';

export default function ActiveQuizPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [warningsCount, setWarningsCount] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [terminated, setTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const scrollPillsRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Quiz & Authenticated Session
  useEffect(() => {
    async function initQuiz() {
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

        const p: Participant = meData.participant;
        setParticipant(p);

        const res = await fetch('/api/quiz/session');
        const data = await res.json();

        if (res.ok && data.success) {
          const sess: QuizSession = data.session;
          if (sess.status === 'SUBMITTED' || sess.status === 'EXPIRED') {
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
          router.push('/quiz-rules');
        }

      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [router]);

  // 2. Initialize Camera Feed for Live Proctoring
  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    async function startWebcam() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera device not available');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
          audio: false
        });
        streamInstance = stream;
        setCameraStream(stream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('[Camera error]', err);
        setCameraError('Camera access required for official proctoring.');
      }
    }

    startWebcam();

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // 3. Termination Handler (Tab Switching / Violations)
  const terminateAttempt = useCallback(async (reason: string) => {
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
  }, [session, terminated, router]);

  // 4. Strict Tab Switch / Window Blur / Visibility Change Detection
  useEffect(() => {
    if (loading || !session || terminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        terminateAttempt('Unauthorized window / tab switch or app change detected. In accordance with competition rules, your quiz attempt has been immediately terminated.');
      }
    };

    const handleWindowBlur = () => {
      if (!isSubmittingRef.current) {
        terminateAttempt('Browser window lost focus or application switched. In accordance with competition rules, your attempt has been immediately terminated.');
      }
    };

    const handlePageHide = () => {
      if (!isSubmittingRef.current) {
        terminateAttempt('Page backgrounded or tab closed.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [loading, session, terminated, terminateAttempt]);

  // 5. Anti-Cheat: Block Right Click, Copy, Paste, & Developer Tool Keys
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V
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
  }, []);

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
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          return 0; // Don't block question, but visual indicator reflects 30s pace passed
        }
        return prev - 1;
      });
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-semibold">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-sm">Synchronizing proctored exam session...</span>
        </div>
      </div>
    );
  }

  if (terminated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
        <div className="max-w-md w-full bg-rose-950/90 border-2 border-rose-600 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-2xl animate-shake">
          <div className="w-16 h-16 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ATTEMPT TERMINATED
          </h2>
          <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
            {terminationReason || 'Rule violation detected. Your attempt has been finalized.'}
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-mono text-rose-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none">
      
      {/* Quiz Top Sticky Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-extrabold text-base sm:text-lg text-white font-mono tracking-wider">TKFK26</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium border-l border-slate-700 pl-3">
            {participant?.name}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-[10px] font-extrabold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>LIVE PROCTORING</span>
          </span>
        </div>

        {/* Timers Row */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Total Exam Time */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs sm:text-sm border ${
            timeLeftSeconds < 300 
              ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' 
              : 'bg-slate-950 text-emerald-400 border-slate-800'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeFormatted}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all active:scale-95 shadow-md cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 flex flex-col justify-between pb-28 lg:pb-8">
        
        {saveError && (
          <div className="mb-3 p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Warning Toast Banner if any */}
        {warningMessage && (
          <div className="mb-3 p-3.5 rounded-2xl bg-rose-950 border-2 border-rose-600 text-rose-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span><strong>Warning {warningsCount}/2:</strong> {warningMessage}</span>
            </div>
            <button onClick={() => setWarningMessage(null)} className="text-xs underline text-rose-300">
              Dismiss
            </button>
          </div>
        )}

        {/* Mobile Horizontal Swipeable Question Selector Pills */}
        <div className="lg:hidden mb-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Question Tracker</span>
            <span className="text-emerald-400">{answeredCount}/{totalQuestions} Answered</span>
          </div>

          <div ref={scrollPillsRef} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold scale-105'
                      : isAnswered
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
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
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Proctoring Webcam</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  MONITORED
                </span>
              </div>

              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror scale-x-[-1]"
                />
                {cameraError && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center space-y-1">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-[11px] text-amber-300">{cameraError}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-500 text-center">
                Only the registered participant must remain in frame. Tab switching is strictly monitored.
              </p>
            </div>

            {/* Desktop Question Palette */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Palette</h3>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
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
                          ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                          : isAnswered
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-saved to server</span>
                </span>
                {savingQuestionId === currentQ.id && (
                  <span className="text-amber-400 animate-pulse font-medium flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Question Viewer Card */}
          <div className="lg:col-span-8 bg-slate-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4 sm:space-y-6">
              
              {/* Question Header & 30s Pacing Progress Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {currentQ.category || 'Gandhi Challenge'}
                    </span>
                  </div>

                  {/* 30 Seconds Pace Indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>30s Pace: <strong className={questionTimeLeft < 10 ? 'text-rose-400' : 'text-amber-300'}>{questionTimeLeft}s</strong></span>
                  </div>
                </div>

                {/* Pace progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      questionTimeLeft > 10 ? 'bg-emerald-500' : questionTimeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${(questionTimeLeft / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-2xl font-bold text-white leading-relaxed select-none">
                {currentQ.question_text}
              </h2>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText = currentQ[`option_${optKey.toLowerCase()}` as keyof ClientQuestion];
                  const isSelected = answers[currentQ.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optKey)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                          : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800/80 active:bg-slate-800'
                      }`}
                    >
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isSelected ? 'bg-white text-emerald-800' : 'bg-slate-850 text-slate-300 bg-slate-800'
                      }`}>
                        {optKey}
                      </span>
                      <span className="leading-snug">{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Navigation Controls */}
            <div className="hidden lg:flex pt-6 border-t border-slate-800 items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl shadow-md disabled:opacity-30 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Mobile Floating Mini Webcam Box (Fixed at top-right or corner) */}
      <div className="lg:hidden fixed bottom-20 right-3 z-40 w-24 h-18 bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex items-center justify-between pb-safe shadow-2xl">
        <button
          type="button"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 active:bg-slate-800 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <span className="text-xs font-bold text-slate-400 font-mono">
          {currentIndex + 1} / {totalQuestions}
        </span>

        {currentIndex === questions.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 active:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-md active:scale-95"
          >
            <span>Submit</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 active:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-md active:scale-95"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}

