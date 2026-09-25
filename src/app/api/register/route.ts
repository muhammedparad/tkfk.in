import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';
import { signParticipantSessionToken, setParticipantSessionCookie } from '@/lib/participantAuth';
import { normalizePhoneNumber } from '@/lib/utils';
import { isRegistrationWindowOpen } from '@/lib/config';

export const dynamic = 'force-dynamic';

const INDIAN_STATES = new Set([
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Other"
]);

function sanitizeInput(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    // Authoritative Registration Window Check (Issue 16 & 17)
    if (!isRegistrationWindowOpen()) {
      return NextResponse.json({
        success: false,
        message: 'Registration window is currently closed.'
      }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, state, city, college, referral_code, consent } = body;

    // Strict Input Validation
    const cleanName = sanitizeInput(name || '');
    const cleanEmail = sanitizeInput(email || '').toLowerCase();
    const cleanPhone = normalizePhoneNumber(phone || '');
    const cleanState = sanitizeInput(state || '');
    const cleanCity = sanitizeInput(city || '');
    const cleanCollege = sanitizeInput(college || '');
    const cleanRef = sanitizeInput(referral_code || '');

    const ip = getClientIp(req.headers);
    const rateCheck = await checkRateLimitAsync(`register_${ip}_${cleanEmail}`, { limit: 10, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: `Too many registration attempts. Please try again in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`
      }, { status: 429 });
    }

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ success: false, message: 'Please enter a valid full name.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    if (!cleanState || !INDIAN_STATES.has(cleanState)) {
      return NextResponse.json({ success: false, message: 'Please select a valid Indian State or Union Territory.' }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ success: false, message: 'You must accept the terms, privacy policy, and age consent to register.' }, { status: 400 });
    }

    const result = await DBService.createRegistration({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      state: cleanState,
      city: cleanCity,
      college: cleanCollege,
      referral_code: cleanRef
    });

    if (result.status === 'ALREADY_REGISTERED') {
      return NextResponse.json({
        success: false,
        status: 'ALREADY_REGISTERED',
        message: 'This mobile number or email is already registered with a confirmed account. Please log in to your dashboard.'
      }, { status: 409 });
    }

    // Sign participant session token (no PII in payload) and issue HTTP-only cookie
    const token = signParticipantSessionToken(
      result.participant.id,
      result.participant.participant_id || ''
    );

    const res = NextResponse.json({
      success: true,
      status: result.status,
      message: result.status === 'PENDING' ? 'Resuming existing pending registration.' : 'Registration initiated successfully.',
      registration_id: result.registration.id,
      participant: result.participant,
      registration: result.registration
    });

    setParticipantSessionCookie(res, token);
    return res;

  } catch (err: any) {
    console.error('[API REGISTER ERROR]', err);
    return NextResponse.json(
      { success: false, message: 'Request could not be completed.' },
      { status: 500 }
    );
  }
}
