import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';
import { signParticipantSessionToken, setParticipantSessionCookie } from '@/lib/participantAuth';
import { EVENT_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantId, participant_id, phone, identifier } = body;
    const inputId = (participantId || participant_id || '').trim();
    const inputPhone = (phone || identifier || '').trim();

    const ip = getClientIp(req.headers);
    const rateCheck = await checkRateLimitAsync(`quiz_login_${ip}_${inputId}`, { limit: 10, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: `Too many login attempts. Please try again in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`
      }, { status: 429 });
    }

    if (!inputId || !inputPhone) {
      return NextResponse.json({
        success: false,
        message: 'Participant ID and registered mobile phone number are required.'
      }, { status: 400 });
    }

    const participant = await DBService.authenticateParticipant(inputId, inputPhone);

    if (!participant) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials. Participant ID and registered mobile phone do not match.'
      }, { status: 401 });
    }

    if (participant.status === 'BLOCKED') {
      return NextResponse.json({
        success: false,
        message: `Your account has been suspended. Please contact ${EVENT_CONFIG.supportEmail}.`
      }, { status: 403 });
    }

    const registration = await DBService.getRegistrationByParticipantId(participant.id);

    if (!registration || registration.payment_status !== 'SUCCESS') {
      return NextResponse.json({
        success: false,
        message: 'Registration payment is pending. Access requires a confirmed registration.'
      }, { status: 403 });
    }

    // Sign participant session token (minimal claims, no PII) and issue HTTP-only cookie
    const token = signParticipantSessionToken(
      participant.id,
      participant.participant_id || ''
    );

    const res = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      participant: {
        id: participant.id,
        participant_id: participant.participant_id,
        name: participant.name,
        email: participant.email
      }
    });

    setParticipantSessionCookie(res, token);
    return res;

  } catch (err: any) {
    console.error('[API QUIZ LOGIN ERROR]', err);
    return NextResponse.json({
      success: false,
      message: 'Request could not be completed.'
    }, { status: 500 });
  }
}
