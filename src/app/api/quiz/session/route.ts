import { NextRequest, NextResponse } from 'next/server';
import { QuizEngineService } from '@/services/quizEngine';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { DBService } from '@/services/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    if (!sessionPayload) {
      return NextResponse.json({ error: 'Unauthorized: Valid participant session cookie required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paramParticipantId = searchParams.get('participant_id') || searchParams.get('id');

    // IDOR Protection Check: If paramParticipantId is sent, verify it matches session owner
    if (paramParticipantId) {
      const p = await DBService.getParticipantById(paramParticipantId);
      if (p && p.id !== sessionPayload.participantId && p.participant_id !== sessionPayload.publicId) {
        return NextResponse.json({ error: 'Forbidden: Access to another participant quiz session is denied' }, { status: 403 });
      }
    }

    const targetParticipantUuid = sessionPayload.participantId;
    const data = await QuizEngineService.startSession(targetParticipantUuid);
    return NextResponse.json({ success: true, ...data });

  } catch (err: any) {
    console.error('[API QUIZ SESSION GET ERROR]', err);
    const clientMessage = err.message?.includes('locked') || err.message?.includes('Competition') 
      ? err.message 
      : 'Request could not be completed.';
    return NextResponse.json({ error: clientMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    if (!sessionPayload) {
      return NextResponse.json({ error: 'Unauthorized: Valid participant session cookie required' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, questionId, selectedOption } = body;

    if (!sessionId || !questionId || !selectedOption) {
      return NextResponse.json({ error: 'sessionId, questionId, selectedOption are required' }, { status: 400 });
    }

    // Verify session ownership and save answer against frozen assigned question set (Issue 11)
    const ok = await QuizEngineService.autoSaveAnswer(sessionId, questionId, selectedOption, sessionPayload.participantId);
    if (!ok) {
      return NextResponse.json({ error: 'Cannot save answer: Session is expired or already submitted' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[API QUIZ SESSION POST ERROR]', err);
    const isValidationErr = err.message?.toLowerCase().includes('unauthorized') || 
                           err.message?.toLowerCase().includes('not assigned') || 
                           err.message?.toLowerCase().includes('expired') ||
                           err.message?.toLowerCase().includes('finalized');
    return NextResponse.json({ 
      error: isValidationErr ? err.message : 'Request could not be completed.' 
    }, { status: isValidationErr ? 400 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    if (!sessionPayload) {
      return NextResponse.json({ error: 'Unauthorized: Valid participant session cookie required' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const quizSession = await DBService.getQuizSessionById(sessionId);
    if (!quizSession || quizSession.participant_id !== sessionPayload.participantId) {
      return NextResponse.json({ error: 'Forbidden: Cannot submit another participant quiz session' }, { status: 403 });
    }

    const session = await QuizEngineService.submitSession(sessionId);
    return NextResponse.json({ success: true, session });

  } catch (err: any) {
    console.error('[API QUIZ SESSION PUT ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
