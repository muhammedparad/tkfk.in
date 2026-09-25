import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminUser, signAdminSessionToken, setAdminSessionCookie } from '@/lib/adminAuth';
import { DBService } from '@/services/db';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, passcode } = body;
    const adminEmail = (email || '').trim().toLowerCase();
    const inputPassword = password || passcode || '';

    const ip = getClientIp(req.headers);
    const rateCheck = await checkRateLimitAsync(`admin_login_${ip}_${adminEmail}`, { limit: 5, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: `Too many admin login attempts. Please try again in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`
      }, { status: 429 });
    }

    if (!adminEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdminUser(adminEmail, inputPassword);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || 'Invalid admin email or password' },
        { status: 401 }
      );
    }

    const token = signAdminSessionToken(authResult.user.id, authResult.user.email, authResult.role || 'admin');
    const res = NextResponse.json({ 
      success: true, 
      message: 'Admin authentication successful',
      user: { email: authResult.user.email, role: authResult.role }
    });
    setAdminSessionCookie(res, token);

    // Audit Log entry with valid UUID and real actor
    await DBService.logAdminAction(
      authResult.user.id, 
      'ADMIN_LOGIN', 
      'SESSION', 
      'LOGIN_SUCCESS', 
      {
        email: authResult.user.email,
        timestamp: new Date().toISOString(),
        ip
      }
    );

    return res;
  } catch (err: any) {
    console.error('[API ADMIN LOGIN ERROR]', err);
    return NextResponse.json({ success: false, message: 'Request could not be completed.' }, { status: 500 });
  }
}
