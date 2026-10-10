import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Event and all certificate distributions are officially concluded
  return NextResponse.json({
    success: false,
    closed: true,
    message: 'Certificate distribution for past events has officially concluded. The certificate download portal is now closed.'
  }, { status: 200 });
}
