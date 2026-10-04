const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
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

const questionsTs = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'questions.ts'), 'utf8');
function extractArray(content, varName) {
  const match = content.match(new RegExp(`export const ${varName}: Question\\[\\] = ([\\s\\S]*?);\\n\\n`));
  if (match) return JSON.parse(match[1]);
  return [];
}
const PREVIOUS_ORIGINAL_50_QUESTIONS = extractArray(questionsTs, 'PREVIOUS_ORIGINAL_50_QUESTIONS');

// Map of 50 original questions:
// Q5: 00000000-0000-0000-0000-000000000005 (Correct: B)
// Q17: 00000000-0000-0000-0000-000000000017 (Correct: C)
// Q20: 00000000-0000-0000-0000-000000000020 (Correct: B)
const q5Id = '00000000-0000-0000-0000-000000000005';
const q17Id = '00000000-0000-0000-0000-000000000017';
const q20Id = '00000000-0000-0000-0000-000000000020';

const correctKeyMap = new Map();
PREVIOUS_ORIGINAL_50_QUESTIONS.forEach(q => {
  correctKeyMap.set(q.id, q.correct_option);
});

async function auditFirstSession() {
  const { data: participants } = await supabase.from('participants').select('*');
  const pMap = new Map(participants.map(p => [p.id, p]));

  // Get all submitted sessions from 4:00 PM session (started before 6:30 PM)
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('status', 'SUBMITTED')
    .order('started_at', { ascending: true });

  const firstSessionSubmissions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z');
  console.log(`Total 4:00 PM submitted sessions: ${firstSessionSubmissions.length}`);

  // Fetch answers for all these sessions
  for (const s of firstSessionSubmissions) {
    const p = pMap.get(s.participant_id);
    const { data: userAnswers } = await supabase
      .from('quiz_answers')
      .select('question_id, selected_option')
      .eq('session_id', s.id);

    const ansMap = new Map(userAnswers ? userAnswers.map(a => [a.question_id, a.selected_option]) : []);

    const q5Ans = ansMap.get(q5Id);
    const q17Ans = ansMap.get(q17Id);
    const q20Ans = ansMap.get(q20Id);

    const q5Correct = q5Ans === correctKeyMap.get(q5Id);
    const q17Correct = q17Ans === correctKeyMap.get(q17Id);
    const q20Correct = q20Ans === correctKeyMap.get(q20Id);

    console.log(`\nID: ${p?.participant_id} | Name: ${p?.name} | State: ${p?.state} | DB Score: ${s.score}/50`);
    console.log(`  Q5 (${q5Id}): Ans=${q5Ans || 'None'}, CorrectKey=${correctKeyMap.get(q5Id)} -> ${q5Correct ? 'CORRECT' : 'WRONG'}`);
    console.log(`  Q17 (${q17Id}): Ans=${q17Ans || 'None'}, CorrectKey=${correctKeyMap.get(q17Id)} -> ${q17Correct ? 'CORRECT' : 'WRONG'}`);
    console.log(`  Q20 (${q20Id}): Ans=${q20Ans || 'None'}, CorrectKey=${correctKeyMap.get(q20Id)} -> ${q20Correct ? 'CORRECT' : 'WRONG'}`);
    console.log(`  Total Saved Answers: ${userAnswers?.length || 0}`);
  }
}

auditFirstSession().catch(console.error);
