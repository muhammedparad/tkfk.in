import { NextResponse } from 'next/server';
import { clearParticipantSessionCookie } from '@/lib/participantAuth';
import { clearAdminSessionCookie } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function createLogoutResponse() {
  const res = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    }
  );

  // Clear all participant session cookies
  clearParticipantSessionCookie(res);

  // Also clear admin session cookie to prevent cross-session revival
  clearAdminSessionCookie(res);

  return res;
}

export async function POST() {
  return createLogoutResponse();
}

export async function GET() {
  return createLogoutResponse();
}
