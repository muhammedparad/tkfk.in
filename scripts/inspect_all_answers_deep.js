const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function checkAnswers() {
  const { data: answers } = await supabase.from('quiz_answers').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*');
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: auditLogs } = await supabase.from('audit_logs').select('*');

  const pMap = {};
  (participants || []).forEach(p => pMap[p.id] = p);

  const sMap = {};
  (sessions || []).forEach(s => sMap[s.id] = s);

  const sessCounts = {};
  (answers || []).forEach(a => {
    sessCounts[a.session_id] = (sessCounts[a.session_id] || 0) + 1;
  });

  console.log('Total answers in quiz_answers table:', answers ? answers.length : 0);
  console.log('\n--- SESSIONS WITH SAVED ANSWERS ---');
  Object.entries(sessCounts).forEach(([sessId, count]) => {
    const s = sMap[sessId];
    const p = pMap[s?.participant_id] || {};
    console.log(`Session: ${sessId} | Count: ${count} | User: ${p.participant_id} (${p.name}) | Status: ${s?.status}`);
  });

  console.log('\n--- AUDIT LOGS ACTION TYPES ---');
  const actionCounts = {};
  (auditLogs || []).forEach(l => {
    actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
  });
  console.log(actionCounts);

  // Check if any audit logs contain quiz answers or question submissions
  const answerRelatedLogs = (auditLogs || []).filter(l => 
    (l.action && (l.action.includes('ANSWER') || l.action.includes('QUIZ') || l.action.includes('SUBMIT'))) ||
    (l.metadata && JSON.stringify(l.metadata).includes('selectedOption'))
  );
  console.log('Answer related audit logs count:', answerRelatedLogs.length);
  if (answerRelatedLogs.length > 0) {
    console.log('Sample answer related log:', JSON.stringify(answerRelatedLogs[0], null, 2));
  }
}

checkAnswers();
