const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function resetAndVerifyAdmin() {
  const { data: p } = await supabase.from('participants').select('id, participant_id').eq('participant_id', 'TKFK26-ADMIN99').single();
  if (p) {
    const { data: sessions } = await supabase.from('quiz_sessions').select('id').eq('participant_id', p.id);
    if (sessions && sessions.length > 0) {
      const sIds = sessions.map(s => s.id);
      await supabase.from('quiz_answers').delete().in('session_id', sIds);
      await supabase.from('quiz_sessions').delete().in('id', sIds);
      console.log(`Cleared ${sIds.length} sessions for ${p.participant_id}`);
    }
  }

  const { data: questions } = await supabase.from('questions').select('*').order('id', { ascending: true });
  console.log('Total questions in DB questions table:', questions.length);
  console.log('Q1 text (DB):', questions[0].question_text);
  console.log('Q1 Option A (DB):', questions[0].option_a);
  console.log('Q1 Option B (DB):', questions[0].option_b);
  console.log('Q1 Option C (DB):', questions[0].option_c);
  console.log('Q1 Option D (DB):', questions[0].option_d);

  console.log('\nQ2 text (DB):', questions[1].question_text);
  console.log('Q3 text (DB):', questions[2].question_text);
  console.log('Q50 text (DB):', questions[49].question_text);
}

resetAndVerifyAdmin();
