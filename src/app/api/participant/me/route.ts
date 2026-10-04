import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { maskPhoneNumber } from '@/lib/utils';
import { 
  getParticipantSessionFromRequest, 
  signParticipantSessionToken, 
  setParticipantSessionCookie 
} from '@/lib/participantAuth';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    const sessionPayload = getParticipantSessionFromRequest(req);

    if (!sessionPayload && !adminSession) {
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

    let participant = null;
    let registration = null;

    if (sessionPayload) {
      participant = await DBService.getParticipantById(sessionPayload.participantId);
      if (participant) {
        registration = await DBService.getRegistrationByParticipantId(participant.id);
      }
    }

    // If admin is browsing without a student session, use sandbox admin test participant
    if (!participant && adminSession) {
      participant = await DBService.getOrCreateAdminTestParticipant();
      registration = await DBService.getRegistrationByParticipantId(participant.id);
    }

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

    const studyMaterial = await DBService.getStudyMaterialConfig();
    const isPaid = Boolean(adminSession) || ((participant.status === 'ACTIVE' || registration?.payment_status === 'SUCCESS' || registration?.registration_status === 'CONFIRMED') && Boolean(participant.participant_id));
    const participantPublicId = isPaid ? (participant.participant_id || (adminSession ? 'TKFK26-ADMIN99' : null)) : null;

    const res = NextResponse.json({
      success: true,
      isAdmin: Boolean(adminSession),
      isConfirmed: isPaid,
      participant: {
        id: participant.id,
        participant_id: participantPublicId,
        name: participant.name || (adminSession ? 'TKFK Admin Tester' : 'Participant'),
        email: participant.email,
        masked_phone: maskPhoneNumber(participant.phone || '9999999999'),
        college: participant.college || 'TKFK Control Center',
        state: participant.state || 'Kerala',
        city: participant.city || 'Thiruvananthapuram',
        status: participant.status || 'ACTIVE',
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
      } : (adminSession ? {
        id: 'reg-admin-pass',
        registration_status: 'CONFIRMED',
        payment_status: 'SUCCESS',
        amount: 99,
        currency: 'INR',
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      } : null),
      studyMaterial
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    // Refresh rolling 90-day persistent cookie with confirmed participant_id for participant or admin
    if (participant) {
      const refreshedToken = signParticipantSessionToken(
        participant.id,
        participantPublicId || ''
      );
      setParticipantSessionCookie(res, refreshedToken);
    }

    return res;

  } catch (err: any) {
    console.error('[API PARTICIPANT ME ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
