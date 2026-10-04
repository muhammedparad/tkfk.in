const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAndReset(code) {
  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .or(`participant_id.eq.${code},phone.eq.${code}`);

  if (pErr || !participants || participants.length === 0) {
    console.log('Not found:', code, pErr);
    return;
  }

  for (const p of participants) {
    console.log('Found Participant:', p.name, p.participant_id, p.id, p.phone);

    // Get all sessions
    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('id, status, started_at, submitted_at')
      .eq('participant_id', p.id);

    console.log('Existing sessions before reset:', sessions);

    if (sessions && sessions.length > 0) {
      const sIds = sessions.map(s => s.id);
      await supabase.from('quiz_answers').delete().in('session_id', sIds);
      await supabase.from('quiz_session_questions').delete().in('session_id', sIds);
      await supabase.from('quiz_sessions').delete().eq('participant_id', p.id);
      console.log('Deleted all sessions & answers for', p.name);
    } else {
      console.log('Zero sessions found for', p.name, '- already clean.');
    }

    // Verify
    const { data: check } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id);
    console.log('Remaining sessions after reset for', p.name, ':', check ? check.length : 0);
  }
}

async function main() {
  console.log('=== RESETTING AYSHATH RABEEA. AM ===');
  await checkAndReset('TKFK26-180939');
  await checkAndReset('9061058001');

  console.log('\n=== RESETTING RAMJAN ALI ===');
  await checkAndReset('TKFK26-729150');
  await checkAndReset('9707684764');
}

main();
