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

async function main() {
  // Let's inspect all answers for the Malayalam session participants!
  // From yesterday's audit: who were the Malayalam participants?
  // Let's run a query to get all Malayalam sessions (started_at < 2026-10-04T13:00:00.000Z)
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*, participants(name, participant_id, phone)')
    .lt('started_at', '2026-10-04T13:00:00.000Z')
    .order('started_at', { ascending: false });

  console.log(`Found ${sessions.length} Malayalam sessions.`);

  for (const s of sessions) {
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('session_id', s.id)
      .order('updated_at', { ascending: true });

    console.log(`\n========================================`);
    console.log(`Participant: ${s.participants?.name} (${s.participants?.participant_id})`);
    console.log(`Session ID: ${s.id}`);
    console.log(`Started: ${s.started_at} | Submitted: ${s.submitted_at}`);
    console.log(`Total answers saved: ${answers?.length}`);
    if (answers && answers.length > 0) {
      console.log(`First answer at: ${answers[0].updated_at}`);
      console.log(`Last answer at: ${answers[answers.length - 1].updated_at}`);
      // Show sample of first 5 answers
      console.log('Sample answers:', answers.slice(0, 5).map(a => ({
        qId: a.question_id,
        opt: a.selected_option,
        time: a.updated_at
      })));
    }
  }
}

main().catch(console.error);
