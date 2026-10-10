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

const userProvidedList = [
  'TKFK26-068307', 'TKFK26-103378', 'TKFK26-118837', 'TKFK26-130095',
  'TKFK26-150654', 'TKFK26-192534', 'TKFK26-200725', 'TKFK26-259837',
  'TKFK26-304674', 'TKFK26-347585', 'TKFK26-351829', 'TKFK26-382903',
  'TKFK26-402918', 'TKFK26-489201', 'TKFK26-512903', 'TKFK26-619284',
  'TKFK26-728190', 'TKFK26-819203'
];

async function main() {
  const { data: allParticipants } = await supabase.from('participants').select('*');
  const { data: allSessions } = await supabase.from('quiz_sessions').select('*');

  console.log(`Total participants in DB: ${allParticipants.length}`);
  console.log(`Total quiz sessions in DB: ${allSessions.length}`);

  // Let's check which user-provided IDs exist in the database!
  console.log('\n--- CHECKING THE 18 IDS PROVIDED BY USER ---');
  userProvidedList.forEach(id => {
    const p = allParticipants.find(p => p.participant_id === id);
    if (p) {
      const sess = allSessions.filter(s => s.participant_id === p.id);
      console.log(`FOUND in DB: ${id} | Name: ${p.name} | Phone: ${p.phone} | Sessions: ${sess.length}`);
    } else {
      console.log(`NOT IN DB: ${id}`);
    }
  });

  // Now let's list ALL participants in the DB who have 0 sessions or EXPIRED sessions with 0 score!
  console.log('\n--- ALL DB PARTICIPANTS WITH NO ATTEMPTS OR 0 MARKS EXPIRED ---');
  allParticipants.forEach(p => {
    if (p.participant_id === 'TKFK26-ADMIN99') return;
    const sess = allSessions.filter(s => s.participant_id === p.id);
    const hasSubmitted = sess.some(s => s.status === 'SUBMITTED');
    const hasAttempt = sess.length > 0;
    
    if (!hasAttempt) {
      console.log(`[NO SESSION (NEVER ENTERED)]: ${p.participant_id} | ${p.name} | ${p.phone} | Status: ${p.status}`);
    } else if (!hasSubmitted) {
      console.log(`[SESSION EXIST BUT NOT SUBMITTED]: ${p.participant_id} | ${p.name} | ${p.phone} | Status: ${sess[0].status} | Score: ${sess[0].score}`);
    }
  });
}

main().catch(console.error);
