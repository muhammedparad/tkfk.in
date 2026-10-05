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

const q5Id = '00000000-0000-0000-0000-000000000005';
const q17Id = '00000000-0000-0000-0000-000000000017';
const q20Id = '00000000-0000-0000-0000-000000000020';

const correctMap = new Map();
PREVIOUS_ORIGINAL_50_QUESTIONS.forEach(q => {
  correctMap.set(q.id, q.correct_option);
});

async function main() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: false });

  // 4:00 PM Malayalam sessions
  const malayalam4pmSessions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z' && (s.status === 'SUBMITTED' || s.status === 'EXPIRED'));
  const sessionIds = malayalam4pmSessions.map(s => s.id);

  // Fetch all answers for these sessions
  const { data: allAnswers } = await supabase
    .from('quiz_answers')
    .select('*')
    .in('session_id', sessionIds)
    .order('updated_at', { ascending: true });

  const answersBySession = new Map();
  allAnswers.forEach(a => {
    if (!answersBySession.has(a.session_id)) {
      answersBySession.set(a.session_id, []);
    }
    answersBySession.get(a.session_id).push(a);
  });

  const detailedAudit = [];

  for (const s of malayalam4pmSessions) {
    const p = participants.find(p => p.id === s.participant_id);
    if (!p || p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in')) continue;

    const ansList = answersBySession.get(s.id) || [];
    
    // Calculate total time
    const origTotalTime = s.submitted_at && s.started_at 
      ? Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000))
      : (s.expires_at ? Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000)) : 999999);

    // Build timeline of answers
    // For each answer, duration = updated_at - previous_timestamp
    let prevTime = new Date(s.started_at).getTime();
    let q5Duration = 0;
    let q17Duration = 0;
    let q20Duration = 0;

    let q5AnsObj = null;
    let q17AnsObj = null;
    let q20AnsObj = null;

    ansList.forEach((a, idx) => {
      const currTime = new Date(a.updated_at).getTime();
      const deltaSec = Math.max(0, Math.round((currTime - prevTime) / 1000));
      
      if (a.question_id === q5Id) {
        q5Duration = deltaSec;
        q5AnsObj = a;
      } else if (a.question_id === q17Id) {
        q17Duration = deltaSec;
        q17AnsObj = a;
      } else if (a.question_id === q20Id) {
        q20Duration = deltaSec;
        q20AnsObj = a;
      }
      prevTime = currTime;
    });

    // Score calculations
    const q5Sel = q5AnsObj?.selected_option || 'None';
    const q17Sel = q17AnsObj?.selected_option || 'None';
    const q20Sel = q20AnsObj?.selected_option || 'None';

    const q5IsCorrect = q5Sel === correctMap.get(q5Id);
    const q17IsCorrect = q17Sel === correctMap.get(q17Id);
    const q20IsCorrect = q20Sel === correctMap.get(q20Id);

    const pointsToDeduct = (q5IsCorrect ? 1 : 0) + (q17IsCorrect ? 1 : 0) + (q20IsCorrect ? 1 : 0);
    const rawScore = s.score !== null && s.score !== undefined ? s.score : 0;
    const validCorrect = Math.max(0, rawScore - pointsToDeduct);
    const percentage = Number(((validCorrect / 47) * 100).toFixed(2));
    const normalizedScore = Number(((validCorrect / 47) * 50).toFixed(2));

    const adjustedTime = Math.max(0, origTotalTime - q5Duration - q17Duration - q20Duration);

    detailedAudit.push({
      participant_id: p.participant_id,
      name: p.name,
      phone: p.phone,
      original_score: rawScore,
      valid_correct: validCorrect,
      normalized_score: normalizedScore,
      percentage: percentage,
      original_total_time: origTotalTime,
      q5_time: q5Duration,
      q17_time: q17Duration,
      q20_time: q20Duration,
      adjusted_time: adjustedTime,
      submitted_at: s.submitted_at,
      answers_count: ansList.length,
      q5_status: `${q5Sel} (${q5IsCorrect ? 'Correct' : 'Wrong'}) [${q5Duration}s]`,
      q17_status: `${q17Sel} (${q17IsCorrect ? 'Correct' : 'Wrong'}) [${q17Duration}s]`,
      q20_status: `${q20Sel} (${q20IsCorrect ? 'Correct' : 'Wrong'}) [${q20Duration}s]`
    });
  }

  console.log(`\n========================================================================================`);
  console.log(`MALAYALAM PARTICIPANTS (TOTAL: ${detailedAudit.length}) — PER-QUESTION TIMING AUDIT`);
  console.log(`========================================================================================\n`);

  console.table(detailedAudit.map(r => ({
    ID: r.participant_id,
    Name: r.name.substring(0, 20),
    'Orig Score': r.original_score,
    'Valid /47': r.valid_correct,
    'Norm /50': r.normalized_score,
    'Orig Time': `${r.original_total_time}s (${Math.floor(r.original_total_time/60)}m ${r.original_total_time%60}s)`,
    'Q5 Time': `${r.q5_time}s`,
    'Q17 Time': `${r.q17_time}s`,
    'Q20 Time': `${r.q20_time}s`,
    'Adj Time': `${r.adjusted_time}s (${Math.floor(r.adjusted_time/60)}m ${r.adjusted_time%60}s)`
  })));

  fs.writeFileSync(path.join(__dirname, 'malayalam_timing_audit.json'), JSON.stringify(detailedAudit, null, 2));
}

main().catch(console.error);
