import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { DBService } from '@/services/db';

import { getRazorpayKeySecret } from '@/lib/paymentConfig';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const keySecret = getRazorpayKeySecret();
    if (!keySecret) {
      return NextResponse.json({ error: 'Payment verification unavailable: Server secret not configured' }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required Razorpay payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)' }, { status: 400 });
    }

    // Signature verification algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // If registrationId is provided, activate registration in DB
    if (registrationId) {
      try {
        await DBService.activateConfirmedRegistration(registrationId, razorpay_payment_id);
      } catch (dbErr) {
        console.warn('[VERIFY PAYMENT DB WARN]', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment signature verified successfully',
      razorpay_order_id,
      razorpay_payment_id
    });
  } catch (err: any) {
    console.error('[API VERIFY PAYMENT ERROR]', err);
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
