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
    return null;
  }

  console.log(`[FOUND] ${p.name} (${p.participant_id}, ID: ${p.id}, Phone: ${p.phone})`);

  // Delete answers and sessions
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
  } else {
    console.log(`  -> No active sessions found, already clean.`);
  }

  // Verify
  const { data: check } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id);

  console.log(`  [CONFIRMED] Remaining sessions count for ${p.name} (${participantCode}): ${check ? check.length : 0}`);
  return { name: p.name, id: p.participant_id, phone: p.phone, count: check ? check.length : 0 };
}

async function main() {
  const targets = ['TKFK26-180939', 'TKFK26-343409', 'TKFK26-878266'];
  const results = [];
  for (const id of targets) {
    console.log(`\n========================================`);
    console.log(`Resetting: ${id}`);
    console.log(`========================================`);
    const r = await resetParticipant(id);
    if (r) results.push(r);
  }
  console.log('\nFinal Results:', results);
}

main();
