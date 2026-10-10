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

async function fetchAllRows(tableName) {
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      // Table might not exist
      return null;
    }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break;
    page++;
  }
  return allData;
}

async function main() {
  const possibleTables = [
    'participants',
    'registrations',
    'quiz_sessions',
    'quiz_answers',
    'quiz_session_questions',
    'certificates',
    'system_config',
    'audit_logs',
    'contact_messages',
    'contact_submissions',
    'proctoring_frames',
    'proctoring_logs',
    'orders',
    'payments',
    'temp_answers',
    'submissions'
  ];

  console.log('--- CHECKING ALL POSSIBLE TABLES IN SUPABASE ---');
  for (const table of possibleTables) {
    const data = await fetchAllRows(table);
    if (data !== null) {
      console.log(`✅ Table '${table}' exists with ${data.length} rows.`);
    } else {
      console.log(`❌ Table '${table}' does not exist.`);
    }
  }

  const allP = await fetchAllRows('participants');
  const allS = await fetchAllRows('quiz_sessions');
  const allR = await fetchAllRows('registrations');
  const allA = await fetchAllRows('quiz_answers');

  console.log('\n--- LIST OF ALL 42 SESSIONS IN DATABASE ---');
  const pMap = new Map(allP.map(p => [p.id, p]));
  allS.forEach((s, idx) => {
    const p = pMap.get(s.participant_id);
    const answers = allA.filter(a => a.session_id === s.id);
    console.log(`#${idx + 1} | Session: ${s.id} | Participant: ${p?.name} (${p?.participant_id || s.participant_id}) | Phone: ${p?.phone} | Status: ${s.status} | Score: ${s.score} | Answers: ${answers.length} | Started: ${s.started_at} | Submitted: ${s.submitted_at}`);
  });

  // Check if any answers have session_id not in allS
  const sIds = new Set(allS.map(s => s.id));
  const unknownA = allA.filter(a => !sIds.has(a.session_id));
  console.log(`\nAnswers with unknown session_id: ${unknownA.length}`);

  // Search everywhere for the phones
  console.log('\n--- SEARCHING FOR 8197151893 (Mikdad) ---');
  console.log('Participants:', allP.filter(p => JSON.stringify(p).includes('8197151893')));
  console.log('Registrations:', allR.filter(r => JSON.stringify(r).includes('8197151893')));

  console.log('\n--- SEARCHING FOR 6238781368 (Swalih) ---');
  console.log('Participants:', allP.filter(p => JSON.stringify(p).includes('6238781368')));
  console.log('Registrations:', allR.filter(r => JSON.stringify(r).includes('6238781368')));

  console.log('\n--- SEARCHING FOR 7306382462 (Rafi) ---');
  console.log('Participants:', allP.filter(p => JSON.stringify(p).includes('7306382462')));
  console.log('Registrations:', allR.filter(r => JSON.stringify(r).includes('7306382462')));

  // Check if any other participant has a phone close to 7306382462 or 6238781368 or 8197151893
  console.log('\n--- SEARCHING FOR NAMES LIKE MIKDAD, SWALIH, RAFI IN ALL REGISTRATIONS ---');
  allR.forEach(r => {
    const s = JSON.stringify(r).toLowerCase();
    if (s.includes('mikdad') || s.includes('swalih') || s.includes('rafi')) {
      console.log('Matched Reg:', r.name, r.phone, r.email, r.payment_status, r.registration_status, r.participant_id);
    }
  });
}

main().catch(console.error);
