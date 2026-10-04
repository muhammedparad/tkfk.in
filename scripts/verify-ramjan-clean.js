const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  const { data: p } = await supabase.from('participants').select('id, name, participant_id').eq('participant_id', 'TKFK26-729150').single();
  const { data: s } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id);
  console.log(`[VERIFIED CLEAN] ${p.name} (${p.participant_id}):`, s ? s.length : 0, 'sessions found.');
}

verify();
