const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetParticipant(participantPublicId) {
  const { data: p, error: pErr } = await supabase
    .from('participants')
    .select('id, name, phone, participant_id')
    .eq('participant_id', participantPublicId)
    .single();

  if (pErr || !p) {
    console.error('Participant not found:', participantPublicId, pErr);
    return;
  }

  console.log('Found participant:', p);

  // Delete answers first
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('id')
    .eq('participant_id', p.id);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map(s => s.id);
    const { error: delAnsErr } = await supabase
      .from('quiz_answers')
      .delete()
      .in('session_id', sessionIds);
    console.log('Deleted answers:', delAnsErr);

    const { error: delSessErr } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('participant_id', p.id);
    console.log('Deleted sessions:', delSessErr);
  } else {
    console.log('No sessions found to delete.');
  }

  // Verify
  const { data: checkSessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id);
  console.log('Current sessions count for', participantPublicId, ':', checkSessions ? checkSessions.length : 0);
}

async function main() {
  await resetParticipant('TKFK26-180939');
  await resetParticipant('TKFK26-878266');
}

main();
