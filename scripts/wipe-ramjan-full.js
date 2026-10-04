const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function wipeAllForRamjan() {
  const { data: p, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', 'TKFK26-729150')
    .single();

  if (pErr || !p) {
    console.error('Participant not found:', pErr);
    return;
  }

  console.log(`[TARGET] ${p.name} (${p.participant_id}, UUID: ${p.id}, Phone: ${p.phone})`);

  // 1. Fetch all sessions
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('id')
    .eq('participant_id', p.id);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map(s => s.id);
    console.log(`Found ${sessions.length} sessions to wipe:`, sessionIds);

    // Delete answers
    const { error: ansErr } = await supabase
      .from('quiz_answers')
      .delete()
      .in('session_id', sessionIds);
    console.log('Deleted answers:', ansErr);

    // Delete frozen questions
    const { error: sqErr } = await supabase
      .from('quiz_session_questions')
      .delete()
      .in('session_id', sessionIds);
    console.log('Deleted session questions:', sqErr);

    // Delete proctoring streams
    try {
      await supabase
        .from('proctoring_streams')
        .delete()
        .eq('participant_id', p.id);
      console.log('Deleted proctoring streams');
    } catch {}

    // Delete sessions
    const { error: sessErr } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('participant_id', p.id);
    console.log('Deleted quiz sessions:', sessErr);
  } else {
    console.log('No sessions found to delete.');
  }

  // Verification
  const { data: checkSessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id);

  console.log(`\n[VERIFICATION] Remaining sessions for Ramjan Ali: ${checkSessions ? checkSessions.length : 0}`);
}

wipeAllForRamjan();
