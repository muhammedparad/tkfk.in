import { NextResponse } from 'next/server';
import { getPaymentConfig } from '@/lib/paymentConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = getPaymentConfig();
  
  return NextResponse.json({
    success: true,
    mode: config.mode,
    providerName: config.providerName,
    isConfigured: config.isConfigured,
    keyId: config.mode === 'PROVIDER' ? config.keyId : undefined,
    reason: config.reason
  });
}
