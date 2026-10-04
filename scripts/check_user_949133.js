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

async function checkUser() {
  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', 'TKFK26-949133').maybeSingle();
  
  if (!p) {
    console.log('Participant TKFK26-949133 not found in participants table.');
    return;
  }

  console.log('=== PARTICIPANT DETAILS ===');
  console.log('ID:', p.participant_id);
  console.log('Name:', p.name);
  console.log('Phone:', p.phone);
  console.log('Place:', p.city || p.district || p.state);
  console.log('College:', p.college);

  const { data: reg } = await supabase.from('registrations').select('*').eq('participant_id', p.id).maybeSingle();
  console.log('Payment Status:', reg?.payment_status);

  const { data: sessions } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id).order('created_at', { ascending: false });
  console.log('\nTotal Sessions Found:', sessions ? sessions.length : 0);

  if (!sessions || sessions.length === 0) {
    console.log('No quiz sessions recorded for this participant.');
    return;
  }

  for (const s of sessions) {
    console.log('\n--- SESSION RECORD ---');
    console.log('Session ID:', s.id);
    console.log('Status:', s.status);
    console.log('Score in DB:', s.score);
    console.log('Started At:', s.started_at ? new Date(s.started_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—');
    console.log('Submitted At:', s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—');
    
    if (s.started_at && s.submitted_at) {
      const ms = new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime();
      console.log('Duration:', formatDuration(ms));
    }

    const { data: answers } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
    console.log('Stored Answers Count:', answers ? answers.length : 0);

    if (answers && answers.length > 0) {
      let correct = 0;
      let wrong = 0;
      answers.forEach(a => {
        const qNum = uuidToQNum(a.question_id);
        const expected = OFFICIAL_KEY[qNum];
        if (expected === a.selected_option) {
          correct++;
        } else {
          wrong++;
        }
      });
      console.log('Correct Answers:', correct);
      console.log('Wrong Answers:', wrong);
      console.log('Unanswered:', 50 - answers.length);
      console.log('Audited Score:', correct + ' / 50 (' + ((correct / 50) * 100).toFixed(1) + '%)');
    }
  }
}

checkUser();
