import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import { getPaymentConfig } from '@/lib/paymentConfig';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const config = getPaymentConfig();
    if (config.mode === 'DISABLED') {
      return NextResponse.json({ 
        success: false, 
        mode: 'DISABLED',
        error: 'Online payment is temporarily unavailable. Please try again later.',
        reason: config.reason 
      }, { status: 503 });
    }

    if (config.mode === 'MOCK') {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return NextResponse.json({
        success: true,
        mode: 'MOCK',
        order_id: mockOrderId,
        id: mockOrderId,
        amount: 9900,
        currency: 'INR',
        key_id: 'mock_key_id'
      });
    }

    const keyId = config.keyId!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!.trim().replace(/^["']|["']$/g, '');

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
