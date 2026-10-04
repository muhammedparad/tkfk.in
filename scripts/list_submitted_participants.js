const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select(`
      id,
      participant_id,
      started_at,
      expires_at,
      submitted_at,
      status,
      score,
      total_questions,
      participants (
        id,
        name,
        email,
        phone,
        participant_id,
        state
      )
    `)
    .order('submitted_at', { ascending: false });

  if (sErr) {
    console.error('Error fetching sessions:', sErr);
    return;
  }

  console.log(JSON.stringify(sessions, null, 2));
}

run();
