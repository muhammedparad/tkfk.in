import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const participantSession = getParticipantSessionFromRequest(req);
    if (!participantSession) {
      return NextResponse.json({ error: 'Unauthorized: Participant authentication required' }, { status: 401 });
    }

    // Derive registration directly from HttpOnly participant session
    const registration = await DBService.getRegistrationByParticipantId(participantSession.participantId);
    if (!registration) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    // Return sanitized status payload for authenticated participant
    return NextResponse.json({
      success: true,
      registration_id: registration.id,
      payment_status: registration.payment_status,
      registration_status: registration.registration_status,
      amount: registration.amount,
      currency: registration.currency,
      confirmed_at: registration.confirmed_at
    });

  } catch (err: any) {
    console.error('[API PAYMENT STATUS ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
