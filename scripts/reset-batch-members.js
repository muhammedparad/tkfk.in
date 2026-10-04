const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetParticipant(participantCode) {
  const { data: p, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', participantCode)
    .single();

  if (pErr || !p) {
    console.log(`[NOT FOUND] ${participantCode}:`, pErr);
    return;
  }

  console.log(`[FOUND] ${p.name} (${p.participant_id}, ID: ${p.id}, Phone: ${p.phone})`);

  // Delete answers first
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('id, status, started_at, submitted_at, score')
    .eq('participant_id', p.id);

  console.log(`  Existing sessions count: ${sessions ? sessions.length : 0}`, sessions);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map(s => s.id);
    await supabase.from('quiz_answers').delete().in('session_id', sessionIds);
    await supabase.from('quiz_session_questions').delete().in('session_id', sessionIds);
    await supabase.from('quiz_sessions').delete().eq('participant_id', p.id);
    console.log(`  -> Successfully deleted all sessions & answers for ${p.name}`);
  }

  // Verify
  const { data: check } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id);

  console.log(`  [CONFIRMED] Remaining sessions count for ${p.name} (${participantCode}): ${check ? check.length : 0}`);
}

async function main() {
  const targets = ['TKFK26-900062', 'TKFK26-810934', 'TKFK26-589280'];
  for (const id of targets) {
    console.log(`\n========================================`);
    console.log(`Resetting: ${id}`);
    console.log(`========================================`);
    await resetParticipant(id);
  }
}

main();
