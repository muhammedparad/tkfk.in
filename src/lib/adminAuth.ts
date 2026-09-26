import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerAdminClient } from '@/lib/supabaseServer';

const ADMIN_COOKIE_NAME = 'tkfk26_admin_session';

function getAdminSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.PARTICIPANT_SESSION_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    return 'tkfk26_admin_hmac_secret_fallback_9981';
  }
  return secret;
}

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  nonce: string;
}

function computeHmacSignature(payloadBase64: string): string {
  const secret = getAdminSessionSecret();
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('hex');
}

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function fromBase64(b64: string): string {
  return Buffer.from(b64, 'base64url').toString('utf-8');
}

/**
 * Verify Admin Email & Password against Supabase Auth and admin_roles table
 */
export async function authenticateAdminUser(email: string, password: string): Promise<{ success: boolean; user?: any; role?: string; error?: string }> {
  try {
    const adminClient = getSupabaseServerAdminClient();
    
    // 1. Authenticate against Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Invalid admin credentials' };
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || email.trim().toLowerCase();

    // 2. Verify admin role strictly using authenticated Supabase user ID (Issue 20)
    const { data: roleRecord, error: roleError } = await adminClient
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError || !roleRecord) {
      return { success: false, error: 'Access denied: User does not possess administrator privileges.' };
    }

    return {
      success: true,
      user: { id: userId, email: userEmail },
      role: roleRecord.role
    };

  } catch (err: any) {
    return { success: false, error: err.message || 'Database error during admin authentication' };
  }
}

/**
 * Sign HMAC-SHA256 admin session token with 24-hour expiration
 */
export function signAdminSessionToken(userId: string, email: string, role = 'admin', expirationHours = 24): string {
  const payload: AdminSessionPayload = {
    userId,
    email,
    role,
    iat: Date.now(),
    exp: Date.now() + expirationHours * 60 * 60 * 1000,
    nonce: crypto.randomUUID()
  };

  const payloadBase64 = toBase64(JSON.stringify(payload));
  const signature = computeHmacSignature(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify session token using constant-time signature comparison and expiration check
 */
export function verifyAdminSessionToken(token: string | null | undefined): AdminSessionPayload | null {
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

    const payload: AdminSessionPayload = JSON.parse(fromBase64(payloadBase64));
    if (!payload.userId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get admin session payload from request cookies
 */
export function getAdminSessionFromRequest(req: NextRequest): AdminSessionPayload | null {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

/**
 * Set HTTP-only admin session cookie on response
 */
export function setAdminSessionCookie(res: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

/**
 * Clear HTTP-only admin session cookie on response (Logout)
 */
export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
