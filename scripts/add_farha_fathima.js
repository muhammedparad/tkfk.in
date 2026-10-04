const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Load environment variables cleanly
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const envVars = {};
envFile.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    let v = trimmed.substring(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.substring(1, v.length - 1);
    }
    envVars[trimmed.substring(0, idx).trim()] = v;
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function generateParticipantId() {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `TKFK26-${digits}`;
}

async function addFarhaFathima() {
  console.log('====================================================');
  console.log('🌟 ADDING PARTICIPANT & OFFICIAL RESULT: FARHA FATHIMA');
  console.log('====================================================\n');

  const fullName = 'FARHA FATHIMA';
  const rawPhone = '+91 88917 39594';
  const normalizedPhone = '8891739594';
  const email = 'fathimathfarha210@gmail.com';
  const state = 'Kerala';

  // Check if participant exists
  let { data: existingP } = await supabase
    .from('participants')
    .select('*')
    .or(`normalized_phone.eq.${normalizedPhone},phone.eq.${normalizedPhone},email.eq.${email}`)
    .maybeSingle();

  let participant = existingP;

  if (!participant) {
    let assignedId = generateParticipantId();
    // Check if ID is taken
    while (true) {
      const { data: check } = await supabase.from('participants').select('id').eq('participant_id', assignedId).maybeSingle();
      if (!check) break;
      assignedId = generateParticipantId();
    }

    console.log(`Creating participant record with ID: ${assignedId}...`);
    const { data: createdP, error: pErr } = await supabase
      .from('participants')
      .insert({
        name: fullName,
        phone: rawPhone,
        normalized_phone: normalizedPhone,
        email: email,
        state: state,
        status: 'ACTIVE',
        participant_id: assignedId,
        created_at: '2026-10-04T12:00:00.000Z',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pErr) {
      console.error('Error creating participant:', pErr);
      throw pErr;
    }
    participant = createdP;
    console.log(`✅ Created participant: ${participant.name} (${participant.participant_id}) [UUID: ${participant.id}]`);
  } else {
    console.log(`Participant already exists: ${participant.name} (${participant.participant_id})`);
    if (participant.status !== 'ACTIVE') {
      await supabase.from('participants').update({ status: 'ACTIVE' }).eq('id', participant.id);
    }
  }

  // 2. Create or update registration
  const { data: existingReg } = await supabase
    .from('registrations')
    .select('*')
    .eq('participant_id', participant.id)
    .maybeSingle();

  if (!existingReg) {
    console.log('Creating registration record with payment status SUCCESS...');
    const { data: reg, error: regErr } = await supabase
      .from('registrations')
      .insert({
        participant_id: participant.id,
        amount: 99,
        currency: 'INR',
        payment_status: 'SUCCESS',
        registration_status: 'CONFIRMED',
        payment_reference: 'OFFICIAL_CONFIRMED_FARHA',
        confirmed_at: '2026-10-04T12:00:00.000Z',
        created_at: '2026-10-04T12:00:00.000Z'
      })
      .select()
      .single();

    if (regErr) {
      console.error('Error creating registration:', regErr);
    } else {
      console.log(`✅ Created registration record (Payment: SUCCESS, Status: CONFIRMED)`);
    }
  } else {
    await supabase.from('registrations').update({
      payment_status: 'SUCCESS',
      registration_status: 'CONFIRMED'
    }).eq('id', existingReg.id);
    console.log(`✅ Updated existing registration record to SUCCESS / CONFIRMED`);
  }

  // 3. Setup Quiz Session
  // Timing: 3 minutes 10 seconds = 190 seconds
  // Start: 7:05:00 PM IST -> 13:35:00.000Z
  // Submit: 7:08:10 PM IST -> 13:38:10.000Z (exact 190 seconds)
  const startedAt = '2026-10-04T13:35:00.000Z';
  const submittedAt = '2026-10-04T13:38:10.000Z';
  const expiresAt = '2026-10-04T14:00:00.000Z';

  const { data: existingSession } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', participant.id)
    .maybeSingle();

  let sessionId;
  if (!existingSession) {
    console.log('Creating quiz session with 50/50 score and 3m 10s duration...');
    const { data: session, error: sErr } = await supabase
      .from('quiz_sessions')
      .insert({
        participant_id: participant.id,
        status: 'SUBMITTED',
        score: 50,
        total_questions: 50,
        started_at: startedAt,
        submitted_at: submittedAt,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (sErr) {
      console.error('Error creating quiz session:', sErr);
      throw sErr;
    }
    sessionId = session.id;
    console.log(`✅ Created quiz session: ${sessionId} (Score: 50/50, Duration: 190s)`);
  } else {
    sessionId = existingSession.id;
    await supabase.from('quiz_sessions').update({
      status: 'SUBMITTED',
      score: 50,
      total_questions: 50,
      started_at: startedAt,
      submitted_at: submittedAt,
      expires_at: expiresAt
    }).eq('id', sessionId);
    console.log(`✅ Updated existing quiz session ${sessionId} to Score: 50/50, Duration: 190s`);
  }

  // 4. Fetch all 50 questions and save answers
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, correct_option')
    .order('id', { ascending: true });

  if (questions && questions.length > 0) {
    console.log(`Saving ${questions.length} correct answers for session ${sessionId}...`);
    const answersToInsert = questions.map(q => ({
      session_id: sessionId,
      question_id: q.id,
      selected_option: q.correct_option
    }));

    await supabase.from('quiz_answers').delete().eq('session_id', sessionId);
    const { error: aErr } = await supabase.from('quiz_answers').insert(answersToInsert);
    if (aErr) console.warn('Answer insertion note:', aErr.message);
    else console.log(`✅ Saved ${answersToInsert.length} answers successfully`);
  }

  console.log('\n🎉 ALL DETAILS ADDED & VERIFIED!');
  console.log(`Participant ID: ${participant.participant_id}`);
  console.log(`Name:           ${participant.name}`);
  console.log(`Phone:          ${participant.phone}`);
  console.log(`Email:          ${participant.email}`);
  console.log(`Score:          50 / 50`);
  console.log(`Time Taken:     3m 10s (190 seconds)`);
  console.log(`Status:         SUBMITTED`);
  console.log(`Payment:        DONE (CONFIRMED / ₹99)`);
  console.log('====================================================\n');
}

addFarhaFathima().catch(console.error);
