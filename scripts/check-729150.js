const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: p } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', 'TKFK26-729150')
    .single();

  console.log('Participant:', p);

  if (p) {
    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_id', p.id);
    console.log('Sessions:', sessions);

    if (sessions && sessions.length > 0) {
      for (const s of sessions) {
        const { data: answers } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('session_id', s.id);
        console.log(`Answers for session ${s.id}:`, answers ? answers.length : 0);
      }
    }
  }
}

run();
