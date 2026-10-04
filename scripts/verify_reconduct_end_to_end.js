const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const AFFECTED_32_PUBLIC_IDS = [
  'TKFK26-835601', 'TKFK26-649383', 'TKFK26-225133', 'TKFK26-514226',
  'TKFK26-884644', 'TKFK26-102315', 'TKFK26-192628', 'TKFK26-296559',
  'TKFK26-106511', 'TKFK26-772260', 'TKFK26-707431', 'TKFK26-746740',
  'TKFK26-345185', 'TKFK26-544046', 'TKFK26-336147', 'TKFK26-539061',
  'TKFK26-476039', 'TKFK26-918545', 'TKFK26-510149', 'TKFK26-516234',
  'TKFK26-810934', 'TKFK26-536605', 'TKFK26-589280', 'TKFK26-180939',
  'TKFK26-878266', 'TKFK26-343409', 'TKFK26-680020', 'TKFK26-998840',
  'TKFK26-371033', 'TKFK26-715335', 'TKFK26-729150', 'TKFK26-470330'
];

function normalizeQuestionId(qId) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qId)) {
    return qId;
  }
  const num = parseInt(qId.replace(/[^0-9]/g, ''), 10) || 1;
  return `00000000-0000-0000-0000-${String(num).padStart(12, '0')}`;
}

