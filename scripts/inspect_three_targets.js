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

const questionsTs = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'questions.ts'), 'utf8');
function extractArray(content, varName) {
  const match = content.match(new RegExp(`export const ${varName}: Question\\[\\] = ([\\s\\S]*?);\\n\\n`));
  if (match) return JSON.parse(match[1]);
  return [];
}
const PREVIOUS_ORIGINAL_50_QUESTIONS = extractArray(questionsTs, 'PREVIOUS_ORIGINAL_50_QUESTIONS');
const CURRENT_RECONDUCT_50_QUESTIONS = extractArray(questionsTs, 'CURRENT_RECONDUCT_50_QUESTIONS');

const qMap = new Map();
PREVIOUS_ORIGINAL_50_QUESTIONS.forEach(q => qMap.set(q.id, q));
CURRENT_RECONDUCT_50_QUESTIONS.forEach(q => {
  if (!qMap.has(q.id)) qMap.set(q.id, q);
});

const targets = [
  { label: 'TKFK26-951610', isId: true },
  { label: 'TKFK26-544046', isId: true },
  { label: '7306382462', isId: false }
];

async function main() {
  for (const t of targets) {
    console.log(`\n========================================================================================`);
    console.log(`🔍 TARGET: ${t.label}`);
    console.log(`========================================================================================`);

    let pQuery = supabase.from('participants').select('*');
    if (t.isId) {
      pQuery = pQuery.eq('participant_id', t.label);
    } else {
      pQuery = pQuery.or(`phone.eq.${t.label},normalized_phone.eq.${t.label}`);
    }

    const { data: participants, error: pErr } = await pQuery;

    if (pErr) console.error('Participant query error:', pErr);

    if (!participants || participants.length === 0) {
      console.log(`❌ No participant found with ${t.label}. Searching registrations...`);
      const { data: regs } = await supabase.from('registrations').select('*').or(`phone.eq.${t.label},participant_id.eq.${t.label}`);
      console.log('Registrations:', regs);
      continue;
    }

    for (const p of participants) {
      console.log(`\n👤 Participant Profile:`);
      console.log(`  - Name: ${p.name}`);
      console.log(`  - Participant ID: ${p.participant_id}`);
      console.log(`  - Internal UUID: ${p.id}`);
      console.log(`  - Phone: ${p.phone}`);
      console.log(`  - Email: ${p.email}`);
      console.log(`  - College / School: ${p.college || p.institution || 'N/A'}`);
      console.log(`  - State: ${p.state || 'N/A'}`);
      console.log(`  - Status: ${p.status}`);
      console.log(`  - Registered At: ${p.created_at}`);

      // Registrations
      const { data: regs } = await supabase.from('registrations').select('*').eq('participant_id', p.id);
      console.log(`\n💳 Registration & Payment:`);
      if (regs && regs.length > 0) {
        regs.forEach(r => {
          console.log(`  - Reg ID: ${r.id} | Status: ${r.registration_status} | Payment: ${r.payment_status} | Amount: ₹${r.amount} | Ref: ${r.payment_reference} | Confirmed: ${r.confirmed_at}`);
        });
      } else {
        console.log(`  - No explicit registration rows linked.`);
      }

      // Quiz Sessions
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('participant_id', p.id)
        .order('started_at', { ascending: true });

      console.log(`\n📝 Quiz Sessions (${sessions?.length || 0}):`);
      if (sessions && sessions.length > 0) {
        for (const s of sessions) {
          const timeElapsedSec = s.started_at && s.submitted_at 
            ? Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000)
            : (s.started_at && s.expires_at ? Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000) : 'N/A');

          console.log(`\n  ----------------------------------------------------------------------`);
          console.log(`  SESSION: ${s.id}`);
          console.log(`  Status: ${s.status}`);
          console.log(`  Score in DB: ${s.score} / ${s.total_questions}`);
          console.log(`  Started At: ${s.started_at}`);
          console.log(`  Expires At: ${s.expires_at}`);
          console.log(`  Submitted At: ${s.submitted_at || 'NULL (Not explicitly submitted)'}`);
          console.log(`  Time Elapsed: ${timeElapsedSec} seconds (${Math.floor(timeElapsedSec / 60)}m ${timeElapsedSec % 60}s)`);

          // Fetch answers
          const { data: answers } = await supabase
            .from('quiz_answers')
            .select('*')
            .eq('session_id', s.id)
            .order('updated_at', { ascending: true });

          console.log(`  Total Answers Saved: ${answers?.length || 0}`);
          if (answers && answers.length > 0) {
            let correctCount = 0;
            let wrongCount = 0;

            console.log(`\n  Detailed Answer Responses:`);
            let prevT = new Date(s.started_at).getTime();

            answers.forEach((a, idx) => {
              const currT = new Date(a.updated_at).getTime();
              const delta = ((currT - prevT) / 1000).toFixed(1);
              const qObj = qMap.get(a.question_id);
              const isCorrect = qObj ? a.selected_option === qObj.correct_option : null;
              if (isCorrect === true) correctCount++;
              else if (isCorrect === false) wrongCount++;

              console.log(`    #${(idx + 1).toString().padStart(2, ' ')} | Q: ${a.question_id.slice(-4)} | Chosen: Option ${a.selected_option} | Correct: Option ${qObj?.correct_option || '?'} | Result: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'} | Time: +${delta}s (${a.updated_at.slice(11, 23)})`);
              prevT = currT;
            });

            console.log(`\n  Summary for Session ${s.id}:`);
            console.log(`    - Total Answers Saved: ${answers.length}`);
            console.log(`    - Correct Answers: ${correctCount}`);
            console.log(`    - Wrong Answers: ${wrongCount}`);
            console.log(`    - Unanswered: ${50 - answers.length}`);
          } else {
            console.log(`  ⚠️ Zero (0) answers were saved during this session.`);
          }
        }
      } else {
        console.log(`  ⚠️ Participant has NEVER started a quiz session.`);
      }
    }
  }
}

main().catch(console.error);
