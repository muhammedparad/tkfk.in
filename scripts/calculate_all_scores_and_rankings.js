const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const OFFICIAL_KEY = {
  1: 'B', 2: 'B', 3: 'D', 4: 'B', 5: 'C', 6: 'A', 7: 'D', 8: 'A', 9: 'A', 10: 'B',
  11: 'A', 12: 'D', 13: 'B', 14: 'A', 15: 'C', 16: 'D', 17: 'A', 18: 'A', 19: 'B', 20: 'C',
  21: 'D', 22: 'A', 23: 'D', 24: 'A', 25: 'B', 26: 'C', 27: 'B', 28: 'D', 29: 'C', 30: 'A',
  31: 'D', 32: 'A', 33: 'A', 34: 'C', 35: 'B', 36: 'D', 37: 'C', 38: 'B', 39: 'D', 40: 'B',
  41: 'C', 42: 'A', 43: 'D', 44: 'A', 45: 'B', 46: 'C', 47: 'C', 48: 'D', 49: 'C', 50: 'C'
};

function uuidToQNum(uuid) {
  const num = parseInt(uuid.replace(/[^0-9]/g, ''), 10);
  return num >= 1 && num <= 50 ? num : null;
}

function formatDuration(ms) {
  if (ms == null || isNaN(ms) || ms < 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

async function run() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: true });
  const { data: answers } = await supabase.from('quiz_answers').select('*');

  // 1. Create safe backup on disk
  const backup = {
    timestamp: new Date().toISOString(),
    participantsCount: participants.length,
    sessionsCount: sessions.length,
    answersCount: answers.length,
    sessions,
    answers
  };
  fs.writeFileSync('scripts/quiz_backup_pre_scoring.json', JSON.stringify(backup, null, 2), 'utf8');
  console.log('✅ Safe backup created at scripts/quiz_backup_pre_scoring.json\n');

  const pMap = {};
  participants.forEach(p => pMap[p.id] = p);

  const answersBySession = {};
  answers.forEach(a => {
    if (!answersBySession[a.session_id]) answersBySession[a.session_id] = [];
    answersBySession[a.session_id].push(a);
  });

  const processedList = [];

  for (const s of sessions) {
    const p = pMap[s.participant_id] || {};
    const sessAnswers = answersBySession[s.id] || [];

    let correct = 0;
    let wrong = 0;

    sessAnswers.forEach(a => {
      const qNum = uuidToQNum(a.question_id);
      const officialCorrect = OFFICIAL_KEY[qNum];
      if (officialCorrect && officialCorrect === a.selected_option) {
        correct++;
      } else {
        wrong++;
      }
    });

    const totalAnswered = correct + wrong;
    const unanswered = 50 - totalAnswered;
    const score = correct;
    const percentage = ((score / 50) * 100).toFixed(1);

    // Completion duration calculation
    let completionMs = null;
    if (s.submitted_at && s.started_at) {
      completionMs = new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime();
    } else if (s.status === 'EXPIRED' && s.expires_at && s.started_at) {
      completionMs = new Date(s.expires_at).getTime() - new Date(s.started_at).getTime();
    }

    processedList.push({
      sessionId: s.id,
      participantId: p.participant_id || 'Unknown',
      name: p.name || 'Unknown',
      place: p.city || p.district || p.state || '',
      phone: p.phone || '',
      status: s.status,
      currentDbScore: s.score,
      calculatedScore: score,
      correct,
      wrong,
      unanswered,
      percentage: `${percentage}%`,
      completionMs: completionMs || 999999999, // For sorting if unfinished
      completionDisplay: formatDuration(completionMs),
      startedAt: s.started_at ? new Date(s.started_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
      submittedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : (s.status === 'IN_PROGRESS' ? 'In Progress' : 'Expired')
    });
  }

  // TIE BREAK RANKING:
  // 1. Higher score first (calculatedScore desc)
  // 2. Shorter completion time first (completionMs asc)
  // 3. Started earlier first (startedAt)
  processedList.sort((a, b) => {
    if (b.calculatedScore !== a.calculatedScore) {
      return b.calculatedScore - a.calculatedScore;
    }
    return a.completionMs - b.completionMs;
  });

  // Assign Ranks
  processedList.forEach((item, index) => {
    item.rank = index + 1;
  });

  console.log('=== CALCULATED SCORES & PROPOSED RANKINGS ===');
  console.table(processedList.map(item => ({
    Rank: item.rank,
    ID: item.participantId,
    Name: item.name,
    Score: item.calculatedScore,
    Correct: item.correct,
    Wrong: item.wrong,
    Unanswered: item.unanswered,
    Pct: item.percentage,
    Duration: item.completionDisplay,
    Status: item.status
  })));

  // Count affected
  const needsScoreUpdate = processedList.filter(item => item.calculatedScore !== item.currentDbScore);
  console.log('\n--- UPDATE IMPACT SUMMARY ---');
  console.log(`Total quiz sessions: ${processedList.length}`);
  console.log(`Sessions with calculated score different from current DB score: ${needsScoreUpdate.length}`);
  needsScoreUpdate.forEach(u => {
    console.log(`- ${u.participantId} (${u.name}): current DB score = ${u.currentDbScore} -> new score = ${u.calculatedScore} (${u.correct} correct, ${u.wrong} wrong)`);
  });

  fs.writeFileSync('scripts/calculated_results.json', JSON.stringify(processedList, null, 2), 'utf8');
}

run();
