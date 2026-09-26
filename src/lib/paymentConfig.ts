import 'server-only';

export type PaymentMode = 'PROVIDER' | 'MOCK' | 'DISABLED';

export interface PaymentConfigState {
  mode: PaymentMode;
  providerName: 'razorpay' | 'mock' | 'none';
  keyId?: string;
  isConfigured: boolean;
  reason?: string;
}

/**
  * Central Payment Configuration Resolver & Validation Engine
  * 
  * STRICT RULES:
  * 1. Never mix mock identifiers (mock_key_id, order_mock_) with real Razorpay Checkout.
  * 2. In production (NODE_ENV=production), MOCK mode is strictly rejected unless ALLOW_MOCK_PAYMENTS_IN_PROD=true.
  * 3. Missing or incomplete credentials fail-closed to DISABLED mode.
  * 4. Never invent fake credentials or fall back to mock mode silently.
  */
export function getPaymentConfig(): PaymentConfigState {
  const isProd = process.env.NODE_ENV === 'production';
  const allowMockInProd = process.env.ALLOW_MOCK_PAYMENTS_IN_PROD === 'true';

  const rawKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

  const keyId = rawKeyId.trim().replace(/^["']|["']$/g, '');
  const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, '');

  const explicitMode = process.env.PAYMENT_MODE?.toLowerCase();
  const explicitProvider = process.env.PAYMENT_PROVIDER?.toLowerCase();

  // Rule 1: Explicitly Disabled Mode
  if (explicitMode === 'disabled' || explicitProvider === 'disabled' || explicitProvider === 'none') {
    return {
      mode: 'DISABLED',
      providerName: 'none',
      isConfigured: false,
      reason: 'Payment service is explicitly disabled via PAYMENT_MODE configuration.'
    };
  }

  // Rule 2: Explicitly Requested Mock Mode
  if (explicitMode === 'mock' || explicitProvider === 'mock') {
    if (isProd && !allowMockInProd) {
      console.warn('[PAYMENT SECURITY WARN] Mock payment mode is strictly disabled in production environments.');
      return {
        mode: 'DISABLED',
        providerName: 'none',
        isConfigured: false,
        reason: 'Mock payment mode is disabled in production environments.'
      };
    }
    return {
      mode: 'MOCK',
      providerName: 'mock',
      keyId: 'mock_key_id',
      isConfigured: true,
      reason: 'Mock payment mode enabled for development/testing.'
    };
  }

  // Rule 3: Check Provider Credentials (Razorpay)
  const isPlaceholderKey = 
    !keyId || 
    keyId.includes('mock') || 
    keyId.includes('1234567890abcd') || 
    keyId.includes('placeholder') || 
    keyId.length < 8;

  const isPlaceholderSecret = 
    !keySecret || 
    keySecret.includes('mock') || 
    keySecret.includes('placeholder') || 
    keySecret.length < 8;

  if (isPlaceholderKey || isPlaceholderSecret) {
    // If not configured, check if dev mode allows mock payment
    if (!isProd && (process.env.DATA_MODE === 'mock' || explicitProvider === 'mock')) {
      return {
        mode: 'MOCK',
        providerName: 'mock',
        keyId: 'mock_key_id',
        isConfigured: true,
        reason: 'Mock payment fallback enabled in development.'
      };
    }

    return {
      mode: 'DISABLED',
      providerName: 'none',
      isConfigured: false,
      reason: 'Razorpay payment provider credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing or invalid.'
    };
  }

  // Rule 4: Valid Provider Configuration
  return {
    mode: 'PROVIDER',
    providerName: 'razorpay',
    keyId: keyId,
    isConfigured: true,
    reason: 'Razorpay live/test provider is fully configured.'
  };
}

/**
 * Get server-only Razorpay Key Secret securely (never sent to client)
 */
export function getRazorpayKeySecret(): string | null {
  const config = getPaymentConfig();
  if (config.mode !== 'PROVIDER') return null;

  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
  return rawKeySecret.trim().replace(/^["']|["']$/g, '') || null;
}
