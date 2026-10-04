const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function listAll() {
  const { data: participants } = await supabase.from('participants').select('id, participant_id, name, phone, email').order('created_at');
  console.log(`Total participants: ${participants.length}`);
  participants.forEach(p => {
    console.log(`${p.participant_id} | ${p.name} | ${p.phone} | ${p.email}`);
  });
}
listAll();
