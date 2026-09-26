import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_Tg77nfA5TIWkIB';
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || 'HnitZr1Kk64pNaBGMNHxXJAd';

    const keyId = rawKeyId.trim().replace(/^["']|["']$/g, '');
    const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, '');

    const body = await req.json().catch(() => ({}));
    let { amount = 9900, currency = 'INR', receipt = `receipt_${Date.now()}` } = body;

    amount = Number(amount);
    if (isNaN(amount) || amount < 100) {
      return NextResponse.json({ error: 'Minimum amount must be at least 100 paise' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      receipt: String(receipt)
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId
    });
  } catch (err: any) {
    console.error('[API CREATE ORDER ERROR]', err);
    return NextResponse.json({ error: err.message || 'Razorpay order creation failed' }, { status: 500 });
  }
}
