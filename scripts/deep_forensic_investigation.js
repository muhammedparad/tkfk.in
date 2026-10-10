const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

async function main() {
  console.log('========================================================================');
  console.log('🕵️ FULL FORENSIC INVESTIGATION FOR MIKDAD, SWALIH, AND RAFI');
  console.log('========================================================================');

  // 1. Check all audit_logs
  console.log('\n--- 1. AUDIT LOGS SEARCH ---');
  const { data: allAuditLogs, error: aErr } = await supabase.from('audit_logs').select('*');
  if (aErr) {
    console.log('Error reading audit_logs:', aErr.message);
  } else {
    console.log(`Total audit_logs rows: ${allAuditLogs?.length || 0}`);
    const keywords = ['mikdad', 'swalih', 'rafi', '8197151893', '6238781368', '7306382462', 'TKFK26-951610', 'TKFK26-544046', 'TKFK26-680020'];
    allAuditLogs?.forEach(log => {
      const str = JSON.stringify(log).toLowerCase();
      if (keywords.some(k => str.includes(k.toLowerCase()))) {
        console.log(`Matched Audit Log:`, JSON.stringify(log, null, 2));
      }
    });
  }

  // 2. Check all quiz_sessions in DB
  console.log('\n--- 2. ALL QUIZ SESSIONS IN DB ---');
  const { data: allSessions } = await supabase.from('quiz_sessions').select('*');
  console.log(`Total quiz sessions in DB: ${allSessions?.length || 0}`);
  
  const { data: allParticipants } = await supabase.from('participants').select('*');
  const pMap = new Map(allParticipants.map(p => [p.id, p]));

  // Check if any quiz session has a participant_id that is NOT in participants table
  const orphanSessions = allSessions.filter(s => !pMap.has(s.participant_id));
  console.log(`Orphan sessions (participant_id not in participants table): ${orphanSessions.length}`);
  orphanSessions.forEach(s => console.log('Orphan session:', s));

  // 3. Check all quiz_answers in DB
  console.log('\n--- 3. ALL QUIZ ANSWERS IN DB ---');
  const { data: allAnswers } = await supabase.from('quiz_answers').select('session_id, question_id, selected_option, updated_at');
  console.log(`Total quiz_answers in DB: ${allAnswers?.length || 0}`);

  // Group answers by session_id
  const ansBySession = new Map();
  allAnswers?.forEach(a => {
    if (!ansBySession.has(a.session_id)) ansBySession.set(a.session_id, []);
    ansBySession.get(a.session_id).push(a);
  });

  console.log(`Distinct session_ids in quiz_answers: ${ansBySession.size}`);

  // List all sessions and their answer count + participant info
  console.log('\n--- SESSIONS WITH ANSWER COUNTS ---');
  allSessions.forEach(s => {
    const p = pMap.get(s.participant_id);
    const ansCount = ansBySession.get(s.id)?.length || 0;
    console.log(`Session: ${s.id} | Participant: ${p?.name} (${p?.participant_id || s.participant_id}) | Status: ${s.status} | Score: ${s.score} | Answers: ${ansCount} | Started: ${s.started_at} | Submitted: ${s.submitted_at}`);
  });

  // Check if there are answers whose session_id does NOT exist in quiz_sessions
  const sessionIdsSet = new Set(allSessions.map(s => s.id));
  const orphanAnswerSessionIds = Array.from(ansBySession.keys()).filter(sId => !sessionIdsSet.has(sId));
  console.log(`Orphan answer session_ids (answers exist but no session record): ${orphanAnswerSessionIds.length}`);
  orphanAnswerSessionIds.forEach(sId => {
    console.log(`Orphan Session ID: ${sId} with ${ansBySession.get(sId).length} answers`);
  });

  // 4. Check all registrations with phone or email matching
  console.log('\n--- 4. SEARCHING REGISTRATIONS FOR ANY VARIATION ---');
  const { data: allRegs } = await supabase.from('registrations').select('*');
  const regKeywords = ['mikdad', 'swalih', 'rafi', '8197151893', '6238781368', '7306382462'];
  allRegs?.forEach(r => {
    const str = JSON.stringify(r).toLowerCase();
    if (regKeywords.some(k => str.includes(k.toLowerCase()))) {
      console.log(`Matched Registration: ID=${r.id}, Name=${r.name}, Phone=${r.phone}, Email=${r.email}, Status=${r.registration_status}, Pay=${r.payment_status}, Ref=${r.payment_reference}, ParticipantID=${r.participant_id}`);
    }
  });

  // 5. Specifically investigate Muhammed Mikdad's session
  console.log('\n--- 5. INVESTIGATING MUHAMMED MIKDAD SESSION (f0f2a548-af20-42c5-ba58-8653198cc29d) ---');
  const mikdadSessId = 'f0f2a548-af20-42c5-ba58-8653198cc29d';
  const { data: mikdadQuestions } = await supabase.from('quiz_session_questions').select('*').eq('session_id', mikdadSessId);
  console.log(`Mikdad quiz_session_questions count: ${mikdadQuestions?.length || 0}`);
  
  const { data: mikdadAnswers } = await supabase.from('quiz_answers').select('*').eq('session_id', mikdadSessId);
  console.log(`Mikdad quiz_answers count: ${mikdadAnswers?.length || 0}`);

  // 6. Check if there are any other sessions or participants with similar names or phone substrings
  console.log('\n--- 6. SIMILAR PHONES OR EMAILS IN PARTICIPANTS ---');
  allParticipants.forEach(p => {
    if (p.phone?.includes('8197') || p.phone?.includes('62387') || p.phone?.includes('73063') || p.name?.toLowerCase().includes('mikdad') || p.name?.toLowerCase().includes('swalih') || p.name?.toLowerCase().includes('rafi')) {
      const sess = allSessions.filter(s => s.participant_id === p.id);
      console.log(`Matching participant: ${p.name} | ID: ${p.participant_id} | Phone: ${p.phone} | Email: ${p.email} | Sessions: ${sess.length}`);
      sess.forEach(s => {
        console.log(`   -> Session ${s.id} | Status: ${s.status} | Score: ${s.score} | Answers: ${ansBySession.get(s.id)?.length || 0}`);
      });
    }
  });
}

main().catch(console.error);
