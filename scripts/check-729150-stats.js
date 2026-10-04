const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStats() {
  const { data: p } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', 'TKFK26-729150')
    .single();

  if (!p) {
    console.log('Participant TKFK26-729150 not found');
    return;
  }

  console.log('Participant:', p.name, p.participant_id, p.phone, p.state);

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id);

  console.log('Sessions count:', sessions ? sessions.length : 0);

  if (sessions && sessions.length > 0) {
    for (const s of sessions) {
      console.log('\n--- Session ---');
      console.log('Session ID:', s.id);
      console.log('Status:', s.status);
      console.log('Started At:', s.started_at);
      console.log('Expires At:', s.expires_at);
      console.log('Submitted At:', s.submitted_at);
      console.log('Score:', s.score, '/', s.total_questions || 50);

      const { data: answers } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('session_id', s.id);

      console.log('Total Answers Saved:', answers ? answers.length : 0);
      if (answers && answers.length > 0) {
        console.log('Answers breakdown:', answers.map(a => `${a.question_id}: ${a.selected_option}`).join(', '));
      }

      // Check proctoring stream
      const { data: streams } = await supabase
        .from('proctoring_streams')
        .select('current_index, answered_count, time_left_seconds, warnings_count, last_heartbeat')
        .eq('session_id', s.id)
        .maybeSingle();

      if (streams) {
        console.log('Live Proctoring Telemetry:', streams);
      }
    }
  }
}

checkStats();
