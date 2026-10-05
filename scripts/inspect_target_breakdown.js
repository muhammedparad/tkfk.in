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
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return [];
    }
  }
  return [];
}

// Extract CURRENT_RECONDUCT_50_QUESTIONS
const CURRENT_RECONDUCT_50_QUESTIONS = extractArray(questionsTs, 'CURRENT_RECONDUCT_50_QUESTIONS');

async function main() {
  const targetId = 'TKFK26-192628';
  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', targetId).single();
  const { data: s } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id).single();
  const { data: answers } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);

  const ansMap = new Map(answers.map(a => [a.question_id, a.selected_option]));

  console.log('\n====================================================================================================');
  console.log(`📋 QUESTION-BY-QUESTION AUDIT FOR ${p.name} (${p.participant_id}) — SCORE: ${s.score} / 50 (88.00%)`);
  console.log(`⏱️ Time Taken: 6m 55s (415s) | Submitted: ${new Date(s.submitted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('====================================================================================================\n');

  const rows = CURRENT_RECONDUCT_50_QUESTIONS.map((q, idx) => {
    const selected = ansMap.get(q.id) || 'Unanswered';
    const isCorrect = selected === q.correct_option;
    const selectedText = selected !== 'Unanswered' ? q[`option_${selected.toLowerCase()}`] : 'N/A';
    const correctText = q[`option_${q.correct_option.toLowerCase()}`];

    return {
      Q: idx + 1,
      Question: q.question_text.length > 45 ? q.question_text.substring(0, 42) + '...' : q.question_text,
      Selected: `${selected}) ${selectedText ? selectedText.substring(0, 22) : ''}`,
      Correct: `${q.correct_option}) ${correctText ? correctText.substring(0, 22) : ''}`,
      Status: isCorrect ? '✅ Correct' : '❌ Wrong'
    };
  });

  console.table(rows);

  const wrongQuestions = rows.filter(r => r.Status.includes('Wrong'));
  console.log(`\n❌ Incorrect Questions (${wrongQuestions.length} out of 50):`);
  wrongQuestions.forEach(wq => {
    console.log(`   • Q${wq.Q}: "${wq.Question}" -> Selected: ${wq.Selected} | Correct: ${wq.Correct}`);
  });
}

main().catch(console.error);
