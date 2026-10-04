const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const OFFICIAL_KEY = {
  1: 'B', 2: 'B', 3: 'D', 4: 'B', 5: 'C', 6: 'A', 7: 'D', 8: 'A', 9: 'A', 10: 'B',
  11: 'A', 12: 'D', 13: 'B', 14: 'A', 15: 'C', 16: 'D', 17: 'A', 18: 'A', 19: 'B', 20: 'C',
  21: 'D', 22: 'A', 23: 'D', 24: 'A', 25: 'B', 26: 'C', 27: 'B', 28: 'D', 29: 'C', 30: 'A',
  31: 'D', 32: 'A', 33: 'A', 34: 'C', 35: 'B', 36: 'D', 37: 'C', 38: 'B', 39: 'D', 40: 'B',
  41: 'C', 42: 'A', 43: 'D', 44: 'A', 45: 'B', 46: 'C', 47: 'C', 48: 'D', 49: 'C', 50: 'C'
};

async function verifyAnswerKey() {
  const { data: dbQuestions } = await supabase.from('questions').select('*');
  console.log('Total questions in DB:', dbQuestions.length);

  let mismatches = 0;
  for (let i = 1; i <= 50; i++) {
    const uuid = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
    const q = dbQuestions.find(x => x.id === uuid);
    const expected = OFFICIAL_KEY[i];
    if (!q) {
      console.log(`Q${i} (${uuid}) NOT FOUND in DB!`);
      mismatches++;
    } else if (q.correct_option !== expected) {
      console.log(`Q${i} MISMATCH: DB has '${q.correct_option}', User key has '${expected}'`);
      mismatches++;
    }
  }

  if (mismatches === 0) {
    console.log('PERFECT! 100% match between Supabase questions table and Official Answer Key!');
  } else {
    console.log(`Found ${mismatches} mismatches.`);
  }
}

verifyAnswerKey();
