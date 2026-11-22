import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * Camera & Proctoring Decommissioned (Stage 3).
 * Route returns HTTP 410 Gone / retired status payload.
 */
export async function GET(req: NextRequest) {
  const adminSession = getAdminSessionFromRequest(req);
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  return NextResponse.json(
    {
      retired: true,
      message: 'Proctoring frame feeds and camera surveillance have been permanently decommissioned.',
      streams: [],
      metrics: {
        total: 0,
        activeLiveCount: 0,
        flaggedCount: 0,
        submittedCount: 0,
        terminatedCount: 0,
      },
    },
    { status: 410 }
  );
}

export async function POST(req: NextRequest) {
  const adminSession = getAdminSessionFromRequest(req);
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  return NextResponse.json(
    {
      retired: true,
      error: 'Proctoring frame actions have been decommissioned.',
    },
    { status: 410 }
  );
}
