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
  if (seconds === null || seconds === undefined || isNaN(seconds)) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s (${seconds}s)`;
}

function formatIST(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    return new Date(isoStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  } catch {
    return isoStr;
  }
}

async function generateUnifiedLeaderboard() {
  const { data: participants } = await supabase.from('participants').select('*');
  const pMap = new Map(participants.map(p => [p.id, p]));

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('started_at', { ascending: false });

  // Get best session per participant
  const sessionMap = new Map();
  sessions.forEach(s => {
    const existing = sessionMap.get(s.participant_id);
    if (!existing) {
      sessionMap.set(s.participant_id, s);
    } else {
      if (s.status === 'SUBMITTED' && existing.status !== 'SUBMITTED') {
        sessionMap.set(s.participant_id, s);
      } else if (s.status === 'SUBMITTED' && existing.status === 'SUBMITTED') {
        if ((s.score || 0) > (existing.score || 0)) {
          sessionMap.set(s.participant_id, s);
        } else if ((s.score || 0) === (existing.score || 0) && new Date(s.started_at) > new Date(existing.started_at)) {
          sessionMap.set(s.participant_id, s);
        }
      }
    }
  });

  const bestSessions = Array.from(sessionMap.values());
  const bestSessionIds = bestSessions.map(s => s.id);

  // Fetch target answers for Q5, Q17, Q20 for all sessions in one query
  const { data: targetAnswers } = await supabase
    .from('quiz_answers')
    .select('*')
    .in('session_id', bestSessionIds)
    .in('question_id', [q5Id, q17Id, q20Id]);

  const targetAnsMap = new Map();
  targetAnswers?.forEach(a => {
    if (!targetAnsMap.has(a.session_id)) {
      targetAnsMap.set(a.session_id, {});
    }
    targetAnsMap.get(a.session_id)[a.question_id] = a.selected_option;
  });

  const allRows = [];

  participants.forEach(p => {
    if (p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in') || p.name?.includes('Admin Tester')) {
      return;
    }

    const s = sessionMap.get(p.id);
    let timeTakenSeconds = 999999;
    let rawScore = -1;
    let normalizedScore = -1;
    let percentage = 0;
    let status = 'NOT_ATTEMPTED';
    let startedAt = null;
    let submittedAt = null;
    let version = 'Standard 50 Qs';
    let validCorrect = null;
    let validTotal = 50;

    if (s) {
      status = s.status;
      rawScore = s.score !== null && s.score !== undefined ? s.score : 0;
      startedAt = s.started_at;
      submittedAt = s.submitted_at;

      if (s.started_at && s.submitted_at) {
        timeTakenSeconds = Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      } else if (s.started_at && s.expires_at && s.status === 'EXPIRED') {
        timeTakenSeconds = Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      }

      // Check if this was a 4:00 PM Malayalam session attempt
      const isMalayalam4pmSession = s.started_at < '2026-10-04T13:00:00.000Z';

      if (isMalayalam4pmSession && (s.status === 'SUBMITTED' || s.status === 'EXPIRED')) {
        version = 'Malayalam (47 Qs Valid)';
        validTotal = 47;
        const answers = targetAnsMap.get(s.id) || {};
        const q5Sel = answers[q5Id] || 'None';
        const q17Sel = answers[q17Id] || 'None';
        const q20Sel = answers[q20Id] || 'None';

        const q5Correct = q5Sel === correctKeyMap.get(q5Id);
        const q17Correct = q17Sel === correctKeyMap.get(q17Id);
        const q20Correct = q20Sel === correctKeyMap.get(q20Id);

        const excludedPoints = (q5Correct ? 1 : 0) + (q17Correct ? 1 : 0) + (q20Correct ? 1 : 0);
        validCorrect = Math.max(0, rawScore - excludedPoints);
        percentage = Number(((validCorrect / 47) * 100).toFixed(2));
        normalizedScore = Number(((validCorrect / 47) * 50).toFixed(2));
      } else {
        version = 'Standard 50 Qs';
        validTotal = 50;
        validCorrect = rawScore;
        percentage = rawScore >= 0 ? Number(((rawScore / 50) * 100).toFixed(2)) : 0;
        normalizedScore = rawScore >= 0 ? rawScore : -1;
      }
    }

    allRows.push({
      participant_id: p.participant_id || 'N/A',
      name: p.name || 'Anonymous',
      phone: p.phone || 'N/A',
      email: p.email || 'N/A',
      state: p.state || 'Kerala',
      status,
      version,
      raw_score: rawScore,
      valid_correct: validCorrect,
      valid_total: validTotal,
      percentage,
      normalized_score: normalizedScore,
      time_taken_seconds: timeTakenSeconds,
      started_at: startedAt,
      submitted_at: submittedAt
    });
  });

  const submitted = allRows.filter(r => r.status === 'SUBMITTED' || r.status === 'EXPIRED');
  const unsubmitted = allRows.filter(r => r.status !== 'SUBMITTED' && r.status !== 'EXPIRED');

  // Strict sorting:
  // 1. Normalized Score / Percentage DESC
  // 2. Time taken ASC
  // 3. Submitted At ASC
  submitted.sort((a, b) => {
    if (b.normalized_score !== a.normalized_score) {
      return b.normalized_score - a.normalized_score;
    }
    if (a.time_taken_seconds !== b.time_taken_seconds) {
      return a.time_taken_seconds - b.time_taken_seconds;
    }
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return aTime - bTime;
  });

  unsubmitted.sort((a, b) => {
    if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
    if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
    return a.name.localeCompare(b.name);
  });

  const finalRanked = [];
  let rank = 1;
  submitted.forEach(item => {
    finalRanked.push({ rank: rank++, ...item });
  });
  unsubmitted.forEach(item => {
    finalRanked.push({ rank: rank++, ...item });
  });

  console.log('\n==================================================================================================================');
  console.log('🏆 OFFICIAL TKFK GANDHI JAYANTI QUIZ 2026 — FINAL UNIFIED RANKINGS (WITH MALAYALAM NORMALIZATION)');
  console.log('==================================================================================================================\n');

  console.table(finalRanked.slice(0, 45).map(r => ({
    Rank: `#${r.rank}`,
    ID: r.participant_id,
    Name: r.name.substring(0, 22),
    'Norm Score': r.normalized_score >= 0 ? `${r.normalized_score.toFixed(2)} / 50` : 'N/A',
    'Percentage': `${r.percentage.toFixed(2)}%`,
    'Valid Raw': r.valid_correct !== null ? `${r.valid_correct}/${r.valid_total}` : 'N/A',
    'Version': r.version.substring(0, 15),
    'Time Taken': r.time_taken_seconds < 999999 ? formatDuration(r.time_taken_seconds) : 'N/A',
    'Submitted': formatIST(r.submitted_at)
  })));

  // Generate CSV
  const csvHeaders = [
    'Rank',
    'Participant ID',
    'Full Name',
    'Phone',
    'Email',
    'State',
    'Normalized Score (/50)',
    'Percentage (%)',
    'Valid Raw Correct',
    'Valid Question Count',
    'Original Raw Score (/50)',
    'Scoring Version',
    'Time Taken (Seconds)',
    'Time Taken (MM:SS)',
    'Status',
    'Started At (IST)',
    'Submitted At (IST)',
    'Award / Standing'
  ];

  const csvRows = finalRanked.map(r => {
    const isSub = r.status === 'SUBMITTED' || r.status === 'EXPIRED';
    const timeSec = (isSub && r.time_taken_seconds < 999999) ? r.time_taken_seconds : 'N/A';
    const timeFormatted = (isSub && r.time_taken_seconds < 999999) ? `${Math.floor(r.time_taken_seconds / 60)}m ${r.time_taken_seconds % 60}s` : 'N/A';
    const scoreVal = r.normalized_score >= 0 ? r.normalized_score.toFixed(2) : '0';
    const pct = `${r.percentage.toFixed(2)}%`;
    const validCorrectVal = r.valid_correct !== null ? r.valid_correct : 'N/A';
    const rawVal = r.raw_score >= 0 ? r.raw_score : 'N/A';

    let award = 'Participant';
    if (r.rank === 1 && isSub) {
      award = 'FIRST PRIZE WINNER (₹9,999)';
    } else if (r.rank <= 3 && isSub) {
      award = 'Top 3 Distinction';
    } else if (r.rank <= 10 && isSub) {
      award = 'Top 10 Merit';
    } else if (isSub) {
      award = 'Certificate of Merit';
    } else if (r.status === 'IN_PROGRESS') {
      award = 'In Progress';
    } else {
      award = 'Not Attempted';
    }

    return [
      `"${r.rank}"`,
      `"${r.participant_id}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${r.phone || 'N/A'}"`,
      `"${r.email || 'N/A'}"`,
      `"${r.state || 'Kerala'}"`,
      `"${scoreVal}"`,
      `"${pct}"`,
      `"${validCorrectVal}"`,
      `"${r.valid_total}"`,
      `"${rawVal}"`,
      `"${r.version}"`,
      `"${timeSec}"`,
      `"${timeFormatted}"`,
      `"${r.status}"`,
      `"${formatIST(r.started_at)}"`,
      `"${formatIST(r.submitted_at)}"`,
      `"${award}"`
    ].join(',');
  });

  const csvData = [csvHeaders.join(','), ...csvRows].join('\r\n');
  const downloadDir = path.join(process.cwd(), 'public', 'downloads');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  const csvFilePath = path.join(downloadDir, 'TKFK_Gandhi_Quiz_2026_Full_Rankings.csv');
  fs.writeFileSync(csvFilePath, csvData, 'utf8');
  console.log(`\n✅ Generated Updated CSV: ${csvFilePath}`);

  return finalRanked;
}

generateUnifiedLeaderboard().catch(console.error);
