const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSaveAnswer() {
  // Try to insert a test answer for an active session to see if the table exists or errors out
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').limit(1);
  console.log('Sample session:', sessions);

  if (sessions && sessions.length > 0) {
    const s = sessions[0];
    const { data: upsertData, error: upsertErr } = await supabase
      .from('quiz_answers')
      .upsert({
        session_id: s.id,
        question_id: 'q-1',
        selected_option: 'A',
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id,question_id' });

    console.log('Upsert result:', upsertData, 'Error:', upsertErr);

    const { data: checkAnswers } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
    console.log('Check answers after test upsert:', checkAnswers);

    // Clean up test answer
    await supabase.from('quiz_answers').delete().eq('session_id', s.id).eq('question_id', 'q-1');
  }
}

testSaveAnswer();
