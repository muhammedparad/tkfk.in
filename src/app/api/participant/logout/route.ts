import { NextResponse } from 'next/server';
import { clearParticipantSessionCookie } from '@/lib/participantAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearParticipantSessionCookie(res);
  return res;
}
