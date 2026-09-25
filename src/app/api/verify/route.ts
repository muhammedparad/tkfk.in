import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || searchParams.get('id');

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Certificate code is required' }, { status: 400 });
    }

    const res = await DBService.verifyCertificate(code);
    
    if (!res || !res.valid || !res.certificate) {
      return NextResponse.json({ valid: false, message: 'Invalid or unrecognized certificate code' }, { status: 404 });
    }

    // Sanitize response: NEVER return email or phone number
    return NextResponse.json({
      valid: true,
      certificate_code: res.certificate.certificate_code,
      participant_name: res.certificate.participant_name || res.participant?.name,
      grade: res.certificate.grade,
      issued_at: res.certificate.issued_at
    });

  } catch (err: any) {
    console.error('[API VERIFY ERROR]', err);
    return NextResponse.json({ valid: false, error: 'Request could not be completed.' }, { status: 500 });
  }
}
