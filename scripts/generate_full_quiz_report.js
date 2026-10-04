const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateFullReport() {
  // 1. Total participants
  const { data: allParticipants, error: pErr } = await supabase
    .from('participants')
    .select(`
      id,
      name,
      email,
      phone,
      participant_id,
      state,
      college,
      status,
      created_at,
      registrations (
        payment_status,
        registration_status,
        amount
      )
    `);

  // 2. All quiz sessions
  const { data: allSessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select(`
      id,
      participant_id,
      started_at,
      expires_at,
      submitted_at,
      status,
      score,
      total_questions,
      created_at,
      participants (
        id,
        name,
        email,
        phone,
        participant_id,
        state,
        college
      )
    `)
    .order('score', { ascending: false });

  if (pErr || sErr) {
    console.error('Error fetching data:', pErr || sErr);
    return;
  }

  const confirmedParticipants = allParticipants.filter(p => {
    const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
    return p.status === 'ACTIVE' || reg?.payment_status === 'SUCCESS' || reg?.registration_status === 'CONFIRMED' || p.participant_id;
  });

  const submittedSessions = allSessions.filter(s => s.status === 'SUBMITTED' || s.status === 'EXPIRED');
  const inProgressSessions = allSessions.filter(s => s.status === 'IN_PROGRESS');

  // Sort submitted by score DESC, then duration ASC
  submittedSessions.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const durA = a.submitted_at ? (new Date(a.submitted_at) - new Date(a.started_at)) : 9999999;
    const durB = b.submitted_at ? (new Date(b.submitted_at) - new Date(b.started_at)) : 9999999;
    return durA - durB;
  });

  console.log(JSON.stringify({
    totalRegistered: allParticipants.length,
    totalConfirmed: confirmedParticipants.length,
    totalAttempted: allSessions.length,
    submittedCount: submittedSessions.length,
    inProgressCount: inProgressSessions.length,
    submitted: submittedSessions.map((s, idx) => {
      const p = s.participants || {};
      const start = new Date(s.started_at);
      const submit = s.submitted_at ? new Date(s.submitted_at) : null;
      const durationSecs = submit ? Math.max(0, Math.round((submit - start) / 1000)) : 0;
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      return {
        rank: idx + 1,
        participantId: p.participant_id || 'N/A',
        name: p.name || 'Unknown',
        phone: p.phone || 'N/A',
        state: p.state || 'Kerala',
        score: s.score,
        totalQuestions: s.total_questions || 50,
        durationSeconds: durationSecs,
        durationFormatted: `${mins}m ${secs}s`,
        submittedAtIST: submit ? submit.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'
      };
    }),
    inProgress: inProgressSessions.map((s, idx) => {
      const p = s.participants || {};
      const start = new Date(s.started_at);
      const elapsedSecs = Math.max(0, Math.round((Date.now() - start) / 1000));
      const mins = Math.floor(elapsedSecs / 60);
      const secs = elapsedSecs % 60;
      return {
        index: idx + 1,
        participantId: p.participant_id || 'N/A',
        name: p.name || 'Unknown',
        phone: p.phone || 'N/A',
        state: p.state || 'Kerala',
        startedAtIST: start.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
        elapsedFormatted: `${mins}m ${secs}s`
      };
    })
  }, null, 2));
}

generateFullReport();
