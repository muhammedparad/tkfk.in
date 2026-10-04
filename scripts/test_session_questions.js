const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function testSessionQuestions() {
  const { data: p } = await supabase.from('participants').select('id, participant_id').eq('participant_id', 'TKFK26-ADMIN99').single();
  
  // Clean old sessions
  const { data: oldS } = await supabase.from('quiz_sessions').select('id').eq('participant_id', p.id);
  if (oldS && oldS.length > 0) {
    const ids = oldS.map(s => s.id);
    await supabase.from('quiz_answers').delete().in('session_id', ids);
    await supabase.from('quiz_sessions').delete().in('id', ids);
  }

  // Create session
  const { data: sess } = await supabase.from('quiz_sessions').insert({
    participant_id: p.id,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS',
    total_questions: 50
  }).select().single();

  const { data: dbQuestions } = await supabase.from('questions').select('*').order('id', { ascending: true });

  console.log(`Session Created: ${sess.id}`);
  console.log(`Question 1 delivered to user:`);
  console.log(`- En: ${dbQuestions[0].question_text}`);
  console.log(`- Option A: ${dbQuestions[0].option_a}`);
  console.log(`- Option B: ${dbQuestions[0].option_b}`);
  console.log(`- Option C: ${dbQuestions[0].option_c}`);
  console.log(`- Option D: ${dbQuestions[0].option_d}`);

  console.log(`\nQuestion 2 delivered to user:`);
  console.log(`- En: ${dbQuestions[1].question_text}`);

  console.log(`\nQuestion 3 delivered to user:`);
  console.log(`- En: ${dbQuestions[2].question_text}`);

  console.log(`\nQuestion 50 delivered to user:`);
  console.log(`- En: ${dbQuestions[49].question_text}`);

  // Clean test session
  await supabase.from('quiz_sessions').delete().eq('id', sess.id);
}

testSessionQuestions();
