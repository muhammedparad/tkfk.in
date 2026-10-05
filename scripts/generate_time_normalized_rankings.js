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

const correctKeyMap = new Map();
PREVIOUS_ORIGINAL_50_QUESTIONS.forEach(q => {
  correctKeyMap.set(q.id, q.correct_option);
});

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds >= 999999) return 'N/A';
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

async function main() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: false });

  // Best session per participant
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

  // Fetch all answers for these sessions
  const { data: allAnswers } = await supabase
    .from('quiz_answers')
    .select('*')
    .in('session_id', bestSessionIds)
    .order('updated_at', { ascending: true });

  const answersBySession = new Map();
  allAnswers?.forEach(a => {
    if (!answersBySession.has(a.session_id)) {
      answersBySession.set(a.session_id, []);
    }
    answersBySession.get(a.session_id).push(a);
  });

  const participantRows = [];

  participants.forEach(p => {
    if (p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in') || p.name?.includes('Admin Tester')) {
      return;
    }

    const s = sessionMap.get(p.id);
    let originalTotalTime = 999999;
    let adjustedTime = 999999;
    let q5Time = 0;
    let q17Time = 0;
    let q20Time = 0;

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
        originalTotalTime = Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      } else if (s.started_at && s.expires_at && s.status === 'EXPIRED') {
        originalTotalTime = Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      }

      // 4:00 PM Malayalam session (where marks were adjusted yesterday)
      const isMalayalam4pm = s.started_at < '2026-10-04T13:00:00.000Z';

      if (isMalayalam4pm && (s.status === 'SUBMITTED' || s.status === 'EXPIRED')) {
        version = 'Malayalam (47 Qs Valid)';
        validTotal = 47;
        const ansList = answersBySession.get(s.id) || [];

        let prevTime = new Date(s.started_at).getTime();
        let q5Ans = null, q17Ans = null, q20Ans = null;

        ansList.forEach(a => {
          const currTime = new Date(a.updated_at).getTime();
          const deltaSec = Math.max(0, Math.round((currTime - prevTime) / 1000));
          if (a.question_id === q5Id) {
            q5Time = deltaSec;
            q5Ans = a;
          } else if (a.question_id === q17Id) {
            q17Time = deltaSec;
            q17Ans = a;
          } else if (a.question_id === q20Id) {
            q20Time = deltaSec;
            q20Ans = a;
          }
          prevTime = currTime;
        });

        const q5Sel = q5Ans?.selected_option || 'None';
        const q17Sel = q17Ans?.selected_option || 'None';
        const q20Sel = q20Ans?.selected_option || 'None';

        const q5Correct = q5Sel === correctKeyMap.get(q5Id);
        const q17Correct = q17Sel === correctKeyMap.get(q17Id);
        const q20Correct = q20Sel === correctKeyMap.get(q20Id);

        const excludedPoints = (q5Correct ? 1 : 0) + (q17Correct ? 1 : 0) + (q20Correct ? 1 : 0);
        validCorrect = Math.max(0, rawScore - excludedPoints);
        percentage = Number(((validCorrect / 47) * 100).toFixed(2));
        normalizedScore = Number(((validCorrect / 47) * 50).toFixed(2));

        adjustedTime = Math.max(0, originalTotalTime - q5Time - q17Time - q20Time);
      } else {
        version = 'Standard 50 Qs';
        validTotal = 50;
        validCorrect = rawScore;
        percentage = rawScore >= 0 ? Number(((rawScore / 50) * 100).toFixed(2)) : 0;
        normalizedScore = rawScore >= 0 ? rawScore : -1;
        adjustedTime = originalTotalTime;
      }
    }

    participantRows.push({
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
      original_total_time: originalTotalTime,
      q5_time: q5Time,
      q17_time: q17Time,
      q20_time: q20Time,
      adjusted_time: adjustedTime,
      started_at: startedAt,
      submitted_at: submittedAt
    });
  });

  // Calculate ranks BEFORE time adjustment
  const submittedBefore = [...participantRows.filter(r => r.status === 'SUBMITTED' || r.status === 'EXPIRED')];
  submittedBefore.sort((a, b) => {
    if (b.normalized_score !== a.normalized_score) return b.normalized_score - a.normalized_score;
    if (a.original_total_time !== b.original_total_time) return a.original_total_time - b.original_total_time;
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return aTime - bTime;
  });
  const beforeRankMap = new Map();
  submittedBefore.forEach((r, idx) => {
    beforeRankMap.set(r.participant_id, idx + 1);
  });

  // Calculate ranks AFTER time adjustment
  const submittedAfter = [...participantRows.filter(r => r.status === 'SUBMITTED' || r.status === 'EXPIRED')];
  submittedAfter.sort((a, b) => {
    if (b.normalized_score !== a.normalized_score) return b.normalized_score - a.normalized_score;
    if (a.adjusted_time !== b.adjusted_time) return a.adjusted_time - b.adjusted_time;
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return aTime - bTime;
  });

  const unsubmitted = participantRows.filter(r => r.status !== 'SUBMITTED' && r.status !== 'EXPIRED');
  unsubmitted.sort((a, b) => {
    if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
    if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
    return a.name.localeCompare(b.name);
  });

  const finalRanked = [];
  let rank = 1;
  submittedAfter.forEach(item => {
    const prevRank = beforeRankMap.get(item.participant_id);
    const rankDiff = prevRank ? prevRank - rank : 0;
    finalRanked.push({
      rank: rank++,
      prevRank: prevRank || 'N/A',
      rankChange: rankDiff > 0 ? `+${rankDiff} (Up)` : (rankDiff < 0 ? `${rankDiff} (Down)` : 'Same'),
      ...item
    });
  });
  unsubmitted.forEach(item => {
    finalRanked.push({
      rank: rank++,
      prevRank: 'N/A',
      rankChange: 'Same',
      ...item
    });
  });

  console.log('\n--- COMPLETE UNIFIED LEADERBOARD (ALL 41 SUBMITTED PARTICIPANTS) ---');
  console.table(finalRanked.filter(r => r.status === 'SUBMITTED' || r.status === 'EXPIRED').map(r => ({
    Rank: `#${r.rank}`,
    Change: r.rankChange,
    ID: r.participant_id,
    Name: r.name.substring(0, 20),
    'Norm Score': `${r.normalized_score.toFixed(2)}/50`,
    'Valid / Total': `${r.valid_correct}/${r.valid_total}`,
    'Version': r.version.substring(0, 12),
    'Orig Time': formatDuration(r.original_total_time),
    'Adj Time': formatDuration(r.adjusted_time),
    'Submitted (IST)': formatIST(r.submitted_at)
  })));

  // Generate Updated CSV with all audit columns
  const csvHeaders = [
    'Rank',
    'Rank Change',
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
    'Original Total Time (Seconds)',
    'Original Total Time (MM:SS)',
    'Q5 Time (Seconds)',
    'Q17 Time (Seconds)',
    'Q20 Time (Seconds)',
    'Adjusted Time (Seconds)',
    'Adjusted Time (MM:SS)',
    'Status',
    'Started At (IST)',
    'Submitted At (IST)',
    'Award / Standing'
  ];

  const csvRows = finalRanked.map(r => {
    const isSub = r.status === 'SUBMITTED' || r.status === 'EXPIRED';
    const origTimeSec = (isSub && r.original_total_time < 999999) ? r.original_total_time : 'N/A';
    const origTimeFormatted = (isSub && r.original_total_time < 999999) ? `${Math.floor(r.original_total_time / 60)}m ${r.original_total_time % 60}s` : 'N/A';
    const adjTimeSec = (isSub && r.adjusted_time < 999999) ? r.adjusted_time : 'N/A';
    const adjTimeFormatted = (isSub && r.adjusted_time < 999999) ? `${Math.floor(r.adjusted_time / 60)}m ${r.adjusted_time % 60}s` : 'N/A';
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
      `"${r.rankChange}"`,
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
      `"${origTimeSec}"`,
      `"${origTimeFormatted}"`,
      `"${r.q5_time || 0}"`,
      `"${r.q17_time || 0}"`,
      `"${r.q20_time || 0}"`,
      `"${adjTimeSec}"`,
      `"${adjTimeFormatted}"`,
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

  const malayalamAuditRows = finalRanked.filter(r => r.version.includes('Malayalam'));
  const malayalamAuditCsv = [
    'Participant ID,Full Name,Scoring Language,Original Score,Valid Correct (/47),Normalized Score (/50),Original Total Time (s),Q5 Time (s),Q17 Time (s),Q20 Time (s),Adjusted Time (s),Final Rank,Rank Change',
    ...malayalamAuditRows.map(r => [
      `"${r.participant_id}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"Malayalam"`,
      `"${r.raw_score}"`,
      `"${r.valid_correct}"`,
      `"${r.normalized_score.toFixed(2)}"`,
      `"${r.original_total_time}"`,
      `"${r.q5_time}"`,
      `"${r.q17_time}"`,
      `"${r.q20_time}"`,
      `"${r.adjusted_time}"`,
      `"${r.rank}"`,
      `"${r.rankChange}"`
    ].join(','))
  ].join('\r\n');

  fs.writeFileSync(path.join(downloadDir, 'TKFK_Malayalam_Fairness_Audit_Report.csv'), malayalamAuditCsv, 'utf8');
  console.log(`✅ Generated Malayalam Fairness Audit CSV: ${path.join(downloadDir, 'TKFK_Malayalam_Fairness_Audit_Report.csv')}`);
}

main().catch(console.error);
