const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', 'TKFK26-180939').single();
  const { data: session } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id).maybeSingle();
  console.log('Session checkOnly simulation for Ayshath Rabeea:', {
    hasSession: Boolean(session),
    session: session || null,
    canAttempt: !session || session.status === 'IN_PROGRESS'
  });
}

run();
