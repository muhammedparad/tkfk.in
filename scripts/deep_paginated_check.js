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
      console.error(`Error fetching ${tableName}:`, error);
      break;
    }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break;
    page++;
  }
  return allData;
}

async function main() {
  console.log('Fetching ALL rows with pagination...');
  const allAnswers = await fetchAllRows('quiz_answers');
  const allSessions = await fetchAllRows('quiz_sessions');
  const allParticipants = await fetchAllRows('participants');
  const allRegistrations = await fetchAllRows('registrations');

  console.log(`Total quiz_answers in DB: ${allAnswers.length}`);
  console.log(`Total quiz_sessions in DB: ${allSessions.length}`);
  console.log(`Total participants in DB: ${allParticipants.length}`);
  console.log(`Total registrations in DB: ${allRegistrations.length}`);

  const pMap = new Map(allParticipants.map(p => [p.id, p]));
  const sMap = new Map(allSessions.map(s => [s.id, s]));

  // Check Mikdad, Swalih, Rafi
  const mikdad = allParticipants.find(p => p.participant_id === 'TKFK26-951610' || p.phone === '8197151893');
  const swalih = allParticipants.find(p => p.participant_id === 'TKFK26-544046' || p.phone === '6238781368');
  const rafi = allParticipants.find(p => p.participant_id === 'TKFK26-680020' || p.phone === '7306382462');

  console.log('\n========================================================================');
  console.log('1. MIKDAD (TKFK26-951610):');
  console.log(mikdad);
  if (mikdad) {
    const sList = allSessions.filter(s => s.participant_id === mikdad.id);
    console.log('Sessions for Mikdad:', sList);
    sList.forEach(s => {
      const ans = allAnswers.filter(a => a.session_id === s.id);
      console.log(`  Session ${s.id}: ${ans.length} answers saved.`);
      if (ans.length > 0) {
        console.log('  Answers:', ans);
      }
    });
  }

  console.log('\n========================================================================');
  console.log('2. SWALIH (TKFK26-544046):');
  console.log(swalih);
  if (swalih) {
    const sList = allSessions.filter(s => s.participant_id === swalih.id);
    console.log('Sessions for Swalih:', sList);
    sList.forEach(s => {
      const ans = allAnswers.filter(a => a.session_id === s.id);
      console.log(`  Session ${s.id}: ${ans.length} answers saved.`);
    });
  }

  console.log('\n========================================================================');
  console.log('3. RAFI (TKFK26-680020):');
  console.log(rafi);
  if (rafi) {
    const sList = allSessions.filter(s => s.participant_id === rafi.id);
    console.log('Sessions for Rafi:', sList);
    sList.forEach(s => {
      const ans = allAnswers.filter(a => a.session_id === s.id);
      console.log(`  Session ${s.id}: ${ans.length} answers saved.`);
    });
  }

  // Check if there are ANY answers that do not belong to any session, or belong to unknown sessions
  console.log('\n========================================================================');
  console.log('4. CHECKING ALL ANSWERS AND THEIR SESSION OWNERS:');
  const ansBySession = new Map();
  allAnswers.forEach(a => {
    if (!ansBySession.has(a.session_id)) ansBySession.set(a.session_id, []);
    ansBySession.get(a.session_id).push(a);
  });

  console.log(`Found ${ansBySession.size} unique session_ids in quiz_answers table:`);
  for (const [sessId, ansArr] of ansBySession.entries()) {
    const s = sMap.get(sessId);
    if (!s) {
      console.log(`⚠️ UNKNOWN SESSION ID in quiz_answers: ${sessId} with ${ansArr.length} answers!`);
    } else {
      const p = pMap.get(s.participant_id);
      console.log(`Session ${sessId} | Participant: ${p?.name} (${p?.participant_id || s.participant_id}) | Phone: ${p?.phone} | Answers: ${ansArr.length} | Score: ${s.score}`);
    }
  }

  // Check if any participant has another account with similar name/phone
  console.log('\n========================================================================');
  console.log('5. CHECKING ANY OTHER PARTICIPANT/REGISTRATION WITH NAME/PHONE PARTIAL MATCH:');
  allParticipants.forEach(p => {
    const lower = (p.name || '').toLowerCase();
    if (lower.includes('mikdad') || lower.includes('swalih') || lower.includes('rafi')) {
      const sList = allSessions.filter(s => s.participant_id === p.id);
      console.log(`Participant Match: ${p.name} | ${p.participant_id} | Phone: ${p.phone} | Email: ${p.email} | Sessions: ${sList.length}`);
      sList.forEach(s => {
        const aCount = ansBySession.get(s.id)?.length || 0;
        console.log(`   -> Session ${s.id} | Status: ${s.status} | Score: ${s.score} | Answers: ${aCount} | Started: ${s.started_at}`);
      });
    }
  });
}

main().catch(console.error);
