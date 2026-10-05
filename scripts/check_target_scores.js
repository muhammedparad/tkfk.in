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

async function checkScores() {
  const targetId = 'TKFK26-192628';
  const { data: p } = await supabase.from('participants').select('*').eq('participant_id', targetId).single();
  if (!p) {
    console.log('Participant not found');
    return;
  }

  console.log(`\n======================================================`);
  console.log(`👤 PARTICIPANT: ${p.name} (${p.participant_id})`);
  console.log(`📧 Email: ${p.email} | 📞 Phone: ${p.phone}`);
  console.log(`🏛️ College/Institute: ${p.college || 'N/A'}`);
  console.log(`======================================================\n`);

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('participant_id', p.id)
    .order('started_at', { ascending: false });

  if (!sessions || sessions.length === 0) {
    console.log('ℹ️ Status: NO QUIZ SESSIONS FOUND');
    console.log('Participant has not started the quiz yet.');
    return;
  }

  console.log(`Found ${sessions.length} session(s):\n`);

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    console.log(`--- Session #${i + 1} (ID: ${s.id}) ---`);
    console.log(`Status: ${s.status}`);
    console.log(`Recorded Score: ${s.score !== null ? s.score : 'Pending'} / ${s.total_questions || 50}`);
    console.log(`Started At: ${s.started_at ? new Date(s.started_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}`);
    console.log(`Submitted At: ${s.submitted_at ? new Date(s.submitted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}`);
    console.log(`Expires At: ${s.expires_at ? new Date(s.expires_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}`);

    if (s.started_at && s.submitted_at) {
      const sec = Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000);
      const mins = Math.floor(sec / 60);
      const remSec = sec % 60;
      console.log(`⏱️ Duration / Time Taken: ${mins}m ${remSec}s (${sec}s)`);
    } else if (s.started_at && s.status === 'IN_PROGRESS') {
      const elapsedSec = Math.round((Date.now() - new Date(s.started_at).getTime()) / 1000);
      const remTimeSec = Math.max(0, Math.round((new Date(s.expires_at).getTime() - Date.now()) / 1000));
      console.log(`⏱️ In Progress: Elapsed ${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s | Time Left: ${Math.floor(remTimeSec / 60)}m ${remTimeSec % 60}s`);
    }

    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('session_id', s.id);

    console.log(`📝 Total Answers Saved in DB: ${answers ? answers.length : 0}`);

    // If session questions exist in quiz_session_questions
    const { data: sessionQs } = await supabase
      .from('quiz_session_questions')
      .select('*')
      .eq('session_id', s.id)
      .order('question_order', { ascending: true });

    if (sessionQs && sessionQs.length > 0 && answers && answers.length > 0) {
      const ansMap = new Map(answers.map(a => [a.question_id, a.selected_option]));
      let correct = 0;
      let wrong = 0;
      const breakdown = sessionQs.map(q => {
        const selected = ansMap.get(q.question_id) || 'Unanswered';
        const isCorrect = selected === q.correct_option;
        if (isCorrect) correct++;
        else if (selected !== 'Unanswered') wrong++;
        return {
          Q: q.question_order,
          Text: (q.question_text || '').substring(0, 40) + '...',
          Selected: selected,
          Correct: q.correct_option,
          Result: selected === 'Unanswered' ? '⚪ Skipped' : isCorrect ? '✅ Correct' : '❌ Wrong'
        };
      });

      console.log(`Detailed Breakdown: Correct = ${correct}, Wrong = ${wrong}, Skipped = ${sessionQs.length - correct - wrong}`);
      console.table(breakdown);
    }
  }
}

checkScores().catch(console.error);
