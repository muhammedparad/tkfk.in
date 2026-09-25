import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { getSupabaseServerAdminClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return '""';
  let str = String(cell);
  // Prevent CSV Formula Injection (=, +, -, @, \t, \r)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
    const search = (searchParams.get('search') || '').trim();
    const statusFilter = searchParams.get('status') || 'ALL';
    const isExport = searchParams.get('export') === 'csv';

    const admin = getSupabaseServerAdminClient();

    let query = admin
      .from('participants')
      .select('*, registrations(payment_status, registration_status, amount, confirmed_at)', { count: 'exact' });

    if (search) {
      const normPhone = search.replace(/[^0-9]/g, '');
      if (normPhone && normPhone.length >= 3) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,participant_id.ilike.%${search}%`);
      } else {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,participant_id.ilike.%${search}%`);
      }
    }

    if (isExport) {
      const { data: exportData, error: expErr } = await query.order('created_at', { ascending: false });
      if (expErr) throw expErr;

      // Audit Log for export action
      await DBService.logAdminAction(
        adminSession.userId,
        'PARTICIPANT_EXPORT',
        'PARTICIPANTS',
        'EXPORT_CSV',
        { count: exportData?.length || 0, adminEmail: adminSession.email }
      );

      const csvHeaders = ['Participant ID', 'Name', 'Email', 'Phone', 'State', 'City', 'College', 'Referral Code', 'Payment Status', 'Confirmed At', 'Created At'];
      const csvRows = (exportData || []).map((p: any) => {
        const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
        return [
          escapeCsvCell(p.participant_id || 'PENDING'),
          escapeCsvCell(p.name),
          escapeCsvCell(p.email),
          escapeCsvCell(p.phone),
          escapeCsvCell(p.state),
          escapeCsvCell(p.city),
          escapeCsvCell(p.college),
          escapeCsvCell(p.referral_code),
          escapeCsvCell(reg?.payment_status || 'PENDING'),
          escapeCsvCell(reg?.confirmed_at || ''),
          escapeCsvCell(p.created_at)
        ].join(',');
      });

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="tkfk26_participants_${Date.now()}.csv"`
        }
      });
    }

    const offset = (page - 1) * limit;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      participants: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (err: any) {
    console.error('[API ADMIN PARTICIPANTS ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
