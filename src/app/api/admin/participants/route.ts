import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { getSupabaseServerAdminClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      .select('*, registrations(id, payment_status, registration_status, amount, confirmed_at)', { count: 'exact' });

    if (search) {
      const normPhone = search.replace(/[^0-9]/g, '');
      if (normPhone && normPhone.length >= 3) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,participant_id.ilike.%${search}%,referral_code.ilike.%${search}%`);
      } else {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,participant_id.ilike.%${search}%,referral_code.ilike.%${search}%`);
      }
    }

    if (statusFilter === 'BLOCKED') {
      query = query.eq('status', 'BLOCKED');
    }

    if (isExport) {
      const { data: exportData, error: expErr } = await query.order('created_at', { ascending: false });
      if (expErr) throw expErr;

      // Filter in memory for registration status if requested
      let filteredExport = exportData || [];
      if (statusFilter === 'CONFIRMED') {
        filteredExport = filteredExport.filter((p: any) => {
          const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
          return reg?.payment_status === 'SUCCESS' || p.participant_id;
        });
      } else if (statusFilter === 'PENDING') {
        filteredExport = filteredExport.filter((p: any) => {
          const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
          return reg?.payment_status !== 'SUCCESS' && !p.participant_id;
        });
      }

      // Audit Log for export action
      await DBService.logAdminAction(
        adminSession.userId,
        'PARTICIPANT_EXPORT',
        'PARTICIPANTS',
        'EXPORT_CSV',
        { count: filteredExport.length, adminEmail: adminSession.email, statusFilter }
      );

      const csvHeaders = ['Participant ID', 'Name', 'Email', 'Phone', 'State', 'City', 'College', 'Status', 'Payment Status', 'Confirmed At', 'Created At'];
      const csvRows = filteredExport.map((p: any) => {
        const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
        return [
          escapeCsvCell(p.participant_id || 'PENDING'),
          escapeCsvCell(p.name),
          escapeCsvCell(p.email),
          escapeCsvCell(p.phone),
          escapeCsvCell(p.state),
          escapeCsvCell(p.city),
          escapeCsvCell(p.college),
          escapeCsvCell(p.status || 'ACTIVE'),
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

    let participantsList = data || [];
    if (statusFilter === 'CONFIRMED') {
      participantsList = participantsList.filter((p: any) => {
        const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
        return reg?.payment_status === 'SUCCESS' || p.participant_id;
      });
    } else if (statusFilter === 'PENDING') {
      participantsList = participantsList.filter((p: any) => {
        const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
        return reg?.payment_status !== 'SUCCESS' && !p.participant_id;
      });
    }

    return NextResponse.json({
      success: true,
      participants: participantsList,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (err: any) {
    console.error('[API ADMIN PARTICIPANTS GET ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Super admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { participantId, updates, action, paymentReference } = body;

    if (!participantId) {
      return NextResponse.json({ error: 'participantId is required' }, { status: 400 });
    }

    if (action === 'ACTIVATE') {
      const res = await DBService.manuallyActivateParticipant(
        participantId, 
        paymentReference || `ADMIN_MANUAL_ACTIVATE_${Date.now()}`,
        adminSession.userId
      );
      return NextResponse.json({
        success: true,
        message: `Participant activated successfully with ID: ${res.participant.participant_id}`,
        participant: res.participant,
        registration: res.registration
      });
    }

    if (action === 'BLOCK') {
      const updated = await DBService.updateParticipant(participantId, { status: 'BLOCKED' }, adminSession.userId);
      return NextResponse.json({ success: true, message: 'Participant suspended/blocked', participant: updated });
    }

    if (action === 'UNBLOCK') {
      const updated = await DBService.updateParticipant(participantId, { status: 'ACTIVE' }, adminSession.userId);
      return NextResponse.json({ success: true, message: 'Participant reinstated to active', participant: updated });
    }

    if (updates && typeof updates === 'object') {
      const updated = await DBService.updateParticipant(participantId, updates, adminSession.userId);
      return NextResponse.json({ success: true, message: 'Participant details updated', participant: updated });
    }

    return NextResponse.json({ error: 'No valid action or updates specified' }, { status: 400 });

  } catch (err: any) {
    console.error('[API ADMIN PARTICIPANTS PATCH ERROR]', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Super admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let participantId = searchParams.get('id') || searchParams.get('participantId');
    if (!participantId) {
      try {
        const body = await req.json();
        participantId = body.id || body.participantId;
      } catch {}
    }

    if (!participantId) {
      return NextResponse.json({ error: 'participantId is required for deletion' }, { status: 400 });
    }

    const res = await DBService.deleteParticipant(participantId, adminSession.userId);
    return NextResponse.json(res);

  } catch (err: any) {
    console.error('[API ADMIN PARTICIPANTS DELETE ERROR]', err);
    return NextResponse.json({ error: err.message || 'Delete operation failed' }, { status: 500 });
  }
}
