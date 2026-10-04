const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

function questionIdToUuid(qId) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qId)) {
    return qId;
  }
  const num = parseInt(qId.replace(/[^0-9]/g, ''), 10) || 1;
  return `00000000-0000-0000-0000-${String(num).padStart(12, '0')}`;
}

async function seedQuestionsTable() {
  const { OFFICIAL_50_QUESTIONS } = require('../src/data/questions');
  console.log(`Found ${OFFICIAL_50_QUESTIONS.length} official questions.`);

  const rows = OFFICIAL_50_QUESTIONS.map((q, idx) => ({
    id: questionIdToUuid(q.id || `q-${idx + 1}`),
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    category: q.category,
    difficulty: q.difficulty || 'MEDIUM',
    explanation: q.explanation || ''
  }));

  console.log('Sample row to insert:', rows[0]);

  const { data, error } = await supabase
    .from('questions')
    .upsert(rows, { onConflict: 'id' })
    .select();

  console.log('Upsert result count:', data ? data.length : 0, 'Error:', error);

  // Verify
  const { data: countCheck } = await supabase.from('questions').select('id', { count: 'exact' });
  console.log('Total questions in questions table:', countCheck ? countCheck.length : 0);

  // Now test saving an answer into quiz_answers!
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').limit(1);
  if (sessions && sessions.length > 0) {
    const s = sessions[0];
    const testUuid = questionIdToUuid('q-1');
    const { data: aData, error: aErr } = await supabase
      .from('quiz_answers')
      .upsert({
        session_id: s.id,
        question_id: testUuid,
        selected_option: 'B',
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id,question_id' });

    console.log('Test Answer Save Result:', aData, 'Error:', aErr);

    const { data: readBack } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
    console.log('Read back answers for test session:', readBack);

    // cleanup test answer
    await supabase.from('quiz_answers').delete().eq('session_id', s.id).eq('question_id', testUuid);
  }
}

seedQuestionsTable();
