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
  const targetId = 'TKFK26-649383';
  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', targetId).maybeSingle();
  console.log('Participant Record:', p);

  if (p) {
    const { data: reg } = await supabase.from('registrations').select('*').eq('participant_id', p.id);
    console.log('\nRegistration Records:', reg);

    const { data: sessions } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id);
    console.log('\nQuiz Sessions:', sessions);

    if (sessions && sessions.length > 0) {
      for (const s of sessions) {
        const { data: ans } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
        console.log(`\nSession ${s.id} (${s.status}, score: ${s.score}) total answers:`, ans?.length);
      }
    }
  }
}

main().catch(console.error);
