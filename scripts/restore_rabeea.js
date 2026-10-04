const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function restoreRabeea() {
  const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'reconduct_affected_backup.json'), 'utf8'));
  const rabeea = backup.participants.find(p => p.participant_id === 'TKFK26-180939');
  console.log('Restoring Ayshath Rabeea:', rabeea);

  const { data, error } = await supabase
    .from('participants')
    .upsert({
      id: rabeea.id,
      participant_id: rabeea.participant_id,
      name: rabeea.name,
      phone: rabeea.phone,
      normalized_phone: rabeea.phone,
      email: rabeea.email,
      state: 'Kerala',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error restoring:', error);
  } else {
    console.log('✅ Successfully restored Ayshath Rabeea:', data);
  }
}

restoreRabeea();
