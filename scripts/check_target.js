const fs = require('fs');
const path = require('path');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const conf = {};
lines.forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k) conf[k.trim()] = v.join('=').trim();
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(conf.NEXT_PUBLIC_SUPABASE_URL, conf.SUPABASE_SERVICE_ROLE_KEY || conf.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkParticipant() {
  const targetId = 'TKFK26-614236';
  console.log('Searching for:', targetId);

  // 1. Check participants table
  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .ilike('participant_id', '%614236%');
  
  console.log('Participants query result:', participants, 'Error:', pErr);

  if (!participants || participants.length === 0) {
    const { data: allP } = await supabase.from('participants').select('*');
    const matched = allP.filter(p => JSON.stringify(p).includes('614236'));
    console.log('Any match in all participants:', matched);
    return;
  }

  for (const p of participants) {
    console.log('\n=======================================');
    console.log('PARTICIPANT DETAILS:');
    console.log('UUID:', p.id);
    console.log('Participant ID:', p.participant_id);
    console.log('Name:', p.name);
    console.log('Phone:', p.phone);
    console.log('Email:', p.email);
    console.log('State / City:', p.state, p.city);
    console.log('Status:', p.status);
    console.log('Created At:', p.created_at);

    // 2. Registrations
    const { data: regs } = await supabase.from('registrations').select('*').eq('participant_id', p.id);
    console.log('\nREGISTRATION & PAYMENT:');
    console.log(regs);

    // 3. Quiz Sessions
    const { data: sessions } = await supabase.from('quiz_sessions').select('*').eq('participant_id', p.id);
    console.log('\nQUIZ SESSIONS:');
    console.log(sessions);

    if (sessions && sessions.length > 0) {
      for (const s of sessions) {
        const { data: answers } = await supabase.from('quiz_answers').select('*').eq('session_id', s.id);
        console.log(`\nSESSION ${s.id}:`);
        console.log('Status:', s.status);
        console.log('Score:', s.score);
        console.log('Answers Count:', answers ? answers.length : 0);
        console.log('Started At:', s.started_at);
        console.log('Submitted At:', s.submitted_at);
        if (s.started_at && s.submitted_at) {
          const duration = Math.round((new Date(s.submitted_at) - new Date(s.started_at)) / 1000);
          console.log(`Total Time: ${Math.floor(duration / 60)}m ${duration % 60}s (${duration}s)`);
        }
      }
    }

    // 4. Leaderboard CSV
    const csvPath = 'public/downloads/TKFK_Gandhi_Quiz_2026_Full_Rankings.csv';
    if (fs.existsSync(csvPath)) {
      const csv = fs.readFileSync(csvPath, 'utf8');
      const csvLines = csv.split(/\r?\n/);
      const targetRow = csvLines.find(l => l.includes(p.participant_id) || (p.phone && l.includes(p.phone)));
      console.log('\nLEADERBOARD STANDING:');
      console.log('Header:', csvLines[0]);
      console.log('Row:', targetRow || 'NOT LISTED ON LEADERBOARD');
    }

    // 5. Fairness report CSV
    const fairnessPath = 'public/downloads/TKFK_Malayalam_Fairness_Audit_Report.csv';
    if (fs.existsSync(fairnessPath)) {
      const fCsv = fs.readFileSync(fairnessPath, 'utf8');
      const fLines = fCsv.split(/\r?\n/);
      const fRow = fLines.find(l => l.includes(p.participant_id) || (p.phone && l.includes(p.phone)));
      console.log('\nFAIRNESS AUDIT REPORT:');
      console.log('Row:', fRow || 'NOT IN FAIRNESS REPORT');
    }
  }
}
checkParticipant();
