import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { maskPhoneNumber } from '@/lib/utils';
import { 
  getParticipantSessionFromRequest, 
  signParticipantSessionToken, 
  setParticipantSessionCookie,
  clearParticipantSessionCookie
} from '@/lib/participantAuth';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { isParticipantSpecialAllowed, isQuizWindowOpen } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    const adminSession = getAdminSessionFromRequest(req);
    const isAdminExplicitTest = Boolean(
      adminSession && 
      (req.nextUrl.searchParams.get('admin') === 'true' || req.nextUrl.searchParams.get('preview') === 'true')
    );

    // If neither a valid participant session nor an explicit admin test request exists, return 401
    if (!sessionPayload && !isAdminExplicitTest) {
      const res = NextResponse.json(
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
      clearParticipantSessionCookie(res);
      return res;
    }

    let participant = null;
    let registration = null;

    if (sessionPayload) {
      participant = await DBService.getParticipantById(sessionPayload.participantId);
      if (participant) {
        registration = await DBService.getRegistrationByParticipantId(participant.id);
      }
    } else if (isAdminExplicitTest) {
      // Sandbox admin test participant ONLY when explicitly requested with ?admin=true
      participant = await DBService.getOrCreateAdminTestParticipant();
      registration = await DBService.getRegistrationByParticipantId(participant.id);
    }

    if (!participant) {
      const res = NextResponse.json(
        { error: 'Participant record not found' }, 
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      clearParticipantSessionCookie(res);
      return res;
    }

    const studyMaterial = await DBService.getStudyMaterialConfig();
    const isPaid = Boolean(isAdminExplicitTest) || ((participant.status === 'ACTIVE' || registration?.payment_status === 'SUCCESS' || registration?.registration_status === 'CONFIRMED') && Boolean(participant.participant_id));
    const participantPublicId = isPaid ? (participant.participant_id || (isAdminExplicitTest ? 'TKFK26-ADMIN99' : null)) : null;

    const isSpecialAllowed = isParticipantSpecialAllowed(participant.participant_id) || isParticipantSpecialAllowed(participant.id);
    const canAccessQuiz = Boolean(isAdminExplicitTest) || isSpecialAllowed || isQuizWindowOpen();

    const res = NextResponse.json({
      success: true,
      isAdmin: Boolean(isAdminExplicitTest),
      isConfirmed: isPaid,
      isSpecialAllowed,
      canAccessQuiz,
      participant: {
        id: participant.id,
        participant_id: participantPublicId,
        name: participant.name || (isAdminExplicitTest ? 'TKFK Admin Tester' : 'Participant'),
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
      } : (isAdminExplicitTest ? {
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

    // Refresh rolling 90-day persistent cookie ONLY for genuine participants with an active sessionPayload
    if (participant && sessionPayload) {
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
