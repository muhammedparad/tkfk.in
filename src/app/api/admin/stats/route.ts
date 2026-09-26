import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!getAdminSessionFromRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
    const stats = await DBService.getAdminStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err: any) {
    console.error('[API ADMIN STATS GET ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
