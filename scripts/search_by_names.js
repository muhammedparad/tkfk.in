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

const namesToSearch = [
  "Muhammed Faris", "Safwan", "Mohammed Shamil", "Aysha", "Fathimath Zuhra",
  "Salman Faris", "Ameen", "Hisham", "Shammas Ali", "Basil", "Dilshad",
  "Ramees Ali", "Nihal", "Sharafudheen", "Jaseem", "Sahal", "Mubashir", "Najeeb"
];

async function main() {
  const { data: allP } = await supabase.from('participants').select('*');
  const { data: allR } = await supabase.from('registrations').select('*');
  const { data: allS } = await supabase.from('quiz_sessions').select('*');

  console.log('--- SEARCHING BY NAME IN PARTICIPANTS & REGISTRATIONS ---');
  namesToSearch.forEach(name => {
    const matchedP = allP.filter(p => p.name?.toLowerCase().includes(name.toLowerCase()));
    const matchedR = allR.filter(r => r.name?.toLowerCase().includes(name.toLowerCase()));
    
    console.log(`\nQuery: "${name}"`);
    console.log(`  Participants (${matchedP.length}):`, matchedP.map(p => {
      const sess = allS.filter(s => s.participant_id === p.id);
      return `${p.name} | ID: ${p.participant_id} | Phone: ${p.phone} | Status: ${p.status} | Sessions: ${sess.length} (Scores: ${sess.map(s=>s.score).join(',')})`;
    }));
    if (matchedP.length === 0 && matchedR.length > 0) {
      console.log(`  Registrations only (${matchedR.length}):`, matchedR.map(r => `${r.name} | Phone: ${r.phone} | PayStatus: ${r.payment_status}`));
    }
  });
}

main().catch(console.error);
