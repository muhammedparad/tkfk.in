'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientQuestion, QuizSession, Participant, QuizLanguage } from '@/types';
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
  Sparkles, 
  Maximize,
  Languages 
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
  const [language, setLanguage] = useState<QuizLanguage>('ml');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [batchIndex, setBatchIndex] = useState(0);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  
  // Per-Question Persistent Remaining Time (30s per question, locked at 0s upon expiry)
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

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
  const mountedTimeRef = useRef<number>(Date.now());
  const dismissedWarningRef = useRef<string | null>(null);

  // Auto-sync batch index when currentIndex changes
  useEffect(() => {
    setBatchIndex(Math.floor(currentIndex / 10));
  }, [currentIndex]);

  // Load preferred language from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('tkfk_quiz_lang') as QuizLanguage;
      if (savedLang && ['en', 'ml', 'dual'].includes(savedLang)) {
        setLanguage(savedLang);
      }
    } catch {}
  }, []);

  const handleLanguageSwitch = (lang: QuizLanguage) => {
    setLanguage(lang);
    try {
      localStorage.setItem('tkfk_quiz_lang', lang);
    } catch {}
  };

  const handleAdminForceReset = async () => {
    setLoading(true);
    try {
      if (session) {
        localStorage.removeItem(`tkfk_quiz_state_${session.id}`);
      }
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

  // 1. Initialize Quiz & Authenticated Session (With Refresh & Progress State Restoration)
  const initQuiz = useCallback(async () => {
    setLoading(true);
    setInitError(null);
    try {
      const meRes = await fetch('/api/participant/me');
      const meData = await meRes.json();

      if (meData.isAdmin) {
        setIsAdminTest(true);
        const adminParticipant: Participant = meData.participant || {
          id: 'admin-tester-uuid-001',
          name: 'TKFK Admin Tester',
          email: 'admin@tkfk.in',
          phone: '9999999999',
          state: 'Kerala',
          status: 'ACTIVE',
          participant_id: 'TKFK26-ADMIN99',
          created_at: new Date().toISOString()
        };
        setParticipant(adminParticipant);
      } else {
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
      }

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
        const questionsList = data.questions || [];
        setQuestions(questionsList);
        setAnswers(data.existingAnswers || {});

        // 1a. Authoritative Exam Timer from Database expires_at
        const now = Date.now();
        const exp = new Date(sess.expires_at).getTime();
        const remaining = Math.max(0, Math.floor((exp - now) / 1000));
        setTimeLeftSeconds(remaining);

        // 1b. Restore Per-Question Timers and Active Index from Persistent Storage
        const storageKey = `tkfk_quiz_state_${sess.id}`;
        let restoredTimers: Record<string, number> = {};
        let restoredIndex = 0;

        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.questionTimers) {
              restoredTimers = parsed.questionTimers;
            }
            if (
              typeof parsed.currentIndex === 'number' &&
              parsed.currentIndex >= 0 &&
              parsed.currentIndex < questionsList.length
            ) {
              restoredIndex = parsed.currentIndex;
            }

            // Deduct elapsed seconds if reloaded mid-question
            if (parsed.lastSavedTimestamp && parsed.currentQuestionId) {
              const elapsed = Math.floor((Date.now() - parsed.lastSavedTimestamp) / 1000);
              if (elapsed > 0 && restoredTimers[parsed.currentQuestionId] !== undefined) {
                restoredTimers[parsed.currentQuestionId] = Math.max(0, restoredTimers[parsed.currentQuestionId] - elapsed);
              }
            }
          }
        } catch {}

        setQuestionTimers(restoredTimers);
        setCurrentIndex(restoredIndex);

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

  // Save Per-Question Timers and Current Index continuously to Persistent Storage
  const currentQ = questions[currentIndex];
  const currentQId = currentQ?.id;

  useEffect(() => {
    if (!session || !currentQId) return;
    try {
      const storageKey = `tkfk_quiz_state_${session.id}`;
      localStorage.setItem(storageKey, JSON.stringify({
        currentIndex,
        questionTimers,
        currentQuestionId: currentQId,
        lastSavedTimestamp: Date.now()
      }));
    } catch {}
  }, [session, currentIndex, currentQId, questionTimers]);

  // 2. Initialize Camera Feed for Live Proctoring
  useEffect(() => {
    let isMounted = true;
    let streamInstance: MediaStream | null = null;

    async function startWebcam() {
      try {
        const stream = await getBestCameraStream();
        if (!isMounted) {
          stopCameraStream(stream);
          return;
        }
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
        if (isMounted) {
          setCameraError(errInfo.title);
        }
      }
    }

    startWebcam();

    return () => {
      isMounted = false;
      if (streamInstance) {
        stopCameraStream(streamInstance);
      }
    };
  }, []);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && cameraStream) {
      if (node.srcObject !== cameraStream) {
        node.srcObject = cameraStream;
      }
      node.play().catch(() => {});
    }
  }, [cameraStream]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, loading]);

  // 3. Termination Handler (Violations)
  const terminateAttempt = useCallback(async (reason: string) => {
    if (isAdminTest) return;
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

  // 4. Periodic Live Proctoring Frame & Telemetry Streaming
  useEffect(() => {
    if (loading || !session || !participant) return;

    let isStreaming = true;
    let offscreenCanvas: HTMLCanvasElement | null = null;

    const transmitFrame = async () => {
      if (!isStreaming) return;

      try {
        let frameData: string | null = null;
        if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          if (!offscreenCanvas) {
            offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = 240;
            offscreenCanvas.height = 180;
          }
          const ctx = offscreenCanvas.getContext('2d');
          if (ctx) {
            ctx.save();
            ctx.translate(offscreenCanvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
            ctx.restore();
            frameData = offscreenCanvas.toDataURL('image/jpeg', 0.45);
          }
        }

        const res = await fetch('/api/quiz/proctoring-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            participantId: participant.id,
            imageData: frameData,
            currentIndex,
            answeredCount: Object.keys(answers).length,
            timeLeftSeconds,
            warningsCount,
            warningMessage,
            isFullscreen,
            isTerminated: terminated,
            terminationReason
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (typeof data.warningsCount === 'number') {
            setWarningsCount(data.warningsCount);
          }
          // Check for remote proctor warning from admin
          if (data.adminWarning) {
            if (data.adminWarning !== dismissedWarningRef.current) {
              setWarningMessage(data.adminWarning);
            }
          } else {
            // Server has no active warning or it was cleared/dismissed
            if (warningMessage) {
              setWarningMessage(null);
            }
          }
          // Check for remote force termination from admin
          if (data.forceTerminated && !terminated) {
            terminateAttempt(data.terminationReason || 'Quiz attempt terminated by proctor administrator.');
          }
        }
      } catch {}
    };

    // Immediate initial sync
    transmitFrame();

    // Stream every 3.5 seconds
    const interval = setInterval(transmitFrame, 3500);

    return () => {
      isStreaming = false;
      clearInterval(interval);
    };
  }, [loading, session, participant, currentIndex, answers, timeLeftSeconds, warningsCount, warningMessage, isFullscreen, terminated, terminationReason, terminateAttempt]);

  // 5. Fullscreen Detection & Management
  useEffect(() => {
    const checkFullscreenStatus = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    checkFullscreenStatus();

    document.addEventListener('fullscreenchange', checkFullscreenStatus);
    document.addEventListener('webkitfullscreenchange', checkFullscreenStatus);
    document.addEventListener('mozfullscreenchange', checkFullscreenStatus);
    document.addEventListener('MSFullscreenChange', checkFullscreenStatus);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreenStatus);
      document.removeEventListener('webkitfullscreenchange', checkFullscreenStatus);
      document.removeEventListener('mozfullscreenchange', checkFullscreenStatus);
      document.removeEventListener('MSFullscreenChange', checkFullscreenStatus);
    };
  }, []);

  const requestFullscreenMode = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).msRequestFullscreen) {
        await (docEl as any).msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Failed to re-enter fullscreen:', err);
    }
  };

  // 5. Tab Switch / Visibility Change Detection (Bypassed for Admins)
  useEffect(() => {
    if (isAdminTest || loading || !session || terminated) return;

    let hiddenTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (Date.now() - mountedTimeRef.current < 5000) return;

      if (document.hidden && !isSubmittingRef.current) {
        // Allow a 4-second grace window for accidental mobile swipe / notification banner dismissals
        hiddenTimeout = setTimeout(() => {
          if (document.hidden && !isSubmittingRef.current) {
            terminateAttempt('Unauthorized window / tab switch or app change detected. In accordance with competition rules, your quiz attempt has been immediately terminated.');
          }
        }, 4000);
      } else {
        if (hiddenTimeout) {
          clearTimeout(hiddenTimeout);
          hiddenTimeout = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (hiddenTimeout) clearTimeout(hiddenTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdminTest, loading, session, terminated, terminateAttempt]);

  // 6. Back Button / History Navigation Trap (Prevents accidental swipe-to-back gestures from closing the quiz)
  useEffect(() => {
    if (isAdminTest || loading || !session || terminated) return;

    try {
      window.history.pushState({ inQuiz: true }, '', window.location.href);
    } catch {}

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      try {
        window.history.pushState({ inQuiz: true }, '', window.location.href);
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAdminTest, loading, session, terminated]);

  // 7. Anti-Cheat: Block Right Click, Copy, Paste, & DevTools (Bypassed for Admins)
  useEffect(() => {
    if (isAdminTest) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block DevTools & Inspection
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

  // 8. Master 25-Minute Overall Timer (Runs continuously)
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

  // 9. Strict Per-Question 30-Second Timer (Runs continuously even when locked, persists across reload)
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

  // 10. Answer Selection with Robust Syncing & Expiration/Fullscreen Check
  const handleSelectOption = async (qId: string, option: 'A'|'B'|'C'|'D') => {
    if (!session || terminated) return;

    // Lock answering if out of fullscreen
    if (!isFullscreen) return;

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

  // 10b. Dismiss Warning Handler
  const handleDismissWarning = useCallback(async () => {
    const currentMsg = warningMessage;
    dismissedWarningRef.current = currentMsg;
    setWarningMessage(null);

    // Notify backend immediately so it clears the admin_warning
    if (session && participant && currentMsg) {
      try {
        await fetch('/api/quiz/proctoring-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            participantId: participant.id,
            dismissWarning: true,
            dismissedWarning: currentMsg,
            currentIndex,
            answeredCount: Object.keys(answers).length,
            timeLeftSeconds,
            warningsCount,
            isFullscreen,
            isTerminated: terminated,
            terminationReason
          })
        });
      } catch {}
    }
  }, [session, participant, warningMessage, currentIndex, answers, timeLeftSeconds, warningsCount, isFullscreen, terminated, terminationReason]);

  // 11. Manual Submission
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
      if (session) {
        localStorage.removeItem(`tkfk_quiz_state_${session.id}`);
      }
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

  // 10-Question Batch Calculations
  const startIndex = batchIndex * 10;
  const endIndex = Math.min(questions.length, startIndex + 10);
  const visibleQuestions = questions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      
      {/* Fullscreen Required Locking Modal Overlay */}
      {!isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-amber-400 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Maximize className="w-8 h-8 text-amber-600" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900">
                Fullscreen Mode Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                You have exited fullscreen mode. In accordance with competition rules, answering questions is locked until you return to fullscreen.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold">
              Warning: The timer is running while locked! Return to fullscreen immediately to answer.
            </div>

            <button
              type="button"
              onClick={requestFullscreenMode}
              className="w-full bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Maximize className="w-4 h-4" />
              <span>Return to Fullscreen & Resume Quiz</span>
            </button>

            {isAdminTest && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                >
                  Admin Testing Bypass (Stay in windowed mode)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Top Header */}
      <header className="bg-white px-4 py-3 sm:px-8 sm:py-3.5 flex items-center justify-between border-b border-slate-200/80 sticky top-0 z-40 transition-all shadow-2xs">
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

        {/* Right Header: Language Switcher + Master Timer + Live Integrated Webcam + Submit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('ml')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'ml' 
                  ? 'bg-[#00966b] text-white shadow-xs font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="മലയാളത്തിൽ കാണുക"
            >
              മലയാളം
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en' 
                  ? 'bg-[#00966b] text-white shadow-xs font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="View in English"
            >
              English
            </button>
          </div>

          {/* Master 25-Min Timer Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-mono font-bold text-xs sm:text-sm border shadow-2xs ${
            timeLeftSeconds < 300 
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
              : 'bg-[#ecfdf5] text-slate-800 border-[#a7f3d0]'
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00966b]" />
            <span>{timeFormatted}</span>
          </div>

          {/* Integrated Webcam Preview in Header */}
          <div className="relative w-10 h-8 sm:w-14 sm:h-10 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-2xs flex items-center justify-center flex-shrink-0">
            <video
              ref={setVideoRef}
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
            className="bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            {submitting ? '...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Expanded Main Container (Generous width & comfortable padding) */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
        
        {saveError && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Warning Toast Banner if any */}
        {warningMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-medium flex items-center justify-between shadow-md transition-all animate-in fade-in">
            <div className="flex items-center gap-2 pr-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span><strong>Warning {Math.max(1, warningsCount)}/2:</strong> {warningMessage}</span>
            </div>
            <button 
              type="button"
              onClick={handleDismissWarning} 
              className="text-xs font-bold underline text-rose-700 hover:text-rose-900 cursor-pointer ml-3 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-rose-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Questions Tracker Card (Shows exactly 10 in row with Prev/Next 10 Arrow Buttons) */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-slate-700">Questions</span>
            <span className="font-extrabold text-[#00966b]">{answeredCount} / {totalQuestions}</span>
          </div>

          <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 py-0.5">
            {/* Previous 10 Arrow Button */}
            {batchIndex > 0 ? (
              <button
                type="button"
                onClick={() => setBatchIndex(prev => Math.max(0, prev - 1))}
                className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Show previous 10 questions"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-0 sm:w-0" />
            )}

            {/* Exact 10 Question Circle Pills */}
            <div className="flex items-center justify-between flex-1 gap-1 sm:gap-2">
              {visibleQuestions.map((q, localIdx) => {
                const globalIdx = startIndex + localIdx;
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = globalIdx === currentIndex;
                const qTimeRem = questionTimers[q.id];
                const isExpired = qTimeRem !== undefined && qTimeRem <= 0 && !isAnswered;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(globalIdx)}
                    className={`flex-1 max-w-[38px] aspect-square rounded-full text-xs sm:text-sm font-bold transition-all border flex items-center justify-center cursor-pointer shadow-2xs ${
                      isCurrent
                        ? 'bg-[#f59e0b] text-white border-[#d97706] font-extrabold shadow-sm ring-2 ring-amber-200 scale-105'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold hover:bg-emerald-200'
                        : isExpired
                        ? 'bg-rose-50 text-rose-600 border-rose-200 line-through opacity-70'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {globalIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Next 10 Arrow Button */}
            {endIndex < questions.length ? (
              <button
                type="button"
                onClick={() => setBatchIndex(prev => Math.min(Math.floor((questions.length - 1) / 10), prev + 1))}
                className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Show next 10 questions"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-0 sm:w-0" />
            )}
          </div>
        </div>

        {/* 2. Expanded Active Question Card */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5 sm:space-y-6">
          
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

          {/* Question Text (Dynamic based on selected language) */}
          <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#0f172a] leading-snug tracking-tight select-none pt-1">
            {language === 'en' ? currentQ.question_text : (currentQ.question_text_ml || currentQ.question_text)}
          </h2>

          {/* Options (Expanded, Solid High-Contrast Styling) */}
          <div className="space-y-3 pt-1">
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const optTextEn = currentQ[`option_${optKey.toLowerCase()}` as keyof ClientQuestion];
              const optTextMl = currentQ[`option_${optKey.toLowerCase()}_ml` as keyof ClientQuestion];
              const isSelected = answers[currentQ.id] === optKey;
              const displayText = language === 'en' ? optTextEn : (optTextMl || optTextEn);

              return (
                <button
                  key={optKey}
                  type="button"
                  disabled={isQuestionExpired || !isFullscreen}
                  onClick={() => handleSelectOption(currentQ.id, optKey)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border text-sm sm:text-base font-medium transition-all flex items-center gap-4 active:scale-[0.99] shadow-2xs ${
                    isQuestionExpired || !isFullscreen
                      ? isSelected
                        ? 'bg-slate-100 text-slate-800 border-slate-300 opacity-80 cursor-not-allowed font-semibold'
                        : 'bg-[#f8fafc] text-slate-600 border-slate-200 opacity-70 cursor-not-allowed font-normal'
                      : isSelected
                      ? 'bg-[#00966b] text-white border-[#00966b] font-bold shadow-md ring-2 ring-emerald-300 cursor-pointer'
                      : 'bg-[#f8fafc] hover:bg-emerald-50/30 hover:border-emerald-300 text-slate-900 border-slate-200/90 active:bg-slate-100 cursor-pointer'
                  }`}
                >
                  <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm flex-shrink-0 border transition-all ${
                    isQuestionExpired || !isFullscreen
                      ? isSelected
                        ? 'bg-white text-emerald-800 border-slate-300'
                        : 'bg-white text-slate-600 border-slate-200'
                      : isSelected 
                      ? 'bg-white text-[#00966b] border-white shadow-2xs' 
                      : 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                  }`}>
                    {optKey}
                  </span>
                  <span className={`flex-1 leading-snug ${isSelected ? 'font-bold' : ''}`}>
                    {displayText}
                  </span>
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
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-5 sm:px-6 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] px-6 sm:px-8 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Submit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#00966b] hover:bg-[#00835d] active:bg-[#00704f] px-6 sm:px-8 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
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
