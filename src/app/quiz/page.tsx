'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClientQuestion, QuizSession, Participant } from '@/types';
import { Clock, ShieldCheck, CheckCircle2, ChevronLeft, ChevronRight, Save, AlertTriangle, Menu, RefreshCw } from 'lucide-react';

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
  const [submitting, setSubmitting] = useState(false);

  const scrollPillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initQuiz() {
      try {
        const meRes = await fetch('/api/participant/me');
        const meData = await meRes.json();

        if (!meRes.ok || !meData.success || !meData.participant) {
          router.push('/login');
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

  useEffect(() => {
    if (scrollPillsRef.current) {
      const activeElement = scrollPillsRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  const handleAutoSubmit = useCallback(async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/quiz/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      });
    } catch {}
    router.push('/quiz-completed');
  }, [session, submitting, router]);

  useEffect(() => {
    if (loading || !session) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, session, handleAutoSubmit]);

  const handleSelectOption = async (qId: string, option: 'A'|'B'|'C'|'D') => {
    if (!session) return;
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
          await new Promise(r => setTimeout(r, 500));
        }
      } catch {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (!saved) {
      setSaveError('Answer saved locally. Syncing connection...');
    }

    setTimeout(() => setSavingQuestionId(null), 300);
  };

  const handleSubmitQuiz = async () => {
    if (!session) return;
    if (!confirm("Are you sure you want to submit your quiz attempt now?")) return;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-semibold">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Synchronizing quiz session...</span>
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
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      
      {/* Quiz Top Sticky Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base sm:text-lg text-white font-mono">TKFK26</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">| {participant?.name}</span>
        </div>

        {/* Server Countdown Clock */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs sm:text-sm border ${
          timeLeftSeconds < 300 ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' : 'bg-slate-900 text-emerald-400 border-slate-800'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{timeFormatted}</span>
        </div>

        <button
          onClick={handleSubmitQuiz}
          disabled={submitting}
          className="bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all active:scale-95"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 flex flex-col justify-between pb-24 lg:pb-8">
        
        {saveError && (
          <div className="mb-3 p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Mobile Horizontal Swipeable Question Selector Pills */}
        <div className="lg:hidden mb-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-2">
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
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Question Palette Sidebar (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Palette</h3>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                {answeredCount} / {totalQuestions} Answered
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
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
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
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

          {/* Question Viewer Card */}
          <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {currentQ.category || 'General'}
                </span>
              </div>

              <h2 className="text-base sm:text-2xl font-bold text-white leading-relaxed">
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
                      onClick={() => handleSelectOption(currentQ.id, optKey)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 active:scale-[0.99] ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                          : 'bg-slate-900 text-slate-200 border-slate-800 active:bg-slate-800'
                      }`}
                    >
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isSelected ? 'bg-white text-emerald-800' : 'bg-slate-800 text-slate-300'
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
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl shadow-md disabled:opacity-30"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Mobile Fixed Bottom Action Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex items-center justify-between pb-safe shadow-2xl">
        <button
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
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 active:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-md active:scale-95"
          >
            <span>Submit</span>
          </button>
        ) : (
          <button
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
