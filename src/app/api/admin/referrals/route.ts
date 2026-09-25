import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { getSupabaseServerAdminClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const admin = getSupabaseServerAdminClient();

    // Fetch all referral codes
    const { data: refCodes, error: refErr } = await admin
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (refErr) throw refErr;

    // Fetch participants with referral codes
    let pQuery = admin
      .from('participants')
      .select('referral_code, created_at, registrations(payment_status)')
      .not('referral_code', 'is', null);

    if (startDate) {
      pQuery = pQuery.gte('created_at', startDate);
    }
    if (endDate) {
      pQuery = pQuery.lte('created_at', endDate);
    }

    const { data: participants, error: pErr } = await pQuery;
    if (pErr) throw pErr;

    // Aggregate counts by referral_code
    const analyticsMap = new Map<string, { total: number; confirmed: number; pending: number }>();

    (participants || []).forEach((p: any) => {
      const code = p.referral_code?.toUpperCase();
      if (!code) return;

      const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
      const isConfirmed = reg?.payment_status === 'SUCCESS';

      const current = analyticsMap.get(code) || { total: 0, confirmed: 0, pending: 0 };
      current.total++;
      if (isConfirmed) current.confirmed++;
      else current.pending++;
      analyticsMap.set(code, current);
    });

    const referralList = (refCodes || []).map((rc: any) => {
      const stats = analyticsMap.get(rc.code.toUpperCase()) || { total: 0, confirmed: 0, pending: 0 };
      const conversionRate = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;

      return {
        id: rc.id,
        code: rc.code,
        active: rc.active,
        usage_count: rc.usage_count || stats.confirmed,
        total_clicks_registrations: stats.total,
        confirmed_count: stats.confirmed,
        pending_count: stats.pending,
        conversion_rate: conversionRate,
        created_at: rc.created_at
      };
    });

    return NextResponse.json({
      success: true,
      referrals: referralList
    });

  } catch (err: any) {
    console.error('[API ADMIN REFERRALS ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
