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

function uuidToQNum(uuid) {
  const num = parseInt(uuid.replace(/[^0-9]/g, ''), 10);
  return num >= 1 && num <= 50 ? num : null;
}

function formatDuration(ms) {
  if (ms == null || isNaN(ms) || ms < 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + 'm ' + seconds + 's';
}

async function checkShiblAnswers() {
  const { data: s } = await supabase.from('quiz_sessions').select('*').eq('id', '6a719cfa-7d52-48ca-8e73-41afcd647da6').single();
  const { data: answers } = await supabase.from('quiz_answers').select('*').eq('session_id', '6a719cfa-7d52-48ca-8e73-41afcd647da6');

  console.log('=== SHIBL SESSION STATUS ===');
  console.log('Session ID:', s.id);
  console.log('Status:', s.status);
  console.log('Score in DB:', s.score);
  console.log('Started At:', s.started_at ? new Date(s.started_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—');
  console.log('Submitted At:', s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'In Progress');
  
  if (s.submitted_at && s.started_at) {
    const ms = new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime();
    console.log('Time Taken:', formatDuration(ms));
  }

  console.log('Total Answers Saved in DB:', answers ? answers.length : 0);

  if (answers && answers.length > 0) {
    let correct = 0;
    let wrong = 0;
    answers.forEach(a => {
      const qNum = uuidToQNum(a.question_id);
      if (OFFICIAL_KEY[qNum] === a.selected_option) correct++;
      else wrong++;
    });
    console.log('Correct Answers:', correct);
    console.log('Wrong Answers:', wrong);
    console.log('Score:', correct + ' / 50 (' + ((correct / 50) * 100).toFixed(1) + '%)');
  }
}

checkShiblAnswers();
