import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { DBService } from '@/services/db';
import { QuizEngineService } from '@/services/quizEngine';
import { EVENT_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bank = searchParams.get('bank') || 'current';
    const adminTestParticipant = await DBService.getOrCreateAdminTestParticipant();
    const allQuestions = await DBService.getAdminQuestions(bank);
    const banks = DBService.getAdminQuestionBanks();

    // Check if there is an active or existing session for the admin test participant
    let sessionData = null;
    try {
      sessionData = await QuizEngineService.startSession(adminTestParticipant.id, true, bank);
    } catch {}

    return NextResponse.json({
      success: true,
      participant: adminTestParticipant,
      activeBank: bank,
      banks,
      totalQuestionsAvailable: allQuestions.length,
      config: {
        totalQuestions: EVENT_CONFIG.totalQuestions,
        timeLimitMinutes: EVENT_CONFIG.timeLimitMinutes,
        secondsPerQuestion: EVENT_CONFIG.secondsPerQuestion,
        eventDateDisplay: EVENT_CONFIG.eventDateDisplay,
        quizTimingDisplay: EVENT_CONFIG.quizTimingDisplay
      },
      currentSession: sessionData?.session || null,
      sessionQuestions: sessionData?.questions || []
    });

  } catch (err: any) {
    console.error('[API ADMIN QUIZ TEST GET ERROR]', err);
    return NextResponse.json({ error: err.message || 'Request failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { action, bank } = body;

    const adminTestParticipant = await DBService.getOrCreateAdminTestParticipant();

    if (action === 'start') {
      if (body.forceReset) {
        await DBService.resetQuizSessionForParticipant(adminTestParticipant.id);
      }

      const sessionData = await QuizEngineService.startSession(adminTestParticipant.id, true, bank || 'current');
      return NextResponse.json({
        success: true,
        session: sessionData.session,
        questions: sessionData.questions
      });
    }

    if (action === 'save_answer') {
      const { sessionId, questionId, selectedOption } = body;
      if (!sessionId || !questionId || !selectedOption) {
        return NextResponse.json({ error: 'sessionId, questionId, selectedOption are required' }, { status: 400 });
      }

      const ok = await QuizEngineService.autoSaveAnswer(sessionId, questionId, selectedOption);
      return NextResponse.json({ success: ok });
    }

    if (action === 'submit') {
      const { sessionId } = body;
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
      }

      const finalSession = await QuizEngineService.submitSession(sessionId);
      const frozenQuestions = await DBService.getFrozenSessionQuestions(sessionId);
      
      // Get all answers for review
      let rawAnswers: any[] = [];
      if (typeof (DBService as any).getQuizSessionAnswers === 'function') {
        rawAnswers = await (DBService as any).getQuizSessionAnswers(sessionId);
      }

      const answersMap = new Map(rawAnswers.map(a => [a.question_id, a.selected_option]));

      let correctCount = 0;
      const reviewList = frozenQuestions.map((q, index) => {
        const selected = answersMap.get(q.question_id) || null;
        const isCorrect = selected === q.correct_option;
        if (isCorrect) correctCount++;
        return {
          questionOrder: q.question_order || index + 1,
          questionId: q.question_id,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          selectedOption: selected,
          correctOption: q.correct_option,
          isCorrect,
          category: q.category
        };
      });

      const totalQ = frozenQuestions.length || EVENT_CONFIG.totalQuestions || 50;
      const score = finalSession.score !== undefined ? finalSession.score : correctCount;
      const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;

      const startedTime = new Date(finalSession.started_at).getTime();
      const submittedTime = finalSession.submitted_at ? new Date(finalSession.submitted_at).getTime() : Date.now();
      const durationSeconds = Math.max(0, Math.round((submittedTime - startedTime) / 1000));

      return NextResponse.json({
        success: true,
        session: finalSession,
        results: {
          score,
          totalQuestions: totalQ,
          accuracy,
          durationSeconds,
          durationFormatted: `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`,
          reviewList
        }
      });
    }

    if (action === 'reset') {
      await DBService.resetQuizSessionForParticipant(adminTestParticipant.id);
      return NextResponse.json({ success: true, message: 'Admin test session reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });

  } catch (err: any) {
    console.error('[API ADMIN QUIZ TEST POST ERROR]', err);
    return NextResponse.json({ error: err.message || 'Request failed' }, { status: 500 });
  }
}
