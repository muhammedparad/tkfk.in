import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { isResultsWindowReleased } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    if (!sessionPayload) {
      return NextResponse.json({ error: 'Unauthorized: Valid participant session cookie required' }, { status: 401 });
    }

    const targetId = sessionPayload.participantId;
    const participant = await DBService.getParticipantById(targetId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const releaseConfig = await DBService.getResultsReleaseConfig();
    const isReleased = isResultsWindowReleased() || releaseConfig.published;
    
    // Fetch existing quiz session WITHOUT creating a new one
    const session = await DBService.getQuizSessionByParticipantId(participant.id);

    let certificate = null;
    if (isReleased && session && (session.status === 'SUBMITTED' || session.status === 'EXPIRED')) {
      certificate = await DBService.getOrGenerateCertificate(participant, session);
    }

    const safeSession = session ? {
      id: session.id,
      participant_id: session.participant_id,
      started_at: session.started_at,
      submitted_at: session.submitted_at,
      status: session.status,
      score: isReleased ? session.score : null,
      total_questions: session.total_questions
    } : null;

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        participant_id: participant.participant_id,
        name: participant.name
      },
      session: safeSession,
      releaseConfig: {
        ...releaseConfig,
        published: isReleased
      },
      certificate
    });

  } catch (err: any) {
    console.error('[API RESULTS ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
