const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const rawTs = fs.readFileSync('src/data/questions.ts', 'utf8');
const match = rawTs.match(/export const OFFICIAL_50_QUESTIONS: Question\[\] = (\[[\s\S]*?\]);/);
const questions = eval(match[1]);

async function syncDb() {
  console.log(`Syncing ${questions.length} questions to Supabase...`);
  const rows = questions.map(q => ({
    id: q.id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    category: q.category,
    difficulty: q.difficulty || 'MEDIUM',
    explanation: q.explanation || ''
  }));

  const { data, error } = await supabase
    .from('questions')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error syncing questions to database:', error);
  } else {
    console.log(`Successfully synced ${data.length} questions in Supabase database!`);
  }
}

syncDb();
