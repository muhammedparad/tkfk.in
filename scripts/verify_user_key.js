const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const userKeyStr = `
1-A, 2-A, 3-B, 4-C, 5-B, 6-A, 7-C, 8-B, 9-C, 10-B
11-B, 12-B, 13-C, 14-C, 15-B, 16-B, 17-B, 18-C, 19-B, 20-B
21-B, 22-C, 23-C, 24-A, 25-B, 26-B, 27-B, 28-A, 29-C, 30-B
31-B, 32-A, 33-B, 34-C, 35-B, 36-C, 37-C, 38-B, 39-B, 40-B
41-A, 42-B, 43-C, 44-B, 45-B, 46-B, 47-B, 48-A, 49-A, 50-C
`;

const userKeyPairs = userKeyStr.trim().split(/[\s,]+/).filter(Boolean);
const userKeyMap = {};
userKeyPairs.forEach(p => {
  const [num, opt] = p.split('-');
  if (num && opt) {
    userKeyMap[parseInt(num, 10)] = opt.toUpperCase();
  }
});

console.log('Parsed User Answer Key Count:', Object.keys(userKeyMap).length);

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function verifyKeys() {
  const { data: questions } = await supabase.from('questions').select('*').order('id', { ascending: true });
  console.log('Database Questions Count:', questions.length);

  let mismatches = 0;
  for (let i = 1; i <= 50; i++) {
    const q = questions[i - 1];
    const expected = userKeyMap[i];
    const actual = q ? q.correct_option : null;
    const match = expected === actual;
    if (!match) {
      console.error(`❌ Mismatch at Q${i}: User Key = ${expected}, Database = ${actual}`);
      mismatches++;
    } else {
      console.log(`✓ Q${i.toString().padStart(2, ' ')}: Key = ${expected} | DB = ${actual} | OK`);
    }
  }

  if (mismatches === 0) {
    console.log('\n🎉 100% PERFECT MATCH! All 50 questions in Database and Codebase match the provided answer key exactly.');
  } else {
    console.error(`\n❌ Found ${mismatches} mismatches!`);
  }
}

verifyKeys();
