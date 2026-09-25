import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const config = await DBService.getResultsReleaseConfig();
    const leaderboard = await DBService.getLeaderboard();

    return NextResponse.json({
      success: true,
      config,
      leaderboard
    });
  } catch (err: any) {
    console.error('[API ADMIN RESULTS GET ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { published, note } = body;

    await DBService.setResultsReleaseConfig(Boolean(published), note || '');
    
    await DBService.logAdminAction(
      adminSession.userId,
      published ? 'PUBLISH_RESULTS' : 'UNPUBLISH_RESULTS',
      'SYSTEM_CONFIG',
      'results_release',
      { note, adminEmail: adminSession.email }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API ADMIN RESULTS POST ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
