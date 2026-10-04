const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const AFFECTED_IDS = [
  'TKFK26-835601', 'TKFK26-649383', 'TKFK26-225133', 'TKFK26-514226',
  'TKFK26-884644', 'TKFK26-102315', 'TKFK26-192628', 'TKFK26-296559',
  'TKFK26-106511', 'TKFK26-772260', 'TKFK26-345185', 'TKFK26-544046',
  'TKFK26-336147', 'TKFK26-476039', 'TKFK26-918545', 'TKFK26-510149',
  'TKFK26-516234', 'TKFK26-810934', 'TKFK26-536605', 'TKFK26-589280',
  'TKFK26-180939', 'TKFK26-878266', 'TKFK26-343409', 'TKFK26-680020',
  'TKFK26-998840', 'TKFK26-371033', 'TKFK26-715335', 'TKFK26-470330',
  'TKFK26-707431', 'TKFK26-746740', 'TKFK26-539061', 'TKFK26-729150'
];

async function deepScan() {
  console.log('=== STEP 1: SCANNING ALL PUBLIC TABLES & COLUMNS ===');

  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*');
  const { data: registrations } = await supabase.from('registrations').select('*');
  const { data: auditLogs } = await supabase.from('audit_logs').select('*');
  const { data: txns } = await supabase.from('payment_transactions').select('*');
  const { data: answers } = await supabase.from('quiz_answers').select('*');

  const affectedParticipants = participants.filter(p => AFFECTED_IDS.includes(p.participant_id));
  const affectedInternalUuids = affectedParticipants.map(p => p.id);
  const affectedSessionRecords = sessions.filter(s => affectedInternalUuids.includes(s.participant_id));
  const affectedSessionIds = affectedSessionRecords.map(s => s.id);

  console.log(`Found ${affectedParticipants.length} matching participants out of ${AFFECTED_IDS.length} requested.`);
  console.log(`Found ${affectedSessionRecords.length} matching quiz session records.\n`);

  console.log('=== STEP 2: SEARCHING FOR ANY ANSWER DATA IN QUIZ_SESSIONS ===');
  affectedSessionRecords.forEach(s => {
    const rawKeys = Object.keys(s);
    // Check if there are any non-standard keys or hidden json
    rawKeys.forEach(k => {
      const val = s[k];
      if (typeof val === 'object' && val !== null) {
        console.log(`Session ${s.id} has object in column '${k}':`, val);
      }
    });
  });

  console.log('\n=== STEP 3: SEARCHING AUDIT LOGS FOR AFFECTED SESSIONS / PARTICIPANTS ===');
  const relatedAuditLogs = auditLogs.filter(l => 
    affectedInternalUuids.includes(l.entity_id) ||
    affectedSessionIds.includes(l.entity_id) ||
    (l.metadata && (
      affectedSessionIds.some(sid => JSON.stringify(l.metadata).includes(sid)) ||
      AFFECTED_IDS.some(pid => JSON.stringify(l.metadata).includes(pid))
    ))
  );
  console.log(`Found ${relatedAuditLogs.length} audit logs related to affected participants/sessions.`);
  relatedAuditLogs.forEach(l => {
    console.log(`- Action: ${l.action}, Entity: ${l.entity_type} (${l.entity_id}), Metadata:`, l.metadata);
  });

  console.log('\n=== STEP 4: CHECKING QUIZ_ANSWERS FOR AFFECTED SESSION IDS ===');
  const matchingAnswers = answers.filter(a => affectedSessionIds.includes(a.session_id));
  console.log(`Total answers in quiz_answers table for these 32 sessions: ${matchingAnswers.length}`);

  console.log('\n=== STEP 5: SEARCHING FOR UNLINKED / ORPHANED ANSWERS ===');
  const unlinkedAnswers = answers.filter(a => !sessions.some(s => s.id === a.session_id));
  console.log(`Total orphaned answers in quiz_answers table: ${unlinkedAnswers.length}`);
  if (unlinkedAnswers.length > 0) {
    console.log('Sample orphaned answer:', unlinkedAnswers[0]);
  }
}

deepScan();
