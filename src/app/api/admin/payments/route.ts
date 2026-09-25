import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { PaymentStatus } from '@/types';
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const admin = getSupabaseServerAdminClient();
    let query = admin
      .from('registrations')
      .select('*, participants(name, email, phone, participant_id, state)', { count: 'exact' });

    if (status && status !== 'ALL') {
      query = query.eq('payment_status', status);
    }

    const offset = (page - 1) * limit;
    const { data: registrations, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Filter in-memory if search parameter is supplied
    let list = registrations || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r: any) => {
        const p = r.participants || {};
        return (
          (p.participant_id || '').toLowerCase().includes(q) ||
          (p.name || '').toLowerCase().includes(q) ||
          (p.email || '').toLowerCase().includes(q) ||
          (p.phone || '').toLowerCase().includes(q)
        );
      });
    }

    return NextResponse.json({
      success: true,
      registrations: list,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err: any) {
    console.error('[API ADMIN PAYMENTS GET ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { registrationId, status, reason, paymentReference } = body;

    if (!registrationId || !status) {
      return NextResponse.json({ error: 'registrationId and target status are required' }, { status: 400 });
    }

    // MANDATORY REASON FIELD GUARD
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json({ 
        error: 'State Machine Guard: A detailed reason (minimum 5 characters) is required for manual payment status changes.' 
      }, { status: 400 });
    }

    const currentReg = await DBService.getRegistrationById(registrationId);
    if (!currentReg) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    const targetStatus = status as PaymentStatus;
    const currentStatus = currentReg.payment_status;

    // STATE MACHINE GUARD VALIDATION
    const allowedTransitions: Record<string, string[]> = {
      'PENDING': ['SUCCESS', 'FAILED', 'MANUAL_REVIEW'],
      'SUCCESS': ['REFUNDED', 'MANUAL_REVIEW'],
      'FAILED': ['SUCCESS', 'MANUAL_REVIEW'],
      'MANUAL_REVIEW': ['SUCCESS', 'FAILED', 'REFUNDED'],
      'REFUNDED': []
    };

    if (currentStatus !== targetStatus) {
      const allowed = allowedTransitions[currentStatus] || [];
      if (!allowed.includes(targetStatus)) {
        return NextResponse.json({
          error: `State Machine Guard Violation: Transition from '${currentStatus}' to '${targetStatus}' is not allowed.`
        }, { status: 400 });
      }
    }

    let updated = null;
    if (targetStatus === 'SUCCESS') {
      updated = await DBService.activateConfirmedRegistration(
        registrationId, 
        paymentReference || `ADMIN_OVERRIDE_${Date.now()}`
      );
    } else {
      updated = await DBService.updatePaymentStatus(
        registrationId, 
        targetStatus, 
        paymentReference
      );
    }

    await DBService.logAdminAction(
      adminSession.userId, 
      `MANUAL_PAYMENT_UPDATE_${targetStatus}`, 
      'REGISTRATION', 
      registrationId, 
      { 
        previousStatus: currentStatus,
        newStatus: targetStatus,
        reason: reason.trim(),
        paymentReference,
        adminEmail: adminSession.email
      }
    );

    return NextResponse.json({ success: true, registration: updated });
  } catch (err: any) {
    console.error('[API ADMIN PAYMENTS PUT ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
