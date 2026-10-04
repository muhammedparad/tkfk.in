const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function questionIdToUuid(qId) {
  // If already a valid UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qId)) {
    return qId;
  }
  // Convert q-1 -> 00000000-0000-0000-0000-000000000001
  const num = parseInt(qId.replace(/[^0-9]/g, ''), 10) || 1;
  return `00000000-0000-0000-0000-${String(num).padStart(12, '0')}`;
}

async function testInsertUuid() {
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').limit(1);
  if (sessions && sessions.length > 0) {
    const s = sessions[0];
    const testUuid = questionIdToUuid('q-1');
    console.log('Testing UUID insert:', testUuid);

    const { data: upsertData, error: upsertErr } = await supabase
      .from('quiz_answers')
      .upsert({
        session_id: s.id,
        question_id: testUuid,
        selected_option: 'A',
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id,question_id' });

    console.log('Upsert result with UUID:', upsertData, 'Error:', upsertErr);

    if (!upsertErr) {
      const { data: check } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
      console.log('SUCCESS! Read back answer:', check);
      // cleanup
      await supabase.from('quiz_answers').delete().eq('session_id', s.id).eq('question_id', testUuid);
    }
  }
}

testInsertUuid();
