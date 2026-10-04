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

  // 4:00 PM session attempts
  const malayalam4pmSessions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z' && (s.status === 'SUBMITTED' || s.status === 'EXPIRED'));
  const sessionIds = malayalam4pmSessions.map(s => s.id);

  // Fetch all target answers in ONE single query
  const { data: targetAnswers } = await supabase
    .from('quiz_answers')
    .select('*')
    .in('session_id', sessionIds)
    .in('question_id', [q5Id, q17Id, q20Id]);

  const ansBySession = new Map();
  (targetAnswers || []).forEach(a => {
    if (!ansBySession.has(a.session_id)) {
      ansBySession.set(a.session_id, {});
    }
    ansBySession.get(a.session_id)[a.question_id] = a.selected_option;
  });

  const auditList = [];

  for (const s of malayalam4pmSessions) {
    const p = participants.find(p => p.id === s.participant_id);
    if (!p || p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in')) continue;

    const answers = ansBySession.get(s.id) || {};
    const q5Sel = answers[q5Id] || 'None';
    const q17Sel = answers[q17Id] || 'None';
    const q20Sel = answers[q20Id] || 'None';

    const q5IsCorrect = q5Sel === correctMap.get(q5Id);
    const q17IsCorrect = q17Sel === correctMap.get(q17Id);
    const q20IsCorrect = q20Sel === correctMap.get(q20Id);

    const pointsToDeduct = (q5IsCorrect ? 1 : 0) + (q17IsCorrect ? 1 : 0) + (q20IsCorrect ? 1 : 0);
    const rawScore = s.score !== null && s.score !== undefined ? s.score : 0;
    const validCorrect = Math.max(0, rawScore - pointsToDeduct);
    const percentage = Number(((validCorrect / 47) * 100).toFixed(2));
    const normalizedScore = Number(((validCorrect / 47) * 50).toFixed(2));

    const timeTaken = s.submitted_at && s.started_at 
      ? Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000))
      : (s.expires_at ? Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000)) : 999999);

    auditList.push({
      participant_id: p.participant_id,
      name: p.name,
      phone: p.phone,
      original_score: `${rawScore} / 50`,
      q5: `${q5Sel} (${q5IsCorrect ? 'Correct +1' : 'Wrong +0'})`,
      q17: `${q17Sel} (${q17IsCorrect ? 'Correct +1' : 'Wrong +0'})`,
      q20: `${q20Sel} (${q20IsCorrect ? 'Correct +1' : 'Wrong +0'})`,
      points_from_excluded: pointsToDeduct,
      valid_correct: `${validCorrect} / 47`,
      percentage: `${percentage.toFixed(2)}%`,
      normalized_score: `${normalizedScore.toFixed(2)} / 50`,
      normalized_numeric: normalizedScore,
      time_taken_sec: timeTaken,
      time_formatted: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s (${timeTaken}s)`,
      submitted_at: s.submitted_at
    });
  }

  // Sort: Normalized score DESC -> Time ASC -> Submitted At ASC
  auditList.sort((a, b) => {
    if (b.normalized_numeric !== a.normalized_numeric) {
      return b.normalized_numeric - a.normalized_numeric;
    }
    if (a.time_taken_sec !== b.time_taken_sec) {
      return a.time_taken_sec - b.time_taken_sec;
    }
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return aTime - bTime;
  });

  console.log('\n========================================================================================================================');
  console.log('📋 COMPLETE AUDIT REPORT: ALL 17 MALAYALAM SESSION CANDIDATES (Q5, Q17, Q20 REMOVAL & 47-Q NORMALIZATION)');
  console.log('========================================================================================================================\n');
  console.table(auditList.map((r, idx) => ({
    Rank: idx + 1,
    ID: r.participant_id,
    Name: r.name,
    'Orig Score': r.original_score,
    Q5: r.q5,
    Q17: r.q17,
    Q20: r.q20,
    'Valid (/47)': r.valid_correct,
    Percentage: r.percentage,
    'Norm Score': r.normalized_score,
    'Time Taken': r.time_formatted
  })));

  fs.writeFileSync(path.join(__dirname, 'malayalam_audit_final.json'), JSON.stringify(auditList, null, 2));
}

main().catch(console.error);
