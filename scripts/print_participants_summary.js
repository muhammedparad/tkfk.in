const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select(`
      id,
      started_at,
      expires_at,
      submitted_at,
      status,
      score,
      total_questions,
      participants (
        id,
        name,
        email,
        phone,
        participant_id,
        state
      )
    `)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  const submitted = sessions.filter(s => s.status === 'SUBMITTED' || s.status === 'EXPIRED');
  const inProgress = sessions.filter(s => s.status === 'IN_PROGRESS');

  console.log('=== SUBMITTED PARTICIPANTS (' + submitted.length + ') ===');
  submitted.forEach((s, idx) => {
    const p = s.participants || {};
    const startTime = new Date(s.started_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    const submitTime = s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A';
    const duration = s.submitted_at ? Math.round((new Date(s.submitted_at) - new Date(s.started_at)) / 1000) : 0;
    console.log(`${idx + 1}. [${p.participant_id || 'NO_ID'}] ${p.name || 'Unknown'} (Phone: ${p.phone || 'N/A'}) - Score: ${s.score}/50, Duration: ${duration}s, Submitted: ${submitTime} IST`);
  });

  console.log('\n=== CURRENTLY IN PROGRESS (' + inProgress.length + ') ===');
  inProgress.forEach((s, idx) => {
    const p = s.participants || {};
    const startTime = new Date(s.started_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`${idx + 1}. [${p.participant_id || 'NO_ID'}] ${p.name || 'Unknown'} (Phone: ${p.phone || 'N/A'}) - Started: ${startTime} IST`);
  });
}

run();
