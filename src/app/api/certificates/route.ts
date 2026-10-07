import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseMode } from '@/lib/supabase';
import { DBService } from '@/services/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get('id') || searchParams.get('query') || searchParams.get('code') || '';
    const cleanQuery = rawQuery.trim();

    if (!cleanQuery) {
      return NextResponse.json(
        { success: false, message: 'Please provide a Participant ID or registered phone number.' },
        { status: 400 }
      );
    }

    const cleanUpper = cleanQuery.toUpperCase();
    const cleanPhone = cleanQuery.replace(/\D/g, '');

    if (isSupabaseMode() && supabaseAdmin) {
      // 1. Search participant by participant_id, UUID, or phone
      let queryBuilder = supabaseAdmin.from('participants').select('*');

      if (cleanUpper.startsWith('TKFK26-') || cleanUpper.startsWith('TKFK')) {
        queryBuilder = queryBuilder.ilike('participant_id', `%${cleanUpper}%`);
      } else if (cleanPhone.length >= 10) {
        queryBuilder = queryBuilder.or(`phone.eq.${cleanPhone},normalized_phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`);
      } else {
        queryBuilder = queryBuilder.or(`participant_id.ilike.%${cleanUpper}%,id.eq.${cleanQuery}`);
      }

      const { data: participants, error: pErr } = await queryBuilder.limit(1);

      let participant: any = null;
      if (participants && participants.length > 0) {
        participant = participants[0];
      } else {
        // Fallback: check if query matches number part of participant_id
        const { data: fallbackP } = await supabaseAdmin
          .from('participants')
          .select('*')
          .ilike('participant_id', `%${cleanUpper}%`)
          .limit(1);

        if (!fallbackP || fallbackP.length === 0) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'No participant found matching "' + cleanQuery + '". Please check your Participant ID or phone number.' 
            },
            { status: 404 }
          );
        }
        participant = fallbackP[0];
      }

      if (!participant) {
        return NextResponse.json(
          { success: false, message: 'No participant record found.' },
          { status: 404 }
        );
      }

      // 2. Fetch Registration to verify payment
      const { data: registrations, error: rErr } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('participant_id', participant.id)
        .order('created_at', { ascending: false });

      const reg = registrations && registrations.length > 0 ? registrations[0] : null;

      // Verification Rule: Successful Payment (payment_status === 'SUCCESS' or registration_status === 'CONFIRMED')
      const isPaid = reg?.payment_status === 'SUCCESS' || reg?.registration_status === 'CONFIRMED';

      if (!isPaid) {
        return NextResponse.json({
          success: true,
          eligible: false,
          participant: {
            participant_id: participant.participant_id,
            name: participant.name,
            state: participant.state,
            city: participant.city,
            college: participant.college
          },
          message: 'Registration payment has not been completed or confirmed for this participant ID.'
        });
      }

      return NextResponse.json({
        success: true,
        eligible: true,
        participant: {
          id: participant.id,
          participant_id: participant.participant_id,
          name: participant.name,
          phone: participant.phone,
          email: participant.email,
          state: participant.state,
          city: participant.city,
          college: participant.college
        },
        registration: {
          payment_status: reg.payment_status,
          registration_status: reg.registration_status,
          amount: reg.amount,
          confirmed_at: reg.confirmed_at || reg.created_at,
          payment_reference: reg.payment_reference
        }
      });

    } else {
      // Fallback in-memory mode
      const p = await DBService.getParticipantById(cleanUpper);
      if (!p) {
        return NextResponse.json(
          { success: false, message: 'Participant record not found.' },
          { status: 404 }
        );
      }

      const reg = await DBService.getRegistrationByParticipantId(p.id);
      const isPaid = reg?.payment_status === 'SUCCESS' || reg?.registration_status === 'CONFIRMED';

      return NextResponse.json({
        success: true,
        eligible: isPaid,
        participant: p,
        registration: reg || null
      });
    }

  } catch (err: any) {
    console.error('[API CERTIFICATES LOOKUP ERROR]', err);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while looking up certificate records.' },
      { status: 500 }
    );
  }
}
