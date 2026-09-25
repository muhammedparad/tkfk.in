import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authenticated = getAdminSessionFromRequest(req);
  return NextResponse.json({ authenticated });
}
