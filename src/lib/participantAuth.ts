import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PARTICIPANT_COOKIE_NAME = 'tkfk26_participant_session';

function getAllParticipantSecrets(): string[] {
  const secrets = [
    process.env.PARTICIPANT_SESSION_SECRET,
    process.env.ADMIN_SESSION_SECRET,
    process.env.ADMIN_SECRET_KEY,
    process.env.RAZORPAY_KEY_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    'gkc26_participant_session_secret_key_9281',
    'tkfk26_participant_session_secret_key_fallback_9281'
  ].filter((s): s is string => Boolean(s && s.length > 0));

  return Array.from(new Set(secrets));
}

function getPrimaryParticipantSecret(): string {
  const all = getAllParticipantSecrets();
  return all[0] || 'tkfk26_participant_session_secret_key_fallback_9281';
}

export interface ParticipantSessionPayload {
  participantId: string; // Internal UUID or public ID
  publicId: string;      // TKFK26-XXXXXX
  iat: number;
  exp: number;
  nonce: string;
}

function computeHmacSignatureWithSecret(payloadBase64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('hex');
}

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function fromBase64(b64: string): string {
  return Buffer.from(b64, 'base64url').toString('utf-8');
}

/**
 * Sign participant session token with 90-day persistent expiration
 */
export function signParticipantSessionToken(
  participantId: string,
  publicId: string,
  expirationDays = 90
): string {
  const payload: ParticipantSessionPayload = {
    participantId,
    publicId,
    iat: Date.now(),
    exp: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
    nonce: crypto.randomUUID()
  };

  const payloadBase64 = toBase64(JSON.stringify(payload));
  const primarySecret = getPrimaryParticipantSecret();
  const signature = computeHmacSignatureWithSecret(payloadBase64, primarySecret);

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify participant session token using constant-time signature comparison across all valid server secrets
 */
export function verifyParticipantSessionToken(token: string | null | undefined): ParticipantSessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;

  try {
    const secrets = getAllParticipantSecrets();
    let signatureMatched = false;
    const sigBuf = Buffer.from(signature);

    for (const sec of secrets) {
      const expectedSig = computeHmacSignatureWithSecret(payloadBase64, sec);
      const expBuf = Buffer.from(expectedSig);
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        signatureMatched = true;
        break;
      }
    }

    if (!signatureMatched) {
      return null;
    }

    const payload: ParticipantSessionPayload = JSON.parse(fromBase64(payloadBase64));
    if (!payload.participantId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get participant session payload strictly from HTTP-only cookie (checks current and legacy cookie keys)
 */
export function getParticipantSessionFromRequest(req: NextRequest): ParticipantSessionPayload | null {
  const cookieToken = 
    req.cookies.get(PARTICIPANT_COOKIE_NAME)?.value || 
    req.cookies.get('gkc26_participant_session')?.value ||
    req.cookies.get('tkfk_participant_session')?.value;

  if (cookieToken) {
    return verifyParticipantSessionToken(cookieToken);
  }

  return null;
}

/**
 * Set HTTP-only persistent participant session cookie on response (90 days)
 */
export function setParticipantSessionCookie(res: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: PARTICIPANT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 90 * 24 * 60 * 60, // 90 days persistent login
  });
}

/**
 * Clear HTTP-only participant session cookie on response (Logout)
 */
export function clearParticipantSessionCookie(res: NextResponse): void {
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookies.set({
    name: PARTICIPANT_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Clear legacy cookie names if present
  res.cookies.set({
    name: 'gkc26_participant_session',
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  res.cookies.set({
    name: 'tkfk_participant_session',
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
