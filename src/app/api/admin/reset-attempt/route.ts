import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';
import { DBService } from '@/services/db';
import { getSupabaseServerAdminClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json({ error: 'Participant identifier (ID, Participant ID, or Phone) is required' }, { status: 400 });
    }

    const cleanIdent = identifier.trim();
    const admin = getSupabaseServerAdminClient();

    // Find participant
    let query = admin
      .from('participants')
      .select('id, name, phone, participant_id')
      .or(`id.eq.${cleanIdent},participant_id.eq.${cleanIdent.toUpperCase()},phone.eq.${cleanIdent}`);

    const { data: participants, error: pErr } = await query;
    if (pErr || !participants || participants.length === 0) {
      return NextResponse.json({ error: 'Participant not found matching identifier' }, { status: 404 });
    }

    const targetParticipant = participants[0];

    const retryResult = await DBService.grantParticipantRetry(targetParticipant.id, adminSession.userId);

    return NextResponse.json({
      success: true,
      message: retryResult.message,
      participant: targetParticipant
    });

  } catch (err: any) {
    console.error('[ADMIN RESET ATTEMPT ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
