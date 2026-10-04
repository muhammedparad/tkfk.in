const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const AFFECTED_32_PUBLIC_IDS = [
  'TKFK26-835601', 'TKFK26-649383', 'TKFK26-225133', 'TKFK26-514226',
  'TKFK26-884644', 'TKFK26-102315', 'TKFK26-192628', 'TKFK26-296559',
  'TKFK26-106511', 'TKFK26-772260', 'TKFK26-707431', 'TKFK26-746740',
  'TKFK26-345185', 'TKFK26-544046', 'TKFK26-336147', 'TKFK26-539061',
  'TKFK26-476039', 'TKFK26-918545', 'TKFK26-510149', 'TKFK26-516234',
  'TKFK26-810934', 'TKFK26-536605', 'TKFK26-589280', 'TKFK26-180939',
  'TKFK26-878266', 'TKFK26-343409', 'TKFK26-680020', 'TKFK26-998840',
  'TKFK26-371033', 'TKFK26-715335', 'TKFK26-729150', 'TKFK26-470330'
];

async function checkIds() {
  const { data: participants } = await supabase.from('participants').select('id, participant_id, name, phone');
  const existingMap = new Map(participants.map(p => [p.participant_id, p]));
  
  for (const id of AFFECTED_32_PUBLIC_IDS) {
    if (existingMap.has(id)) {
      console.log(`Found: ${id} -> ${existingMap.get(id).name}`);
    } else {
      console.log(`❌ NOT FOUND: ${id}`);
    }
  }
}
checkIds();
