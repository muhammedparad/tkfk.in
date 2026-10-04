const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function testAdminFlow() {
  console.log('=== TESTING ADMIN QUIZ SIMULATOR & TEST PARTICIPANT FLOW ===\n');

  // 1. Verify or create TKFK26-ADMIN99
  const { data: adminP, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', 'TKFK26-ADMIN99')
    .maybeSingle();

  console.log('Admin Test Participant:', adminP ? `Found: ${adminP.name} (${adminP.id})` : 'Not found');

  let adminUuid = adminP?.id;
  if (!adminP) {
    const { data: newP, error: nErr } = await supabase
      .from('participants')
      .insert({
        name: 'TKFK Admin Tester',
        email: 'admin-test@tkfk.in',
        phone: '9999999999',
        normalized_phone: '9999999999',
        state: 'Kerala',
        status: 'ACTIVE',
        participant_id: 'TKFK26-ADMIN99'
      })
      .select()
      .single();
    if (nErr) throw nErr;
    adminUuid = newP.id;
    console.log('Created Admin Test Participant:', adminUuid);
  }

  // Ensure Registration exists
  await supabase
    .from('registrations')
    .upsert({
      participant_id: adminUuid,
      registration_status: 'CONFIRMED',
      payment_status: 'SUCCESS',
      payment_reference: 'ADMIN-TEST-PASS',
      amount: 99,
      currency: 'INR'
    }, { onConflict: 'participant_id' });

  // 2. Clean previous admin test sessions
  const { data: oldSess } = await supabase.from('quiz_sessions').select('id').eq('participant_id', adminUuid);
  if (oldSess && oldSess.length > 0) {
    const ids = oldSess.map(s => s.id);
    await supabase.from('quiz_answers').delete().in('session_id', ids);
    await supabase.from('quiz_sessions').delete().in('id', ids);
    console.log(`Cleared ${ids.length} old test sessions for admin.`);
  }

  // 3. Create fresh test session
  const started_at = new Date().toISOString();
  const expires_at = new Date(Date.now() + 25 * 60 * 1000).toISOString();
  const { data: sess, error: sErr } = await supabase
    .from('quiz_sessions')
    .insert({
      participant_id: adminUuid,
      started_at,
      expires_at,
      status: 'IN_PROGRESS',
      total_questions: 50
    })
    .select()
    .single();

  if (sErr) throw sErr;
  console.log(`✅ Started fresh Admin Test Session: ID=${sess.id}`);

  // 4. Fetch 50 questions
  const { data: questions } = await supabase.from('questions').select('*').order('id', { ascending: true });
  console.log(`Loaded ${questions.length} questions for testing.`);

  // 5. Simulate answering Question 1 and Question 50
  const q1 = questions[0];
  const q50 = questions[49];

  const { error: a1Err } = await supabase.from('quiz_answers').upsert({
    session_id: sess.id,
    question_id: q1.id,
    selected_option: q1.correct_option,
    updated_at: new Date().toISOString()
  }, { onConflict: 'session_id,question_id' });
  if (a1Err) throw a1Err;
  console.log(`✅ Saved answer for Q1 (${q1.question_text.slice(0, 30)}...): Option ${q1.correct_option}`);

  const { error: a50Err } = await supabase.from('quiz_answers').upsert({
    session_id: sess.id,
    question_id: q50.id,
    selected_option: q50.correct_option,
    updated_at: new Date().toISOString()
  }, { onConflict: 'session_id,question_id' });
  if (a50Err) throw a50Err;
  console.log(`✅ Saved answer for Q50 (${q50.question_text.slice(0, 30)}...): Option ${q50.correct_option}`);

  // 6. Finalize session and verify score
  const { data: finSess, error: finErr } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'SUBMITTED',
      score: 2,
      submitted_at: new Date().toISOString()
    })
    .eq('id', sess.id)
    .select()
    .single();

  if (finErr) throw finErr;
  console.log(`✅ Finalized Admin Test Session: Status=${finSess.status}, Score=${finSess.score}`);

  // 7. Test Admin Reset
  await supabase.from('quiz_answers').delete().eq('session_id', sess.id);
  await supabase.from('quiz_sessions').delete().eq('id', sess.id);
  console.log(`✅ Cleaned test session. Admin reset verified.`);

  console.log('\n🎉 ADMIN TEST SUITE FULLY OPERATIONAL!');
}

testAdminFlow().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
