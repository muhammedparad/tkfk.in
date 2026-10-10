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
  const target = 'TKFK26-878266';
  console.log(`========================================================================`);
  console.log(`🔍 INVESTIGATING: ${target}`);
  console.log(`========================================================================`);

  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', target).maybeSingle();
  console.log('Participant row:', p);

  if (p) {
    const { data: regs } = await supabase.from('registrations').select('*').or(`participant_id.eq.${p.id},phone.eq.${p.phone}`);
    console.log('Registrations:', regs);

    const { data: sessions } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id);
    console.log('Quiz Sessions:', sessions);

    if (sessions && sessions.length > 0) {
      for (const s of sessions) {
        const { data: answers } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
        console.log(`Answers for session ${s.id} (${answers?.length || 0}):`, answers);
      }
    }

    // Also check if phone has another participant row
    if (p.phone) {
      const { data: phoneP } = await supabase.from('participants').select('*').eq('phone', p.phone);
      console.log('Other participants with same phone:', phoneP);
      if (phoneP && phoneP.length > 1) {
        for (const op of phoneP) {
          if (op.id !== p.id) {
            const { data: opSess } = await supabase.from('quiz_sessions').select('*').eq('participant_id', op.id);
            console.log(`Sessions for linked account ${op.id} (${op.participant_id}):`, opSess);
          }
        }
      }
    }
  } else {
    console.log('Participant not found by participant_id. Checking phone or registrations...');
  }
}

main().catch(console.error);
