const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const AFFECTED_32_PUBLIC_IDS = [
  'TKFK26-835601',
  'TKFK26-649383',
  'TKFK26-225133',
  'TKFK26-514226',
  'TKFK26-884644',
  'TKFK26-102315',
  'TKFK26-192628',
  'TKFK26-296559',
  'TKFK26-106511',
  'TKFK26-772260',
  'TKFK26-707431',
  'TKFK26-746740',
  'TKFK26-345185',
  'TKFK26-544046',
  'TKFK26-336147',
  'TKFK26-539061',
  'TKFK26-476039',
  'TKFK26-918545',
  'TKFK26-510149',
  'TKFK26-516234',
  'TKFK26-810934',
  'TKFK26-536605',
  'TKFK26-589280',
  'TKFK26-180939',
  'TKFK26-878266',
  'TKFK26-343409',
  'TKFK26-680020',
  'TKFK26-998840',
  'TKFK26-371033',
  'TKFK26-715335',
  'TKFK26-729150',
  'TKFK26-470330'
];

async function run() {
  console.log('=== PREPARING RE-CONDUCT FOR 32 AFFECTED PARTICIPANTS ===');
  console.log(`Checking ${AFFECTED_32_PUBLIC_IDS.length} affected public IDs...`);

  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('id, participant_id, name, phone, email, status')
    .in('participant_id', AFFECTED_32_PUBLIC_IDS);

  if (pErr) throw pErr;
  console.log(`Found ${participants.length} matching participants in database.`);

  const participantUuids = participants.map(p => p.id);

  // Fetch their current sessions
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('*')
    .in('participant_id', participantUuids);

  if (sErr) throw sErr;
  console.log(`Found ${sessions.length} existing sessions for these 32 participants.`);

  const sessionIds = sessions.map(s => s.id);

  // Fetch any answers attached to these sessions
  let answers = [];
  if (sessionIds.length > 0) {
    const { data: aData } = await supabase
      .from('quiz_answers')
      .select('*')
      .in('session_id', sessionIds);
    answers = aData || [];
  }
  console.log(`Found ${answers.length} saved answers attached to these sessions.`);

  // Backup existing data before resetting
  const backup = {
    timestamp: new Date().toISOString(),
    affectedPublicIds: AFFECTED_32_PUBLIC_IDS,
    participants,
    sessions,
    answers
  };
  fs.writeFileSync(path.join(__dirname, 'reconduct_affected_backup.json'), JSON.stringify(backup, null, 2), 'utf8');
  console.log('✅ Backed up affected session records to scripts/reconduct_affected_backup.json');

  // Verify that NONE of the 17 unaffected participants are in this list
  const { data: allSessions } = await supabase.from('quiz_sessions').select('id, participant_id, score, status');
  const { data: allParticipants } = await supabase.from('participants').select('id, participant_id, name');
  const pMap = new Map(allParticipants.map(p => [p.id, p.participant_id]));

  const unaffectedWithScores = allSessions.filter(s => (s.score || 0) > 0);
  console.log(`\n🛡️ Safety Check: Total participants with valid scores in DB = ${unaffectedWithScores.length}`);
  for (const s of unaffectedWithScores) {
    const pubId = pMap.get(s.participant_id);
    if (AFFECTED_32_PUBLIC_IDS.includes(pubId)) {
      console.error(`⚠️ WARNING: ${pubId} has score ${s.score} and is in affected list!`);
    } else {
      console.log(`   ✓ Protected unaffected participant ${pubId}: Score ${s.score}`);
    }
  }

  // Clean reset for the 32 participants
  if (sessionIds.length > 0) {
    console.log(`\nDeleting stranded quiz_answers for ${sessionIds.length} sessions...`);
    await supabase.from('quiz_answers').delete().in('session_id', sessionIds);

    console.log(`Deleting stranded quiz_session_questions for ${sessionIds.length} sessions...`);
    await supabase.from('quiz_session_questions').delete().in('session_id', sessionIds);

    console.log(`Deleting old quiz_sessions for ${sessionIds.length} sessions...`);
    await supabase.from('quiz_sessions').delete().in('id', sessionIds);
  }

  console.log('\n✅ Successfully cleared old attempt records for the 32 affected participants.');
  console.log('✅ Their participant accounts are ready for a fresh, clean attempt with full 25-min timer!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
