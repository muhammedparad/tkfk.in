const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function checkScores() {
  const { data: sessions } = await supabase.from('quiz_sessions').select('*');
  const { data: participants } = await supabase.from('participants').select('*');
  const pMap = {};
  participants.forEach(p => pMap[p.id] = p);

  sessions.forEach(s => {
    const p = pMap[s.participant_id] || {};
    if (s.score > 0 || ['TKFK26-227888', 'TKFK26-712457', 'TKFK26-940388', 'TKFK26-614236'].includes(p.participant_id)) {
      console.log(`${p.participant_id} | ${p.name} | Status: ${s.status} | DB Score: ${s.score}`);
    }
  });
}

checkScores();
