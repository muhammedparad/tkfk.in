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

async function checkUser() {
  console.log('=== PARTICIPANT STATS FOR TKFK26-343409 ===\n');

  // 1. Participant Record
  const { data: p, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', 'TKFK26-343409')
    .maybeSingle();

  if (pErr) throw pErr;
  if (!p) {
    console.error('Participant not found!');
    return;
  }

  console.log(`Name:           ${p.name}`);
  console.log(`Participant ID: ${p.participant_id}`);
  console.log(`Phone:          ${p.phone}`);
  console.log(`Email:          ${p.email}`);
  console.log(`State/City:     ${p.state || 'N/A'} / ${p.city || 'N/A'}`);
  console.log(`Status:         ${p.status}`);
  console.log(`UUID:           ${p.id}`);

  // 2. Registration / Payment Record
  const { data: reg } = await supabase
    .from('registrations')
    .select('*')
    .eq('participant_id', p.id)
    .maybeSingle();

  console.log(`\nRegistration:   ${reg?.registration_status || 'N/A'} (Payment: ${reg?.payment_status || 'N/A'}, Amount: ₹${reg?.amount || 99})`);

  // 3. Quiz Sessions
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id)
    .order('started_at', { ascending: false });

  if (sErr) throw sErr;
  console.log(`\nTotal Sessions Found: ${sessions ? sessions.length : 0}`);

  if (sessions && sessions.length > 0) {
    for (const [idx, s] of sessions.entries()) {
      console.log(`\n--- Session #${idx + 1} (UUID: ${s.id}) ---`);
      console.log(`Status:       ${s.status}`);
      console.log(`Score:        ${s.score !== null ? `${s.score} / 50` : 'Not Finalized'}`);
      console.log(`Started At:   ${formatIST(s.started_at)}`);
      console.log(`Expires At:   ${formatIST(s.expires_at)}`);
      console.log(`Submitted At: ${formatIST(s.submitted_at)}`);

      // 4. Saved Answers
      const { data: answers } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('session_id', s.id)
        .order('question_id', { ascending: true });

      console.log(`Saved Answers Count: ${answers ? answers.length : 0} / 50`);

      if (answers && answers.length > 0) {
        // Fetch questions to match
        const { data: questions } = await supabase.from('questions').select('*').order('id', { ascending: true });
        const qMap = new Map(questions.map(q => [q.id, q]));

        console.log('\nAnswer Breakdown:');
        answers.forEach((a, aIdx) => {
          const q = qMap.get(a.question_id);
          const qText = q ? q.question_text.slice(0, 40) : 'Unknown Question';
          const isCorrect = q ? (q.correct_option === a.selected_option ? '✓ Correct' : `✗ Wrong (Key: ${q.correct_option})`) : '';
          console.log(`  [${aIdx + 1}] Q-ID: ${a.question_id.slice(-4)} | Selected: ${a.selected_option} | ${isCorrect} | "${qText}..."`);
        });
      }
    }
  }
}

checkUser().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
