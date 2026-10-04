import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { ProctoringActionRequest } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const streams = await DBService.getProctoringStreams();

    const activeLiveCount = streams.filter(s => s.is_live).length;
    const flaggedCount = streams.filter(s => s.warnings_count > 0 || !s.is_fullscreen).length;
    const submittedCount = streams.filter(s => s.session_status === 'SUBMITTED').length;
    const terminatedCount = streams.filter(s => s.is_terminated || s.session_status === 'EXPIRED').length;

    return NextResponse.json({
      success: true,
      streams,
      metrics: {
        total: streams.length,
        activeLiveCount,
        flaggedCount,
        submittedCount,
        terminatedCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('[API ADMIN PROCTORING GET ERROR]', err);
    return NextResponse.json({ error: 'Failed to retrieve live proctoring feeds.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body: ProctoringActionRequest = await req.json();
    const { action, participantId, sessionId, message, reason } = body;

    if (!action || !participantId) {
      return NextResponse.json({ error: 'action and participantId are required' }, { status: 400 });
    }

    const result = await DBService.executeProctoringAction({
      action,
      participantId,
      sessionId,
      message,
      reason
    }, adminSession.email || adminSession.userId || 'ADMIN');

    return NextResponse.json(result);

  } catch (err: any) {
    console.error('[API ADMIN PROCTORING POST ERROR]', err);
    return NextResponse.json({ error: 'Failed to execute proctoring action.' }, { status: 500 });
  }
}
