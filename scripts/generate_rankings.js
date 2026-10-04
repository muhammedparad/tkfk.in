const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local cleanly
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const envVars = {};
envFile.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    const k = trimmed.substring(0, idx).trim();
    let v = trimmed.substring(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.substring(1, v.length - 1);
    }
    envVars[k] = v;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

function formatIST(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    return new Date(isoStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  } catch {
    return isoStr;
  }
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s (${seconds}s)`;
}

async function main() {
  console.log('1. Querying participants...');
  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('id, participant_id, name, phone, email, state, status');

  if (pErr) {
    console.error('Error fetching participants:', pErr);
    return;
  }
  console.log(`✓ Participants count: ${participants.length}`);

  console.log('2. Querying quiz sessions...');
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('id, participant_id, score, total_questions, status, started_at, submitted_at, expires_at');

  if (sErr) {
    console.error('Error fetching sessions:', sErr);
    return;
  }
  console.log(`✓ Quiz sessions count: ${sessions.length}`);

  // Build best session map per participant
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

  const allEntries = [];

  participants.forEach(p => {
    if (p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in') || p.name?.includes('Admin Tester')) {
      return;
    }

    const s = sessionMap.get(p.id);
    let timeTakenSeconds = 999999;
    let score = -1;
    let status = 'NOT_ATTEMPTED';
    let startedAt = null;
    let submittedAt = null;

    if (s) {
      status = s.status;
      score = s.score !== null && s.score !== undefined ? s.score : 0;
      startedAt = s.started_at;
      submittedAt = s.submitted_at;

      if (s.started_at && s.submitted_at) {
        timeTakenSeconds = Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      } else if (s.started_at && s.expires_at && s.status === 'EXPIRED') {
        timeTakenSeconds = Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      }
    }

    allEntries.push({
      participant_id: p.participant_id || 'N/A',
      name: p.name || 'Anonymous',
      phone: p.phone || 'N/A',
      email: p.email || 'N/A',
      state: p.state || 'Kerala',
      status,
      score,
      time_taken_seconds: timeTakenSeconds,
      started_at: startedAt,
      submitted_at: submittedAt
    });
  });

  const submitted = allEntries.filter(e => e.status === 'SUBMITTED' || e.status === 'EXPIRED');
  const unsubmitted = allEntries.filter(e => e.status !== 'SUBMITTED' && e.status !== 'EXPIRED');

  // Strict sorting:
  // 1. Score DESC (Marks: 50 -> 0)
  // 2. Time Taken ASC (Fastest duration first)
  // 3. Submitted At ASC (Earliest submission timestamp)
  submitted.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.time_taken_seconds !== b.time_taken_seconds) return a.time_taken_seconds - b.time_taken_seconds;
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

  console.log(`\n========================================================================================`);
  console.log(`🏆 OFFICIAL TKFK GANDHI JAYANTI QUIZ 2026 — FULL LEADERBOARD (${finalRanked.length} Participants)`);
  console.log(`========================================================================================\n`);

  console.table(
    finalRanked.slice(0, 45).map(r => ({
      Rank: `#${r.rank}`,
      ID: r.participant_id,
      Name: r.name.substring(0, 24),
      Score: r.score >= 0 ? `${r.score} / 50` : 'N/A',
      'Time Taken': r.time_taken_seconds < 999999 ? formatDuration(r.time_taken_seconds) : 'N/A',
      Status: r.status,
      'Submitted At': formatIST(r.submitted_at)
    }))
  );

  // Generate CSV
  const csvHeaders = [
    'Rank',
    'Participant ID',
    'Full Name',
    'Phone',
    'Email',
    'State',
    'Score (/50)',
    'Percentage (%)',
    'Time Taken (Seconds)',
    'Time Taken (MM:SS)',
    'Status',
    'Started At (IST)',
    'Submitted At (IST)',
    'Award'
  ];

  const csvRows = finalRanked.map(r => {
    const timeFormatted = r.time_taken_seconds < 999999 ? `${Math.floor(r.time_taken_seconds / 60)}m ${r.time_taken_seconds % 60}s` : 'N/A';
    const timeSec = r.time_taken_seconds < 999999 ? r.time_taken_seconds : 'N/A';
    const scoreVal = r.score >= 0 ? r.score : 0;
    const pct = r.score >= 0 ? ((r.score / 50) * 100).toFixed(1) + '%' : '0%';
    let award = 'Participant';
    if (r.rank === 1 && r.status === 'SUBMITTED') {
      award = 'FIRST PRIZE WINNER (₹9,999)';
    } else if (r.rank <= 3 && r.status === 'SUBMITTED') {
      award = 'Top 3 Distinction';
    } else if (r.rank <= 10 && r.status === 'SUBMITTED') {
      award = 'Top 10 Merit';
    } else if (r.status === 'SUBMITTED') {
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
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${r.state}"`,
      `"${scoreVal}"`,
      `"${pct}"`,
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
  console.log(`\n✅ Generated CSV: ${csvFilePath}`);

  return finalRanked;
}

main().catch(console.error);
