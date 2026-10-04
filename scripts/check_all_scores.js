const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: true });
  const { data: answers } = await supabase.from('quiz_answers').select('*');

  const pMap = {};
  (participants || []).forEach(p => pMap[p.id] = p);

  const counts = {};
  (answers || []).forEach(a => {
    counts[a.session_id] = (counts[a.session_id] || 0) + 1;
  });

  console.log('=== SESSIONS WITH SAVED ANSWERS ===');
  Object.entries(counts).forEach(([sessId, count]) => {
    const sess = (sessions || []).find(s => s.id === sessId);
    const p = pMap[sess?.participant_id] || {};
    console.log(`- ${p.participant_id} (${p.name}): ${count} answers saved, Status: ${sess?.status}, Score: ${sess?.score}`);
  });

  console.log('\n=== ALL 33 SESSIONS DETAIL TABLE ===');
  const rows = (sessions || []).map(s => {
    const p = pMap[s.participant_id] || {};
    return {
      ID: p.participant_id || 'Unknown',
      Name: p.name || 'Unknown',
      Status: s.status,
      AnswersSaved: counts[s.id] || 0,
      Score: s.score,
      StartedAt: s.started_at ? new Date(s.started_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
      SubmittedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : (s.status === 'IN_PROGRESS' ? 'In Progress' : '')
    };
  });

  console.table(rows);
}

check();