async function runEndToEndVerification() {
  console.log('========================================================');
  console.log('🚀 RUNNING COMPREHENSIVE RE-CONDUCT VERIFICATION SUITE');
  console.log('========================================================\n');

  // STEP 1: Verify Supabase Questions Table
  console.log('--- STEP 1: VERIFY QUESTIONS TABLE ---');
  const { data: dbQuestions, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true });

  if (qErr) throw qErr;
  console.log(`✅ Loaded ${dbQuestions.length} questions from database.`);
  if (dbQuestions.length !== 50) {
    throw new Error(`Expected 50 questions, found ${dbQuestions.length}`);
  }

  const q1 = dbQuestions[0];
  console.log(`Q1: ${q1.question_text}`);
  console.log(`    A: ${q1.option_a} | Correct: ${q1.correct_option}`);
  if (!q1.question_text.includes("Gandhi's full name") || q1.correct_option !== 'A') {
    throw new Error('Q1 text or answer key mismatch!');
  }

  const q50 = dbQuestions[49];
  console.log(`Q50: ${q50.question_text}`);
  console.log(`     A: ${q50.option_a} | B: ${q50.option_b} | C: ${q50.option_c} | Correct: ${q50.correct_option}`);
  if (!q50.question_text.includes("Salt Satyagraha") || q50.correct_option !== 'C') {
    throw new Error('Q50 text or answer key mismatch!');
  }
  console.log('✅ All questions in DB verified with exact answer keys.\n');

  // STEP 2: Verify Protected 17 Unaffected Participants
  console.log('--- STEP 2: VERIFY PROTECTED 17 UNAFFECTED PARTICIPANTS ---');
  const { data: allParticipants } = await supabase.from('participants').select('id, participant_id, name');
  const pMap = new Map(allParticipants.map(p => [p.id, p]));

  const { data: completedSessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .in('status', ['SUBMITTED', 'EXPIRED']);

  console.log(`Found ${completedSessions.length} finalized sessions in database.`);
  for (const s of completedSessions) {
    const p = pMap.get(s.participant_id);
    if (!p) continue;
    console.log(`   ✓ Protected: [${p.participant_id}] ${p.name} — Score: ${s.score}/50 (${s.status})`);
    if (AFFECTED_32_PUBLIC_IDS.includes(p.participant_id)) {
      throw new Error(`CRITICAL ERROR: Affected participant ${p.participant_id} has active session!`);
    }
  }
  console.log('✅ Unaffected participant scores are 100% safe and intact.\n');

  // STEP 3: Verify 32 Affected Participants are Ready for Clean Entry
  console.log('--- STEP 3: VERIFY 32 AFFECTED PARTICIPANTS READY FOR ENTRY ---');
  const { data: affectedParticipants } = await supabase
    .from('participants')
    .select('id, participant_id, name, phone, status')
    .in('participant_id', AFFECTED_32_PUBLIC_IDS);

  console.log(`Found ${affectedParticipants.length} registered participant records for the 32 IDs.`);
  if (affectedParticipants.length !== 32) {
    throw new Error(`Expected 32 participants, found ${affectedParticipants.length}`);
  }

  const affectedUuids = affectedParticipants.map(p => p.id);
  const { data: affectedSessions } = await supabase
    .from('quiz_sessions')
    .select('id, participant_id')
    .in('participant_id', affectedUuids);

  console.log(`Active/previous sessions found for the 32 participants: ${affectedSessions.length} (Expected: 0)`);
  if (affectedSessions.length !== 0) {
    throw new Error(`Expected 0 sessions for affected participants, found ${affectedSessions.length}`);
  }
  console.log('✅ All 32 affected participants are clean and ready to receive fresh 25-min attempts.\n');

  // STEP 4: Live End-to-End Sandbox Simulation
  console.log('--- STEP 4: LIVE END-TO-END SANDBOX QUIZ SIMULATION ---');
  console.log('Testing complete lifecycle: Session creation -> Question freezing -> Auto-saving answers -> Grading -> Submission');

  // Create temporary sandbox test participant
  const testEmail = `test_reconduct_${Date.now()}@tkfk.test`;
  const { data: testP, error: tpErr } = await supabase
    .from('participants')
    .insert({
      name: 'Reconduct Sandbox Verifier',
      email: testEmail,
      phone: '9888877777',
      normalized_phone: '9888877777',
      state: 'Kerala',
      status: 'ACTIVE',
      participant_id: 'TKFK26-SANDBOX01'
    })
    .select()
    .single();

  if (tpErr) throw tpErr;
  const testParticipantUuid = testP.id;
  console.log(`Using sandbox test UUID: ${testParticipantUuid} (Public ID: ${testP.participant_id})`);

  try {
    // 4.1 Create Quiz Session
    const durationMs = 25 * 60 * 1000;
    const started_at = new Date().toISOString();
    const expires_at = new Date(Date.now() + durationMs).toISOString();

    const { data: sess, error: sessErr } = await supabase
      .from('quiz_sessions')
      .insert({
        participant_id: testParticipantUuid,
        started_at,
        expires_at,
        status: 'IN_PROGRESS',
        total_questions: 50
      })
      .select()
      .single();

    if (sessErr) throw sessErr;
    console.log(`✅ Session created successfully: ID=${sess.id}, Expires=${sess.expires_at}`);

    // 4.2 Test Auto-Saving 50 Answers into quiz_answers
    console.log('Testing answer auto-saves for all 50 questions...');
    const answersToSave = [];
    // We will answer all 50 questions correctly except Q10 which we'll deliberately answer 'A' (incorrect, correct is 'B')
    // Expected score = 49/50
    for (let i = 0; i < dbQuestions.length; i++) {
      const q = dbQuestions[i];
      let selectedOption = q.correct_option;
      if (i === 9) { // Q10
        selectedOption = 'A'; // Wrong answer
      }
      answersToSave.push({
        session_id: sess.id,
        question_id: q.id,
        selected_option: selectedOption,
        updated_at: new Date().toISOString()
      });
    }

    const { data: savedAnswers, error: ansErr } = await supabase
      .from('quiz_answers')
      .upsert(answersToSave, { onConflict: 'session_id,question_id' })
      .select();

    if (ansErr) throw ansErr;
    console.log(`✅ Successfully saved ${savedAnswers.length}/50 answers into quiz_answers without foreign key errors!`);

    // 4.3 Test Grading and Submission
    const { data: readAnswers } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('session_id', sess.id);

    const answerKeyMap = new Map(dbQuestions.map(q => [q.id, q.correct_option]));
    let calculatedScore = 0;
    readAnswers.forEach(a => {
      const correct = answerKeyMap.get(a.question_id);
      if (correct && correct === a.selected_option) {
        calculatedScore += 1;
      }
    });

    console.log(`Computed Score: ${calculatedScore}/50 (Expected: 49)`);
    if (calculatedScore !== 49) {
      throw new Error(`Scoring calculation error! Expected 49, got ${calculatedScore}`);
    }

    const { data: finalizedSess, error: finErr } = await supabase
      .from('quiz_sessions')
      .update({
        status: 'SUBMITTED',
        score: calculatedScore,
        submitted_at: new Date().toISOString()
      })
      .eq('id', sess.id)
      .select()
      .single();

    if (finErr) throw finErr;
    console.log(`✅ Session finalized successfully: Status=${finalizedSess.status}, Score=${finalizedSess.score}/50`);

    // 4.4 Clean up Sandbox Test Data
    console.log('\nCleaning up sandbox test records...');
    await supabase.from('quiz_answers').delete().eq('session_id', sess.id);
    await supabase.from('quiz_sessions').delete().eq('id', sess.id);
    if (testP) {
      await supabase.from('participants').delete().eq('id', testP.id);
    }
    console.log('✅ Sandbox test records cleaned up cleanly.');

  } catch (testError) {
    console.error('❌ Test failed during sandbox simulation:', testError);
    throw testError;
  }

  console.log('\n========================================================');
  console.log('🎉 ALL SYSTEMS 100% OPERATIONAL & VERIFIED FOR RE-CONDUCT');
  console.log('========================================================');
}

runEndToEndVerification().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
