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
const CURRENT_RECONDUCT_50_QUESTIONS = extractArray(questionsTs, 'CURRENT_RECONDUCT_50_QUESTIONS');

async function run() {
  console.log('--- FINDING THE 3 OUT-OF-MODULE QUESTIONS ---');

  [PREVIOUS_ORIGINAL_50_QUESTIONS, CURRENT_RECONDUCT_50_QUESTIONS].forEach((qList, listIdx) => {
    console.log(`\nQuestion List ${listIdx === 0 ? 'PREVIOUS ORIGINAL (4:00 PM)' : 'CURRENT RECONDUCT (7:00 PM)'}:`);
    qList.forEach((q, idx) => {
      const text = (q.question_text || '') + ' ' + (q.question_text_ml || '') + ' ' + (q.option_a || '') + ' ' + (q.option_b || '') + ' ' + (q.option_c || '') + ' ' + (q.option_d || '');
      if (text.includes('Kallenbach') || text.includes('ജോഹന്നാസ്ബർഗ്') || text.includes('Pitt') || text.includes('കമ്മീഷണർ') || text.includes('മാതൃഭൂമി') || text.includes('Bullock') || text.includes('കാളവണ്ടി')) {
        console.log(`  Order #${idx + 1} | UUID: ${q.id} | Key: ${q.correct_option}`);
        console.log(`    EN: ${q.question_text}`);
        console.log(`    ML: ${q.question_text_ml}`);
      }
    });
  });

  // Now inspect participants and quiz answers
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*');
  const { data: answers } = await supabase.from('quiz_answers').select('*');
  const { data: sessionQuestions } = await supabase.from('quiz_session_questions').select('*');

  console.log(`\nDB Stats: ${participants.length} participants, ${sessions.length} sessions, ${answers.length} answers, ${sessionQuestions.length} frozen session questions.`);
}

run().catch(console.error);
