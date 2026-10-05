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
  const targetPublicId = 'TKFK26-192628';
  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', targetPublicId).single();
  console.log('Participant:', p.name, p.participant_id, p.id);

  // Check system_config allowed_quiz_retries
  const { data: cfg } = await supabase.from('system_config').select('*').eq('key', 'allowed_quiz_retries').maybeSingle();
  let allowedIds = (cfg?.value?.allowedIds) || [];
  if (!allowedIds.includes(p.id)) allowedIds.push(p.id);
  if (!allowedIds.includes(p.participant_id)) allowedIds.push(p.participant_id);

  await supabase.from('system_config').upsert({
    key: 'allowed_quiz_retries',
    value: { allowedIds }
  }, { onConflict: 'key' });

  console.log('✅ Added to allowed_quiz_retries in system_config:', allowedIds);
}

main().catch(console.error);
