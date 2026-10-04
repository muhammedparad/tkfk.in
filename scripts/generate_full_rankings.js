const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

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
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s (${seconds}s)`;
}

async function main() {
  console.log('Fetching all participants, registrations, and quiz sessions...');

  // 1. Fetch all participants
  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: true });
  if (pErr) throw pErr;

  // 2. Fetch all confirmed registrations
  const { data: registrations, error: rErr } = await supabase
    .from('registrations')
    .select('*');
  if (rErr) throw rErr;

  // 3. Fetch all quiz sessions
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('*');
  if (sErr) throw sErr;

  console.log(`Participants: ${participants.length}, Registrations: ${registrations.length}, Sessions: ${sessions.length}`);

  // Create lookup maps
  const regMap = new Map();
  registrations.forEach(r => {
    regMap.set(r.participant_id, r);
  });

  const sessionMap = new Map();
  sessions.forEach(s => {
    // If a participant has multiple sessions (e.g. earlier and reconduct), pick the SUBMITTED or the latest one
    const existing = sessionMap.get(s.participant_id);
    if (!existing) {
      sessionMap.set(s.participant_id, s);
    } else {
      if (s.status === 'SUBMITTED' && existing.status !== 'SUBMITTED') {
        sessionMap.set(s.participant_id, s);
      } else if (new Date(s.started_at).getTime() > new Date(existing.started_at).getTime()) {
        sessionMap.set(s.participant_id, s);
      }
    }
  });

  // Filter out admin test IDs if needed (e.g. TKFK26-ADMIN99)
  const rankedList = [];

  participants.forEach(p => {
    if (p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in')) {
      return; // exclude admin tester
    }

    const reg = regMap.get(p.id) || regMap.get(p.participant_id);
    const session = sessionMap.get(p.id);

    let score = null;
    let timeTakenSeconds = null;
    let status = 'NOT_ATTEMPTED';
    let startedAt = null;
    let submittedAt = null;

    if (session) {
      status = session.status;
      score = session.score ?? 0;
      startedAt = session.started_at;
      submittedAt = session.submitted_at;

      if (session.started_at && session.submitted_at) {
        const start = new Date(session.started_at).getTime();
        const end = new Date(session.submitted_at).getTime();
        timeTakenSeconds = Math.max(0, Math.round((end - start) / 1000));
      } else if (session.started_at && session.expires_at && session.status === 'EXPIRED') {
        const start = new Date(session.started_at).getTime();
        const end = new Date(session.expires_at).getTime();
        timeTakenSeconds = Math.max(0, Math.round((end - start) / 1000));
      }
    }

    rankedList.push({
      participant_id: p.participant_id || 'N/A',
      name: p.name || 'Anonymous',
      phone: p.phone || 'N/A',
      email: p.email || 'N/A',
      state: p.state || 'Kerala',
      status: status,
      score: score !== null ? score : -1, // -1 for not attempted
      time_taken_seconds: timeTakenSeconds !== null ? timeTakenSeconds : 999999,
      started_at: startedAt,
      submitted_at: submittedAt,
      payment_confirmed: reg?.payment_status === 'SUCCESS' || p.status === 'ACTIVE'
    });
  });

  // Sort rankedList:
  // 1. Submitted/Completed first
  // 2. Score DESC (50 to 0)
  // 3. Time taken ASC (fastest first)
  // 4. Earliest submitted_at ASC
  rankedList.sort((a, b) => {
    // Both submitted
    if (a.status === 'SUBMITTED' && b.status === 'SUBMITTED') {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      if (a.time_taken_seconds !== b.time_taken_seconds) {
        return a.time_taken_seconds - b.time_taken_seconds; // Faster time first
      }
      const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return aTime - bTime;
    }

    if (a.status === 'SUBMITTED') return -1;
    if (b.status === 'SUBMITTED') return 1;

    // IN_PROGRESS before NOT_ATTEMPTED
    if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
    if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;

    // By score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return 0;
  });

  // Assign ranks
  let currentRank = 1;
  const finalized = rankedList.map((item, idx) => {
    let rank = idx + 1;
    return {
      rank,
      ...item
    };
  });

  console.log('\n========================================================');
  console.log('🏆 TKFK GANDHI JAYANTI QUIZ 2026 — FULL RANKINGS LEADERBOARD');
  console.log('========================================================\n');

  console.table(finalized.map(f => ({
    Rank: `#${f.rank}`,
    ID: f.participant_id,
    Name: f.name.padEnd(25).substring(0, 25),
    Score: f.score >= 0 ? `${f.score}/50` : 'N/A',
    'Time Taken': f.time_taken_seconds < 999999 ? formatDuration(f.time_taken_seconds) : 'N/A',
    Status: f.status,
    'Submitted At': formatIST(f.submitted_at)
  })));

  return finalized;
}

main().catch(console.error);
