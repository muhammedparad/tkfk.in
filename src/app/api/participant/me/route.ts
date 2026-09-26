import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { maskPhoneNumber } from '@/lib/utils';
import { 
  getParticipantSessionFromRequest, 
  signParticipantSessionToken, 
  setParticipantSessionCookie 
} from '@/lib/participantAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    if (!sessionPayload) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid participant session cookie required' }, 
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    const targetParticipantId = sessionPayload.participantId;
    const participant = await DBService.getParticipantById(targetParticipantId);
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant record not found' }, 
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    const registration = await DBService.getRegistrationByParticipantId(participant.id);
    const studyMaterial = await DBService.getStudyMaterialConfig();

    const res = NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        participant_id: participant.participant_id,
        name: participant.name,
        email: participant.email,
        masked_phone: maskPhoneNumber(participant.phone),
        college: participant.college,
        state: participant.state,
        city: participant.city,
        status: participant.status,
        created_at: participant.created_at
      },
      registration: registration ? {
        id: registration.id,
        registration_status: registration.registration_status,
        payment_status: registration.payment_status,
        amount: registration.amount,
        currency: registration.currency,
        confirmed_at: registration.confirmed_at,
        created_at: registration.created_at
      } : null,
      studyMaterial
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    // Refresh rolling 90-day persistent cookie with confirmed participant_id
    const refreshedToken = signParticipantSessionToken(
      participant.id,
      participant.participant_id || ''
    );
    setParticipantSessionCookie(res, refreshedToken);

    return res;

  } catch (err: any) {
    console.error('[API PARTICIPANT ME ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
