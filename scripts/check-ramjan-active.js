const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: p } = await supabase.from('participants').select('id, name').eq('participant_id', 'TKFK26-729150').single();
  const { data: s } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id).single();
  console.log('Ramjan Ali new session status:', s.status, 'Started at:', s.started_at);
}

check();
