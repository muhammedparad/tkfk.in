import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment/paymentService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawPayload = await req.text();
    const signature = 
      req.headers.get('x-razorpay-signature') || 
      req.headers.get('x-webhook-signature') || 
      '';

    const headerEventId = 
      req.headers.get('x-razorpay-event-id') || 
      req.headers.get('x-event-id') || 
      '';

    if (!rawPayload) {
      return NextResponse.json({ success: false, message: 'Empty webhook payload body' }, { status: 400 });
    }

    const result = await PaymentService.handleWebhook(rawPayload, signature, headerEventId);

    if (!result.success) {
      const statusCode = result.paymentStatus === 'MANUAL_REVIEW' ? 200 : 400;
      return NextResponse.json({ 
        success: false, 
        message: result.message,
        paymentStatus: result.paymentStatus 
      }, { status: statusCode });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      paymentStatus: result.paymentStatus
    }, { status: 200 });

  } catch (err: any) {
    console.error('[API PAYMENTS WEBHOOK ERROR]', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Request could not be completed.' 
    }, { status: 500 });
  }
}
