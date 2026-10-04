const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckupfbdoedhidncbwmfc.supabase.co';
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdXBmYmRvZWRoaWRuY2J3bWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE4Mjc2NCwiZXhwIjoyMTA1NzU4NzY0fQ.rZFg0xZyPgLGONn8of16EohvoUavfaQP-YqcWfAj-vw';

const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const key = k.trim();
    const val = v.join('=').trim().replace(/^["']|["']$/g, '');
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_URL') supabaseUrl = val;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'SUPABASE_SECRET_KEY') serviceKey = val;
  }
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function deleteAllQuizSubmissions() {
  console.log('=== DELETING ALL SUBMITTED QUIZ ENTRIES & SESSIONS ===');

  // 1. Delete all quiz answers
  console.log('1. Deleting all quiz_answers...');
  const { error: ansErr, count: ansCount } = await supabase
    .from('quiz_answers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows
  if (ansErr) console.error('Error deleting quiz_answers:', ansErr);
  else console.log('quiz_answers deleted successfully.');

  // 2. Delete all quiz session questions (if exists)
  console.log('2. Deleting all quiz_session_questions if present...');
  try {
    const { error: sqErr } = await supabase
      .from('quiz_session_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (sqErr) console.log('quiz_session_questions note:', sqErr.message);
    else console.log('quiz_session_questions deleted.');
  } catch (e) {
    console.log('quiz_session_questions table skipped/not present.');
  }

  // 3. Delete all certificates
  console.log('3. Deleting all certificates...');
  const { error: certErr } = await supabase
    .from('certificates')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (certErr) console.error('Error deleting certificates:', certErr);
  else console.log('certificates deleted successfully.');

  // 4. Delete all quiz sessions
  console.log('4. Deleting all quiz_sessions...');
  const { error: sessErr } = await supabase
    .from('quiz_sessions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (sessErr) console.error('Error deleting quiz_sessions:', sessErr);
  else console.log('quiz_sessions deleted successfully.');

  // 5. Verify clean state
  console.log('\n=== VERIFICATION ===');
  const { count: finalSessionCount } = await supabase.from('quiz_sessions').select('*', { count: 'exact', head: true });
  const { count: finalAnswerCount } = await supabase.from('quiz_answers').select('*', { count: 'exact', head: true });
  const { count: finalCertCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true });
  const { count: participantCount } = await supabase.from('participants').select('*', { count: 'exact', head: true });
  const { count: registrationCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });

  console.log(`Quiz Sessions remaining: ${finalSessionCount}`);
  console.log(`Quiz Answers remaining: ${finalAnswerCount}`);
  console.log(`Certificates remaining: ${finalCertCount}`);
  console.log(`Registered Participants intact: ${participantCount}`);
  console.log(`Registrations intact: ${registrationCount}`);
}

deleteAllQuizSubmissions().catch(console.error);
