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

const excludedQuestionIds = new Set([q5Id, q17Id, q20Id]);

// Map of original questions to their correct answers
const correctMap = new Map();
PREVIOUS_ORIGINAL_50_QUESTIONS.forEach(q => {
  correctMap.set(q.id, q.correct_option);
});

async function main() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: false });
  const { data: answers } = await supabase.from('quiz_answers').select('*');

  const answersBySession = new Map();
  answers.forEach(a => {
    if (!answersBySession.has(a.session_id)) {
      answersBySession.set(a.session_id, []);
    }
    answersBySession.get(a.session_id).push(a);
  });

  // Filter 4:00 PM session participants
  const malayalam4pmSessions = sessions.filter(s => s.started_at < '2026-10-04T13:00:00.000Z' && (s.status === 'SUBMITTED' || s.status === 'EXPIRED'));

  console.log(`Found ${malayalam4pmSessions.length} Malayalam 4:00 PM completed sessions.\n`);

  const results = [];

  for (const s of malayalam4pmSessions) {
    const p = participants.find(p => p.id === s.participant_id);
    const ansList = answersBySession.get(s.id) || [];
    
    // Check answers for Q5, Q17, Q20
    const q5Ans = ansList.find(a => a.question_id === q5Id);
    const q17Ans = ansList.find(a => a.question_id === q17Id);
    const q20Ans = ansList.find(a => a.question_id === q20Id);

    const q5IsCorrect = q5Ans && q5Ans.selected_option === correctMap.get(q5Id);
    const q17IsCorrect = q17Ans && q17Ans.selected_option === correctMap.get(q17Id);
    const q20IsCorrect = q20Ans && q20Ans.selected_option === correctMap.get(q20Id);

    // Count valid correct directly from the 47 valid questions
    let validCorrectCount = 0;
    ansList.forEach(a => {
      if (!excludedQuestionIds.has(a.question_id)) {
        if (a.selected_option === correctMap.get(a.question_id)) {
          validCorrectCount++;
        }
      }
    });

    const percentage = Number(((validCorrectCount / 47) * 100).toFixed(2));
    const normalizedScore = Number(((validCorrectCount / 47) * 50).toFixed(2));
    const timeTaken = s.submitted_at && s.started_at 
      ? Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000))
      : 999999;

    results.push({
      participant_id: p ? p.participant_id : 'N/A',
      name: p ? p.name : 'N/A',
      raw_score: s.score,
      q5: q5Ans ? `${q5Ans.selected_option} (${q5IsCorrect ? '✓' : '✗'})` : 'None',
      q17: q17Ans ? `${q17Ans.selected_option} (${q17IsCorrect ? '✓' : '✗'})` : 'None',
      q20: q20Ans ? `${q20Ans.selected_option} (${q20IsCorrect ? '✓' : '✗'})` : 'None',
      valid_correct: `${validCorrectCount} / 47`,
      percentage: `${percentage.toFixed(2)}%`,
      normalized_score: `${normalizedScore.toFixed(2)} / 50`,
      time_taken_sec: timeTaken,
      time_formatted: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`,
      session_id: s.id
    });
  }

  // Sort by normalized score DESC, then time ASC
  results.sort((a, b) => {
    const scoreA = parseFloat(a.normalized_score);
    const scoreB = parseFloat(b.normalized_score);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.time_taken_sec - b.time_taken_sec;
  });

  console.table(results);

  fs.writeFileSync(path.join(__dirname, 'malayalam_exact_audit.json'), JSON.stringify(results, null, 2));
}

main().catch(console.error);
