import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    const ip = getClientIp(req.headers);
    const rateCheck = await checkRateLimitAsync(`contact_${ip}_${email || ''}`, { limit: 5, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: `Too many contact submissions. Please try again in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`
      }, { status: 429 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'Name, email, and message are required.' }, { status: 400 });
    }

    await DBService.recordContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received. Our help desk will respond shortly.'
    });

  } catch (err: any) {
    console.error('[API CONTACT ERROR]', err);
    return NextResponse.json({ success: false, message: 'Request could not be completed.' }, { status: 500 });
  }
}
