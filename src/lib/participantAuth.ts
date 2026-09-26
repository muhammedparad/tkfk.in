import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PARTICIPANT_COOKIE_NAME = 'tkfk26_participant_session';

function getParticipantSecret(): string {
  const secret =
    process.env.PARTICIPANT_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    return 'tkfk26_participant_session_secret_key_fallback_9281';
  }
  return secret;
}

export interface ParticipantSessionPayload {
  participantId: string; // Internal UUID or public ID
  publicId: string;      // TKFK26-XXXXXX
  iat: number;
  exp: number;
  nonce: string;
}

function computeHmacSignature(payloadBase64: string): string {
  const secret = getParticipantSecret();
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('hex');
}

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function fromBase64(b64: string): string {
  return Buffer.from(b64, 'base64url').toString('utf-8');
}

/**
 * Sign participant session token with 7-day expiration (minimal identity claims, no PII)
 */
export function signParticipantSessionToken(
  participantId: string,
  publicId: string,
  expirationDays = 7
): string {
  const payload: ParticipantSessionPayload = {
    participantId,
    publicId,
    iat: Date.now(),
    exp: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
    nonce: crypto.randomUUID()
  };

  const payloadBase64 = toBase64(JSON.stringify(payload));
  const signature = computeHmacSignature(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify participant session token using constant-time signature comparison
 */
export function verifyParticipantSessionToken(token: string | null | undefined): ParticipantSessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;

  try {
    const expectedSignature = computeHmacSignature(payloadBase64);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
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
 * Get participant session payload strictly from HTTP-only cookie
 */
export function getParticipantSessionFromRequest(req: NextRequest): ParticipantSessionPayload | null {
  const cookieToken = req.cookies.get(PARTICIPANT_COOKIE_NAME)?.value || req.cookies.get('gkc26_participant_session')?.value;
  if (cookieToken) {
    return verifyParticipantSessionToken(cookieToken);
  }

  return null;
}

/**
 * Set HTTP-only participant session cookie on response
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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear HTTP-only participant session cookie on response (Logout)
 */
export function clearParticipantSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: PARTICIPANT_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

