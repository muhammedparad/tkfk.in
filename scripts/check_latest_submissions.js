const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

function formatIST(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    return new Date(isoStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  } catch {
    return isoStr;
  }
}

async function checkSubmissions() {
  console.log('========================================================');
  console.log('📊 LIVE DATABASE QUIZ SUBMISSIONS & SESSIONS STATUS');
  console.log(`🕒 Checked at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })} IST`);
  console.log('========================================================\n');

  // Fetch all participants
  const { data: allP } = await supabase.from('participants').select('id, participant_id, name, phone, email');
  const pMap = new Map(allP.map(p => [p.id, p]));

  // Fetch all quiz sessions
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (sErr) throw sErr;

  console.log(`Total quiz sessions in database: ${sessions.length}`);

  // Fetch all quiz answers
  const { data: allAnswers } = await supabase.from('quiz_answers').select('session_id, question_id, selected_option');
  const ansCountMap = new Map();
  allAnswers?.forEach(a => {
    ansCountMap.set(a.session_id, (ansCountMap.get(a.session_id) || 0) + 1);
  });

  const recentCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // last 2 hours
  const recentSessions = sessions.filter(s => s.started_at >= '2026-10-04T13:00:00.000Z');

  console.log(`Sessions started since 6:30 PM IST (Recent / Re-conduct window): ${recentSessions.length}\n`);

  if (recentSessions.length > 0) {
    console.log('--- RECENT / LATEST SESSIONS ---');
    recentSessions.forEach((s, idx) => {
      const p = pMap.get(s.participant_id) || { name: 'Unknown', participant_id: 'N/A', phone: 'N/A' };
      const ansSaved = ansCountMap.get(s.id) || 0;
      console.log(`[${idx + 1}] ID: ${p.participant_id} | Name: ${p.name} | Phone: ${p.phone}`);
      console.log(`    Status: ${s.status} | Score: ${s.score ?? 'N/A'}/50 | Saved Answers: ${ansSaved}/50`);
      console.log(`    Started: ${formatIST(s.started_at)} | Submitted: ${formatIST(s.submitted_at)} | Expires: ${formatIST(s.expires_at)}`);
      console.log(`    Session UUID: ${s.id}\n`);
    });
  }

  // Summary by Status
  const submitted = sessions.filter(s => s.status === 'SUBMITTED');
  const inProgress = sessions.filter(s => s.status === 'IN_PROGRESS');
  const expired = sessions.filter(s => s.status === 'EXPIRED');

  console.log('--- OVERALL SESSION BREAKDOWN ---');
  console.log(`Total SUBMITTED:   ${submitted.length}`);
  console.log(`Total IN_PROGRESS: ${inProgress.length}`);
  console.log(`Total EXPIRED:     ${expired.length}`);
  console.log(`Total Saved Answers across all sessions: ${allAnswers?.length || 0}`);

  console.log('\n--- ALL SUBMITTED / COMPLETED SESSIONS (LATEST FIRST) ---');
  submitted.slice(0, 20).forEach((s, idx) => {
    const p = pMap.get(s.participant_id) || { name: 'Unknown', participant_id: 'N/A' };
    const ansSaved = ansCountMap.get(s.id) || 0;
    console.log(`[${idx + 1}] ${p.participant_id} - ${p.name} | Score: ${s.score}/50 | Answers: ${ansSaved} | Submitted: ${formatIST(s.submitted_at)}`);
  });

  if (inProgress.length > 0) {
    console.log('\n--- CURRENTLY ACTIVE / IN-PROGRESS SESSIONS ---');
    inProgress.forEach((s, idx) => {
      const p = pMap.get(s.participant_id) || { name: 'Unknown', participant_id: 'N/A', phone: 'N/A' };
      const ansSaved = ansCountMap.get(s.id) || 0;
      console.log(`[${idx + 1}] ${p.participant_id} - ${p.name} | Answers: ${ansSaved}/50 | Started: ${formatIST(s.started_at)} | Expires: ${formatIST(s.expires_at)}`);
    });
  }
}

checkSubmissions().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
