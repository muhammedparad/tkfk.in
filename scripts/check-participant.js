const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('id, name, phone, participant_id, status')
    .or('participant_id.eq.TKFK26-180939,phone.eq.9061058001');

  console.log('Participants:', participants, pErr);

  if (participants && participants.length > 0) {
    for (const p of participants) {
      const { data: sessions, error: sErr } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('participant_id', p.id);
      console.log('Sessions for', p.id, sessions, sErr);
    }
  }
}

run();
