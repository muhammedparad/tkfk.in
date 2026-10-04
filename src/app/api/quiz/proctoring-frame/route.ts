import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    const sessionPayload = getParticipantSessionFromRequest(req);

    if (!sessionPayload && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      sessionId,
      participantId,
      imageData,
      currentIndex,
      answeredCount,
      timeLeftSeconds,
      warningsCount,
      warningMessage,
      isFullscreen,
      isTerminated,
      terminationReason
    } = body;

    const targetParticipantId = participantId || sessionPayload?.participantId || 'admin-tester';
    const targetSessionId = sessionId || `sess-${targetParticipantId}`;

    // Security check: participant can only report their own frames
    if (!adminSession && sessionPayload && targetParticipantId !== sessionPayload.participantId) {
      return NextResponse.json({ error: 'Forbidden: Cannot report frames for another participant' }, { status: 403 });
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = getClientIp(req.headers);

    const result = await DBService.recordProctoringFrame({
      participantId: targetParticipantId,
      sessionId: targetSessionId,
      imageData: imageData || null,
      currentIndex: typeof currentIndex === 'number' ? currentIndex : 0,
      answeredCount: typeof answeredCount === 'number' ? answeredCount : 0,
      timeLeftSeconds: typeof timeLeftSeconds === 'number' ? timeLeftSeconds : 1500,
      warningsCount: typeof warningsCount === 'number' ? warningsCount : 0,
      warningMessage: warningMessage || null,
      isFullscreen: isFullscreen !== undefined ? isFullscreen : true,
      isTerminated: Boolean(isTerminated),
      terminationReason: terminationReason || null,
      userAgent,
      ipAddress
    });

    return NextResponse.json({
      success: true,
      adminWarning: result.adminWarning || null,
      forceTerminated: result.forceTerminated || false,
      terminationReason: result.terminationReason || null
    });

  } catch (err: any) {
    console.error('[API PROCTORING FRAME ERROR]', err);
    return NextResponse.json({ error: 'Proctoring frame could not be recorded.' }, { status: 500 });
  }
}
