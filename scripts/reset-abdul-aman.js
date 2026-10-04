const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetAbdulAman() {
  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .or('participant_id.eq.TKFK26-878266,phone.eq.9847513564');

  if (pErr || !participants || participants.length === 0) {
    console.error('Participant not found:', pErr);
    return;
  }

  for (const p of participants) {
    console.log('Target Participant:', p.name, p.participant_id, p.id, p.phone);

    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_id', p.id);

    console.log('Sessions before reset:', sessions);

    if (sessions && sessions.length > 0) {
      const sIds = sessions.map(s => s.id);
      await supabase.from('quiz_answers').delete().in('session_id', sIds);
      await supabase.from('quiz_session_questions').delete().in('session_id', sIds);
      await supabase.from('quiz_sessions').delete().eq('participant_id', p.id);
      console.log('Deleted all sessions & answers for Abdul aman.r');
    } else {
      console.log('No sessions found for Abdul aman.r - already clean.');
    }

    const { data: check } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_id', p.id);
    console.log('Remaining sessions after reset:', check ? check.length : 0);
  }
}

resetAbdulAman();
