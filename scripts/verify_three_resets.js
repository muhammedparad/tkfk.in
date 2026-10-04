const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyAll() {
  const ids = ['TKFK26-180939', 'TKFK26-729150', 'TKFK26-878266'];
  for (const id of ids) {
    const { data: p } = await supabase.from('participants').select('id, name, participant_id, phone').eq('participant_id', id).single();
    if (p) {
      const { data: s } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id);
      console.log(`[VERIFIED] ${p.name} (${p.participant_id}) -> Sessions Count: ${s ? s.length : 0}`);
    }
  }
}

verifyAll();
