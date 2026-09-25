import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSessionCookie, getAdminSessionFromRequest } from '@/lib/adminAuth';
import { DBService } from '@/services/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    const adminIdentity = session?.userId || session?.email || 'UNKNOWN_ADMIN';

    const res = NextResponse.json({ success: true, message: 'Admin logged out successfully' });
    clearAdminSessionCookie(res);

    await DBService.logAdminAction(adminIdentity, 'ADMIN_LOGOUT', 'SESSION', session?.userId || 'LOGOUT_SUCCESS', {
      timestamp: new Date().toISOString()
    });

    return res;
  } catch (err: any) {
    console.error('[API ADMIN LOGOUT ERROR]', err);
    return NextResponse.json({ success: false, message: 'Request could not be completed.' }, { status: 500 });
  }
}
