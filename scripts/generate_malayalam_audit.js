const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
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

const correctKeyMap = new Map();
PREVIOUS_ORIGINAL_50_QUESTIONS.forEach(q => {
  correctKeyMap.set(q.id, q.correct_option);
});

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s (${seconds}s)`;
}

async function computeMalayalamAudit() {
  const { data: participants } = await supabase.from('participants').select('*');
  const pMap = new Map(participants.map(p => [p.id, p]));

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('status', 'SUBMITTED')
    .order('started_at', { ascending: true });

  const malayalamSessions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z');

  const auditReport = [];

  for (const s of malayalamSessions) {
    const p = pMap.get(s.participant_id);
    const { data: userAnswers } = await supabase
      .from('quiz_answers')
      .select('question_id, selected_option')
      .eq('session_id', s.id);

    const ansMap = new Map(userAnswers ? userAnswers.map(a => [a.question_id, a.selected_option]) : []);

    const q5Ans = ansMap.get(q5Id);
    const q17Ans = ansMap.get(q17Id);
    const q20Ans = ansMap.get(q20Id);

    const q5Correct = q5Ans === correctKeyMap.get(q5Id);
    const q17Correct = q17Ans === correctKeyMap.get(q17Id);
    const q20Correct = q20Ans === correctKeyMap.get(q20Id);

    const originalCorrect = s.score;
    const excludedCorrect = (q5Correct ? 1 : 0) + (q17Correct ? 1 : 0) + (q20Correct ? 1 : 0);
    const validCorrect = originalCorrect - excludedCorrect;

    const percentage = Number(((validCorrect / 47) * 100).toFixed(2));
    const normalizedScore = Number(((validCorrect / 47) * 50).toFixed(2));

    let timeTakenSec = 0;
    if (s.started_at && s.submitted_at) {
      timeTakenSec = Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000));
    }

    auditReport.push({
      participant_id: p?.participant_id || 'N/A',
      name: p?.name || 'Anonymous',
      language: 'Malayalam (മലയാളം)',
      original_correct: `${originalCorrect} / 50`,
      q5_status: q5Correct ? 'Correct (Option C)' : (q5Ans ? `Wrong (${q5Ans})` : 'Unanswered'),
      q17_status: q17Correct ? 'Correct (Option A)' : (q17Ans ? `Wrong (${q17Ans})` : 'Unanswered'),
      q20_status: q20Correct ? 'Correct (Option C)' : (q20Ans ? `Wrong (${q20Ans})` : 'Unanswered'),
      valid_correct: `${validCorrect} / 47`,
      percentage: `${percentage.toFixed(2)}%`,
      normalized_score: `${normalizedScore.toFixed(2)} / 50`,
      time_taken_seconds: timeTakenSec,
      completion_time: formatDuration(timeTakenSec),
      final_ranking_score: normalizedScore,
      session_id: s.id
    });
  }

  // Sort audit report by normalizedScore DESC, timeTakenSec ASC
  auditReport.sort((a, b) => {
    if (b.final_ranking_score !== a.final_ranking_score) {
      return b.final_ranking_score - a.final_ranking_score;
    }
    return a.time_taken_seconds - b.time_taken_seconds;
  });

  console.log('\n========================================================================================================');
  console.log('📋 AUDIT REPORT: MALAYALAM ATTEMPTS SCORING CORRECTION (Q5, Q17, Q20 EXCLUDED -> 47 VALID QUESTIONS)');
  console.log('========================================================================================================\n');

  console.table(auditReport.map(r => ({
    ID: r.participant_id,
    Name: r.name.substring(0, 22),
    'Orig Score': r.original_correct,
    'Q5': r.q5_status.substring(0, 10),
    'Q17': r.q17_status.substring(0, 10),
    'Q20': r.q20_status.substring(0, 10),
    'Valid / 47': r.valid_correct,
    'Percentage': r.percentage,
    'Normalized / 50': r.normalized_score,
    'Time': r.completion_time
  })));

  fs.writeFileSync('scripts/malayalam_audit_report.json', JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('\n✅ Audit report saved to scripts/malayalam_audit_report.json');
}

computeMalayalamAudit().catch(console.error);
