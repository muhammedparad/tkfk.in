import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { PaymentService } from '@/services/payment/paymentService';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    const isAdmin = getAdminSessionFromRequest(req);

    if (!sessionPayload && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Valid participant session cookie required to create payment order' }, { status: 401 });
    }

    const body = await req.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'registrationId is required' }, { status: 400 });
    }

    const registration = await DBService.getRegistrationById(registrationId);
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (sessionPayload && !isAdmin && registration.participant_id !== sessionPayload.participantId) {
      return NextResponse.json({ error: 'Forbidden: Cannot create payment order for another participant' }, { status: 403 });
    }

    const participant = await DBService.getParticipantById(registration.participant_id);

    const orderResult = await PaymentService.createOrder({
      registrationId: registration.id,
      amount: registration.amount || 99,
      currency: registration.currency || 'INR',
      participantEmail: participant?.email,
      participantPhone: participant?.phone,
      participantName: participant?.name
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
      order_id: orderResult.orderId,
      id: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency || 'INR',
      key_id: orderResult.keyId
    });

  } catch (err: any) {
    console.error('[API PAYMENT CREATE ORDER ERROR]', err);
    return NextResponse.json({ error: err.message || 'Request could not be completed.' }, { status: 500 });
  }
}
