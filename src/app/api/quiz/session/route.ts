import { NextRequest, NextResponse } from 'next/server';
import { QuizEngineService } from '@/services/quizEngine';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { DBService } from '@/services/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    const sessionPayload = getParticipantSessionFromRequest(req);

    if (!sessionPayload && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Valid participant session or admin session cookie required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paramParticipantId = searchParams.get('participant_id') || searchParams.get('id');

    let targetParticipantUuid = sessionPayload?.participantId;

    if (adminSession) {
      if (paramParticipantId) {
        const p = await DBService.getParticipantById(paramParticipantId);
        if (p) targetParticipantUuid = p.id;
      }
      if (!targetParticipantUuid) {
        const adminTestParticipant = await DBService.getOrCreateAdminTestParticipant();
        targetParticipantUuid = adminTestParticipant.id;
      }
    } else {
      // IDOR Protection Check for normal participants
      if (paramParticipantId && sessionPayload) {
        const p = await DBService.getParticipantById(paramParticipantId);
        if (p && p.id !== sessionPayload.participantId && p.participant_id !== sessionPayload.publicId) {
          return NextResponse.json({ error: 'Forbidden: Access to another participant quiz session is denied' }, { status: 403 });
        }
      }
    }

    if (!targetParticipantUuid) {
      return NextResponse.json({ error: 'Target participant not found' }, { status: 404 });
    }

    const bypassDateGating = Boolean(adminSession);
    let data = await QuizEngineService.startSession(targetParticipantUuid, bypassDateGating);

    // If admin is testing and existing session was already terminal, reset it automatically for a fresh test attempt
    if (adminSession && (data.session?.status === 'SUBMITTED' || data.session?.status === 'EXPIRED')) {
      await DBService.resetQuizSessionForParticipant(targetParticipantUuid);
      data = await QuizEngineService.startSession(targetParticipantUuid, true);
    }

    return NextResponse.json({ success: true, isAdminTest: bypassDateGating, ...data });

  } catch (err: any) {
    console.error('[API QUIZ SESSION GET ERROR]', err);
    const isLocked = err.message?.includes('locked') || err.message?.includes('Competition');
    const clientMessage = isLocked ? err.message : 'Request could not be completed.';
    return NextResponse.json({ error: clientMessage }, { status: isLocked ? 403 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    const sessionPayload = getParticipantSessionFromRequest(req);

    if (!sessionPayload && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Valid session cookie required' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, questionId, selectedOption } = body;

    if (!sessionId || !questionId || !selectedOption) {
      return NextResponse.json({ error: 'sessionId, questionId, selectedOption are required' }, { status: 400 });
    }

    const participantId = sessionPayload?.participantId;
    const ok = await QuizEngineService.autoSaveAnswer(sessionId, questionId, selectedOption, participantId);
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
    const adminSession = getAdminSessionFromRequest(req);
    const sessionPayload = getParticipantSessionFromRequest(req);

    if (!sessionPayload && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Valid session cookie required' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      try {
        const raw = await req.text();
        body = JSON.parse(raw);
      } catch {}
    }

    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const quizSession = await DBService.getQuizSessionById(sessionId);
    if (!quizSession) {
      return NextResponse.json({ error: 'Quiz session not found' }, { status: 404 });
    }

    if (!adminSession && sessionPayload && quizSession.participant_id !== sessionPayload.participantId) {
      return NextResponse.json({ error: 'Forbidden: Cannot submit another participant quiz session' }, { status: 403 });
    }

    const session = await QuizEngineService.submitSession(sessionId);
    return NextResponse.json({ success: true, session });

  } catch (err: any) {
    console.error('[API QUIZ SESSION PUT ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
