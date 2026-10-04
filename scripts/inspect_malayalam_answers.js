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

const questionsTs = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'questions.ts'), 'utf8');
function extractArray(content, varName) {
  const match = content.match(new RegExp(`export const ${varName}: Question\\[\\] = ([\\s\\S]*?);\\n\\n`));
  if (match) return JSON.parse(match[1]);
  return [];
}
const PREVIOUS_ORIGINAL_50_QUESTIONS = extractArray(questionsTs, 'PREVIOUS_ORIGINAL_50_QUESTIONS');

const q5Id = '00000000-0000-0000-0000-000000000005';
const q17Id = '00000000-0000-0000-0000-000000000017';
const q20Id = '00000000-0000-0000-0000-000000000020';

async function inspectMalayalamAnswers() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: false });

  const malayalam4pmSessions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z' && (s.status === 'SUBMITTED' || s.status === 'EXPIRED'));

  for (const s of malayalam4pmSessions) {
    const p = participants.find(p => p.id === s.participant_id);
    const { data: ans } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
    console.log(`\nParticipant: ${p?.name} (${p?.participant_id}) | Score in Session: ${s.score} | Total Answers in DB: ${ans?.length || 0}`);
    if (ans && ans.length > 0) {
      const q5 = ans.find(a => a.question_id === q5Id);
      const q17 = ans.find(a => a.question_id === q17Id);
      const q20 = ans.find(a => a.question_id === q20Id);
      console.log(`   Q5: ${q5 ? q5.selected_option : 'MISSING'} | Q17: ${q17 ? q17.selected_option : 'MISSING'} | Q20: ${q20 ? q20.selected_option : 'MISSING'}`);
    }
  }
}

inspectMalayalamAnswers().catch(console.error);
