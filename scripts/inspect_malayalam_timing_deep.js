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

const q5Id = '00000000-0000-0000-0000-000000000005';
const q17Id = '00000000-0000-0000-0000-000000000017';
const q20Id = '00000000-0000-0000-0000-000000000020';

async function main() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: false });

  // Filter 4:00 PM Malayalam sessions (started_at < 2026-10-04T13:00:00.000Z)
  const malayalamSessions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z' && (s.status === 'SUBMITTED' || s.status === 'EXPIRED'));

  console.log(`Found ${malayalamSessions.length} Malayalam sessions.`);

  for (const s of malayalamSessions) {
    const p = participants.find(p => p.id === s.participant_id);
    if (!p || p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in')) continue;

    console.log(`\n========================================================================`);
    console.log(`Participant: ${p.name} (${p.participant_id})`);
    console.log(`Session: ${s.id} | Started: ${s.started_at} | Submitted: ${s.submitted_at}`);

    // Fetch quiz_session_questions to see assigned order
    const { data: sessionQuestions } = await supabase
      .from('quiz_session_questions')
      .select('*')
      .eq('session_id', s.id)
      .order('question_order', { ascending: true });

    // Fetch all answers with timestamps
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('session_id', s.id)
      .order('updated_at', { ascending: true });

    console.log(`Session questions count: ${sessionQuestions?.length || 0}`);
    console.log(`Answers count: ${answers?.length || 0}`);

    // Find Q5, Q17, Q20 in answers and sequence
    const q5Ans = answers?.find(a => a.question_id === q5Id);
    const q17Ans = answers?.find(a => a.question_id === q17Id);
    const q20Ans = answers?.find(a => a.question_id === q20Id);

    console.log(`Q5 Answer:`, q5Ans ? { opt: q5Ans.selected_option, updated_at: q5Ans.updated_at } : 'NOT FOUND');
    console.log(`Q17 Answer:`, q17Ans ? { opt: q17Ans.selected_option, updated_at: q17Ans.updated_at } : 'NOT FOUND');
    console.log(`Q20 Answer:`, q20Ans ? { opt: q20Ans.selected_option, updated_at: q20Ans.updated_at } : 'NOT FOUND');

    // Print all answers in chronological order with delta time
    let prevTime = new Date(s.started_at).getTime();
    console.log(`--- Chronological Answer Sequence ---`);
    answers?.forEach((a, idx) => {
      const currTime = new Date(a.updated_at).getTime();
      const deltaSec = (currTime - prevTime) / 1000;
      const isTarget = a.question_id === q5Id ? ' *** Q5 ***' : (a.question_id === q17Id ? ' *** Q17 ***' : (a.question_id === q20Id ? ' *** Q20 ***' : ''));
      console.log(`  #${idx + 1} Q: ${a.question_id.slice(-4)} | Option: ${a.selected_option} | At: ${a.updated_at.slice(11, 23)} | Delta from prev: ${deltaSec.toFixed(2)}s${isTarget}`);
      prevTime = currTime;
    });
  }
}

main().catch(console.error);
