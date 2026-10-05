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

async function main() {
  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error fetching sessions:', error);
    return;
  }
  console.log('--- LATEST 10 QUIZ SESSIONS ---');
  for (const s of sessions || []) {
    const { data: p } = await supabase.from('participants').select('name, participant_id, phone').eq('id', s.participant_id).single();
    console.log(`Participant: ${p?.name} (${p?.participant_id}) | Status: ${s.status} | Score: ${s.score} | Started: ${s.started_at} | Submitted: ${s.submitted_at}`);
  }

  const { data: cfgs } = await supabase.from('system_config').select('*');
  console.log('\n--- SYSTEM CONFIG ---');
  console.log(JSON.stringify(cfgs, null, 2));
}

main().catch(console.error);
