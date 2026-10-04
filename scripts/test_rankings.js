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
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s (${seconds}s)`;
}

async function run() {
  const { data: participants } = await supabase.from('participants').select('*');
  const { data: registrations } = await supabase.from('registrations').select('*');
  const { data: sessions } = await supabase.from('quiz_sessions').select('*').order('started_at', { ascending: false });

  const regMap = new Map();
  registrations?.forEach(r => {
    regMap.set(r.participant_id, r);
  });

  const sessionMap = new Map();
  // Get best/submitted session per participant
  sessions?.forEach(s => {
    const pId = s.participant_id;
    const existing = sessionMap.get(pId);
    if (!existing) {
      sessionMap.set(pId, s);
    } else {
      if (s.status === 'SUBMITTED' && existing.status !== 'SUBMITTED') {
        sessionMap.set(pId, s);
      } else if (s.status === 'SUBMITTED' && existing.status === 'SUBMITTED') {
        // Pick highest score or latest
        if ((s.score || 0) > (existing.score || 0)) {
          sessionMap.set(pId, s);
        } else if ((s.score || 0) === (existing.score || 0) && new Date(s.started_at) > new Date(existing.started_at)) {
          sessionMap.set(pId, s);
        }
      }
    }
  });

  const submittedList = [];
  const otherList = [];

  participants?.forEach(p => {
    if (p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in')) return;

    const s = sessionMap.get(p.id);
    const reg = regMap.get(p.id) || regMap.get(p.participant_id);

    if (s && (s.status === 'SUBMITTED' || s.status === 'EXPIRED')) {
      let timeTakenSec = 0;
      if (s.started_at && s.submitted_at) {
        timeTakenSec = Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      } else if (s.started_at && s.expires_at) {
        timeTakenSec = Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000));
      }

      submittedList.push({
        participant_id: p.participant_id || 'N/A',
        name: p.name || 'Anonymous',
        phone: p.phone || 'N/A',
        email: p.email || 'N/A',
        state: p.state || 'Kerala',
        score: s.score ?? 0,
        time_taken_seconds: timeTakenSec,
        started_at: s.started_at,
        submitted_at: s.submitted_at,
        status: s.status,
        session_id: s.id
      });
    } else if (s && s.status === 'IN_PROGRESS') {
      otherList.push({
        participant_id: p.participant_id || 'N/A',
        name: p.name || 'Anonymous',
        phone: p.phone || 'N/A',
        email: p.email || 'N/A',
        state: p.state || 'Kerala',
        score: s.score ?? 0,
        time_taken_seconds: 999999,
        started_at: s.started_at,
        submitted_at: null,
        status: 'IN_PROGRESS',
        session_id: s.id
      });
    } else {
      otherList.push({
        participant_id: p.participant_id || 'N/A',
        name: p.name || 'Anonymous',
        phone: p.phone || 'N/A',
        email: p.email || 'N/A',
        state: p.state || 'Kerala',
        score: 0,
        time_taken_seconds: 999999,
        started_at: null,
        submitted_at: null,
        status: 'NOT_ATTEMPTED',
        session_id: null
      });
    }
  });

  // Sort submitted list:
  // 1. Score DESC (50 -> 0)
  // 2. time_taken_seconds ASC (0s -> 1500s)
  // 3. submitted_at ASC (earlier submission first)
  submittedList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.time_taken_seconds !== b.time_taken_seconds) return a.time_taken_seconds - b.time_taken_seconds;
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return aTime - bTime;
  });

  console.log(`\n======================================================`);
  console.log(`🏆 EVALUATED SUBMITTED PARTICIPANTS (${submittedList.length} total)`);
  console.log(`======================================================\n`);

  submittedList.forEach((item, idx) => {
    item.rank = idx + 1;
    console.log(
      `Rank #${String(item.rank).padStart(2, ' ')} | ` +
      `ID: ${item.participant_id} | ` +
      `Score: ${String(item.score).padStart(2, ' ')}/50 | ` +
      `Time: ${formatDuration(item.time_taken_seconds).padEnd(18, ' ')} | ` +
      `Name: ${item.name}`
    );
  });

  console.log(`\n======================================================`);
  console.log(`⏳ IN_PROGRESS / NOT ATTEMPTED (${otherList.length} total)`);
  console.log(`======================================================\n`);
  otherList.forEach((item, idx) => {
    item.rank = submittedList.length + idx + 1;
    console.log(
      `Rank #${String(item.rank).padStart(2, ' ')} | ` +
      `ID: ${(item.participant_id || 'N/A').padEnd(14, ' ')} | ` +
      `Status: ${item.status.padEnd(14, ' ')} | ` +
      `Name: ${item.name}`
    );
  });
}

run().catch(console.error);
