'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ClientQuestion, QuizLanguage } from '@/types';
import { 
  PlayCircle, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  ExternalLink, 
  Award, 
  Eye, 
  EyeOff, 
  HelpCircle,
  RefreshCw,
  Zap,
  Check,
  Languages
} from 'lucide-react';
import { getBestCameraStream, stopCameraStream, getCameraErrorMessage } from '@/lib/camera';

interface TestResult {
  score: number;
  totalQuestions: number;
  accuracy: number;
  durationSeconds: number;
  durationFormatted: string;
  reviewList: Array<{
    questionOrder: number;
    questionId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    selectedOption: string | null;
    correctOption: string;
    isCorrect: boolean;
    category?: string;
  }>;
}

export default function AdminQuizTestPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalQuestionsAvailable, setTotalQuestionsAvailable] = useState(0);

  // Active Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, 'A'|'B'|'C'|'D'>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<QuizLanguage>('ml');

  // Testing Toggles
  const [showAnswerHints, setShowAnswerHints] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  
  // Timer State
  const [masterTimeLeft, setMasterTimeLeft] = useState<number>(25 * 60);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(30);
  const [timerRunning, setTimerRunning] = useState(false);

  // Proctoring Simulator State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [simulatedWarnings, setSimulatedWarnings] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  // Submission Results State
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const dismissedWarningRef = useRef<string | null>(null);

  // Question Bank Selector State
  const [selectedBank, setSelectedBank] = useState<'previous' | 'current'>('previous');

  // Load existing test session on mount
  const loadTestSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quiz-test?bank=${selectedBank}`);
      if (res.ok) {
        const data = await res.json();
        setTotalQuestionsAvailable(data.totalQuestionsAvailable || 0);

        if (data.currentSession && data.sessionQuestions?.length > 0) {
          setSessionId(data.currentSession.id);
          setSessionStatus(data.currentSession.status);
          setQuestions(data.sessionQuestions);

          if (data.currentSession.status === 'IN_PROGRESS') {
            const now = Date.now();
            const exp = new Date(data.currentSession.expires_at).getTime();
            const remaining = Math.max(0, Math.floor((exp - now) / 1000));
            setMasterTimeLeft(remaining);
            setTimerRunning(true);
          }
        }
      }
    } catch (err) {
      console.error('[Load Test Session Error]', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBank]);

  useEffect(() => {
    loadTestSession();
  }, [loadTestSession]);

  // Start / Force Restart Test Attempt
  const handleStartTest = async (forceReset = true, bankToUse = selectedBank) => {
    setActionLoading(true);
    setTestResult(null);
    setShowResultsModal(false);
    setIsTerminated(false);
    setTerminationReason(null);
    setSimulatedWarnings(0);
    setWarningMessage(null);

    try {
      const res = await fetch('/api/admin/quiz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', forceReset, bank: bankToUse })
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
        setSessionStatus(data.session.status);
        setQuestions(data.questions || []);
        setAnswers({});
        setCurrentIndex(0);
        setMasterTimeLeft(25 * 60);
        setQuestionTimeLeft(30);
        setTimerRunning(true);
      }
    } catch (err) {
      console.error('[Start Test Error]', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Test Session
  const handleResetSession = async () => {
    if (!confirm('Are you sure you want to reset the admin test quiz session?')) return;
    setActionLoading(true);
    try {
      await fetch('/api/admin/quiz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      setSessionId(null);
      setSessionStatus(null);
      setQuestions([]);
      setAnswers({});
      setTestResult(null);
      setTimerRunning(false);
      setIsTerminated(false);
    } catch (err) {
      console.error('[Reset Error]', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Webcam Starter
  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraStreamRef.current) {
        stopCameraStream(cameraStreamRef.current);
        cameraStreamRef.current = null;
      }
      setCameraActive(false);
      return;
    }

    try {
      const stream = await getBestCameraStream();
      cameraStreamRef.current = stream;
      setCameraActive(true);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[Camera Error]', err);
      const errInfo = getCameraErrorMessage(err);
      setCameraError(`${errInfo.title}: ${errInfo.hint}`);
    }
  };

  useEffect(() => {
    if (cameraActive && cameraStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        stopCameraStream(cameraStreamRef.current);
      }
    };
  }, []);

  // Periodic Proctoring Frame Stream for Admin Live Surveillance Wall
  useEffect(() => {
    if (!sessionId) return;
    let isBroadcasting = true;
    let offscreenCanvas: HTMLCanvasElement | null = null;

    const transmitFrame = async () => {
      if (!isBroadcasting) return;
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
            sessionId,
            participantId: 'admin-tester-01',
            imageData: frameData,
            currentIndex,
            answeredCount: Object.keys(answers).length,
            timeLeftSeconds: masterTimeLeft,
            warningsCount: simulatedWarnings,
            warningMessage,
            isFullscreen: true,
            isTerminated,
            terminationReason
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.adminWarning) {
            if (data.adminWarning !== dismissedWarningRef.current) {
              setWarningMessage(data.adminWarning);
            }
          } else {
            if (warningMessage) setWarningMessage(null);
          }
        }
      } catch {}
    };

    transmitFrame();
    const interval = setInterval(transmitFrame, 3500);

    return () => {
      isBroadcasting = false;
      clearInterval(interval);
    };
  }, [sessionId, currentIndex, answers, masterTimeLeft, simulatedWarnings, warningMessage, isTerminated, terminationReason]);

  // Master Countdown
  useEffect(() => {
    if (!timerRunning || isTerminated || !sessionId) return;
    const timer = setInterval(() => {
      setMasterTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerRunning, isTerminated, sessionId]);

  // Per-Question 30s Pacing Timer
  useEffect(() => {
    setQuestionTimeLeft(30);
  }, [currentIndex]);

  useEffect(() => {
    if (!timerRunning || isTerminated || !sessionId) return;
    const qTimer = setInterval(() => {
      setQuestionTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentIndex, timerRunning, isTerminated, sessionId]);

  // Answer Option Selection
  const handleSelectOption = async (qId: string, option: 'A'|'B'|'C'|'D') => {
    if (!sessionId || isTerminated) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
    setSavingQuestionId(qId);

    try {
      await fetch('/api/admin/quiz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_answer',
          sessionId,
          questionId: qId,
          selectedOption: option
        })
      });
    } catch {}

    setTimeout(() => setSavingQuestionId(null), 300);
  };

  // Submit Test Quiz Attempt
  const handleSubmitQuiz = async () => {
    if (!sessionId || actionLoading) return;
    setActionLoading(true);
    setTimerRunning(false);

    try {
      const res = await fetch('/api/admin/quiz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          sessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data.results);
        setShowResultsModal(true);
        setSessionStatus('SUBMITTED');
      }
    } catch (err) {
      console.error('[Submit Error]', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Anti-Cheat Simulation Triggers
  const triggerMultiPersonWarning = () => {
    const nextCount = simulatedWarnings + 1;
    setSimulatedWarnings(nextCount);
    if (nextCount >= 2) {
      setIsTerminated(true);
      setTerminationReason('2 warnings exceeded: Multiple persons detected on camera. Attempt automatically terminated.');
      setTimerRunning(false);
    } else {
      setWarningMessage(`Warning ${nextCount}/2: Multiple persons detected on camera frame. Ensure only registered participant is visible.`);
    }
  };

  const triggerTabSwitchTermination = () => {
    setIsTerminated(true);
    setTerminationReason('Unauthorized tab switch / window blur detected. In accordance with strict competition rules, attempt is immediately terminated.');
    setTimerRunning(false);
    if (sessionId) {
      fetch('/api/quiz/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, terminationReason: 'Admin Tab Switch Simulation' })
      }).catch(() => {});
    }
  };

  const handleDismissWarning = async () => {
    const currentMsg = warningMessage;
    dismissedWarningRef.current = currentMsg;
    setWarningMessage(null);
    if (sessionId) {
      try {
        await fetch('/api/quiz/proctoring-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            participantId: 'admin-tester-01',
            dismissWarning: true,
            dismissedWarning: currentMsg,
            currentIndex,
            answeredCount: Object.keys(answers).length,
            timeLeftSeconds: masterTimeLeft,
            warningsCount: simulatedWarnings,
            isFullscreen: true,
            isTerminated,
            terminationReason
          })
        });
      } catch {}
    }
  };

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentIndex];
  const mins = Math.floor(masterTimeLeft / 60);
  const secs = masterTimeLeft % 60;
  const masterFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                Admin Testing Sandbox
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                {totalQuestionsAvailable} Questions in Bank
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Live Quiz Simulator & Proctoring Tester</span>
            </h1>
            <p className="text-xs text-slate-500">
              Test all 50 questions, 30s pacing, live camera dock, anti-cheat detection, and automatic score calculations with full date-gate bypass.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            {/* Question Bank Switcher Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedBank('previous');
                  if (!sessionId) loadTestSession();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedBank === 'previous'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                Previous Bank (4:00 PM)
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedBank('current');
                  if (!sessionId) loadTestSession();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedBank === 'current'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                Re-conduct Bank (7:00 PM)
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleStartTest(true, selectedBank)}
              disabled={actionLoading}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{sessionId ? 'Restart Test' : 'Launch Simulator'}</span>
            </button>

            {sessionId && (
              <button
                type="button"
                onClick={handleResetSession}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            )}

            <Link
              href="/quiz-rules"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public UI (/quiz)</span>
            </Link>
          </div>
        </div>

        {/* Termination Overlay Notice if Triggered */}
        {isTerminated && (
          <div className="bg-rose-950 border-2 border-rose-600 text-white p-5 rounded-3xl space-y-2 shadow-lg animate-shake">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>ATTEMPT TERMINATION TEST TRIGGERED</span>
            </div>
            <p className="text-xs text-rose-100">
              {terminationReason}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleStartTest(true, selectedBank)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Restart Fresh Attempt
              </button>
            </div>
          </div>
        )}

        {/* Warning Toast if Active */}
        {warningMessage && !isTerminated && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-2xl flex items-center justify-between text-xs font-medium transition-all animate-in fade-in">
            <div className="flex items-center gap-2 pr-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{warningMessage}</span>
            </div>
            <button 
              type="button"
              onClick={handleDismissWarning} 
              className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer ml-3 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* If No Active Session */}
        {!sessionId || questions.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-5 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
              <PlayCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Ready to Test Competition Quiz</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your target question bank below and launch a 50-question sandbox session with live scoring and proctoring.
              </p>
            </div>

            {/* Bank Choice in Launch Card */}
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <button
                type="button"
                onClick={() => setSelectedBank('previous')}
                className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                  selectedBank === 'previous'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-300 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="block font-bold">Previous Bank</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">4:00 PM Session (50 Qs)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBank('current')}
                className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                  selectedBank === 'current'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="block font-bold">Re-conduct Bank</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">7:00 PM Session (50 Qs)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleStartTest(true, selectedBank)}
              disabled={actionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Initializing Test Quiz...' : `Launch Simulator (${selectedBank === 'previous' ? 'Previous Bank' : 'Re-conduct Bank'})`}
            </button>
          </div>
        ) : (
          /* Active Simulator Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Proctoring & Tools (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Webcam & Proctoring Dock */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Live Proctoring Webcam</span>
                  </span>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      cameraActive 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {cameraActive ? '🔴 Camera Active' : 'Start Camera'}
                  </button>
                </div>

                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror scale-x-[-1]"
                  />
                  {!cameraActive && (
                    <div className="text-center p-3 text-slate-500 space-y-1">
                      <Camera className="w-6 h-6 mx-auto text-slate-600" />
                      <span className="text-[11px] block">Camera not started</span>
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 bg-black/90 p-3 text-center flex flex-col items-center justify-center text-rose-300 text-xs">
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>

                {/* Proctoring Test Triggers */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Anti-Cheat Test Controls
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={triggerMultiPersonWarning}
                      className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-800 text-[11px] font-bold transition-all text-center cursor-pointer"
                    >
                      +1 Person Warning ({simulatedWarnings}/2)
                    </button>
                    <button
                      type="button"
                      onClick={triggerTabSwitchTermination}
                      className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-800 text-[11px] font-bold transition-all text-center cursor-pointer"
                    >
                      Simulate Tab Switch
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Palette */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Question Palette ({questions.length})
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {answeredCount} / {questions.length} Answered
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(answers[q.id]);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-full aspect-square rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                            : isAnswered
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Developer Answer Peek Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showAnswerHints}
                      onChange={(e) => setShowAnswerHints(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Peek Correct Answer & Notes</span>
                  </label>
                  {showAnswerHints ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Question Viewer (8 cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              {/* Header Bar with Timers & Language Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {currentQ?.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Language Switcher */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLanguage('ml')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        language === 'ml' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      മലയാളം
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                  </div>

                  {/* Master 25m countdown */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs bg-slate-900 text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Exam: {masterFormatted}</span>
                  </div>

                  {/* 30s Pacing bar */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200">
                    <span>30s Pace: {questionTimeLeft}s</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Submit Test
                  </button>
                </div>
              </div>

              {/* 30s Visual Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    questionTimeLeft > 10 ? 'bg-emerald-500' : questionTimeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(questionTimeLeft / 30) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              {currentQ ? (
                <div className="space-y-4">
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
                    {language === 'en' ? currentQ.question_text : (currentQ.question_text_ml || currentQ.question_text)}
                  </h2>

                  {/* Options */}
                  <div className="space-y-2.5 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optTextEn = currentQ[`option_${optKey.toLowerCase()}` as keyof ClientQuestion];
                      const optTextMl = currentQ[`option_${optKey.toLowerCase()}_ml` as keyof ClientQuestion];
                      const isSelected = answers[currentQ.id] === optKey;
                      const isCorrect = (currentQ as any).correct_option === optKey;
                      const displayText = language === 'en' ? optTextEn : (optTextMl || optTextEn);

                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optKey)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md'
                              : showAnswerHints && isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {optKey}
                            </span>
                            <div className="flex flex-col leading-snug">
                              <span className={isSelected ? 'font-bold' : ''}>{displayText}</span>
                            </div>
                          </div>

                          {showAnswerHints && isCorrect && (
                            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex-shrink-0">
                              ✓ Correct Answer
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Auto-save Indicator */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingQuestionId === currentQ.id ? 'Syncing...' : 'Auto-saved to server database'}</span>
                    </span>
                    <span>Question ID: {currentQ.id}</span>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Loading question...</div>
              )}

              {/* Navigation Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-30 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Results Modal / Dialog */}
        {showResultsModal && testResult && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Quiz Submission Evaluation</h3>
                    <p className="text-xs text-slate-500">Live score & accuracy calculation</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResultsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Score</span>
                  <p className="text-2xl font-black text-emerald-900">{testResult.score} / {testResult.totalQuestions}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accuracy</span>
                  <p className="text-2xl font-black text-slate-900">{testResult.accuracy}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Duration</span>
                  <p className="text-2xl font-black text-slate-900">{testResult.durationFormatted}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tie-break Secs</span>
                  <p className="text-2xl font-black text-slate-900">{testResult.durationSeconds}s</p>
                </div>
              </div>

              {/* Question Breakdown List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Full Question Review Breakdown
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {testResult.reviewList.map((item) => (
                    <div 
                      key={item.questionId}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        item.isCorrect 
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Q{item.questionOrder}.</span>
                          <span className="truncate font-medium">{item.questionText}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Selected: <strong>{item.selectedOption || 'None'}</strong> • Correct: <strong className="text-emerald-700">{item.correctOption}</strong>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {item.isCorrect ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                            CORRECT (+1)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[10px]">
                            INCORRECT (0)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowResultsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  Close Review
                </button>

                <button
                  type="button"
                  onClick={() => handleStartTest(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Start Another Test Attempt
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
