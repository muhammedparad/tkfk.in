const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function search() {
  const { data } = await supabase.from('participants').select('*').ilike('name', '%rabeea%');
  console.log('Found participants matching Rabeea:', data);
  const { data: all } = await supabase.from('participants').select('id, participant_id, name, phone').order('created_at');
  const matched = all.filter(p => p.name.toLowerCase().includes('aysh') || p.name.toLowerCase().includes('rabee'));
  console.log('Matched list:', matched);
}
search();
