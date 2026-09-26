import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { DBService } from '@/services/db';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionPayload = getParticipantSessionFromRequest(req);
    const isAdmin = getAdminSessionFromRequest(req);

    const body = await req.json();
    const { registrationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!registrationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required Razorpay payment verification parameters' }, { status: 400 });
    }

    const registration = await DBService.getRegistrationById(registrationId);
    if (!registration) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    if (sessionPayload && !isAdmin && registration.participant_id !== sessionPayload.participantId) {
      return NextResponse.json({ error: 'Forbidden: Cannot verify payment for another participant' }, { status: 403 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[API PAYMENT VERIFY ERROR] Razorpay secret key is not configured on server');
      return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
    }

    // Verify HMAC-SHA256 signature (razorpay_order_id + "|" + razorpay_payment_id)
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await DBService.updatePaymentStatus(registration.id, 'MANUAL_REVIEW', razorpay_payment_id);
      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // Activate registration and participant status
    const updatedReg = await DBService.activateConfirmedRegistration(registration.id, razorpay_payment_id);

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment signature verified successfully. Participant activated.',
      registration: updatedReg
    });

  } catch (err: any) {
    console.error('[API PAYMENT VERIFY ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
