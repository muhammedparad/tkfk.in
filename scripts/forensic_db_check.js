const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function inspectAllTables() {
  const tables = [
    'participants',
    'registrations',
    'quiz_sessions',
    'quiz_answers',
    'questions',
    'audit_logs',
    'proctoring_logs',
    'proctoring_events',
    'proctoring_frames',
    'proctoring_streams',
    'payment_transactions',
    'certificates',
    'referral_codes',
    'results',
    'submissions',
    'answers'
  ];

  console.log('=== CHECKING ALL TABLES IN SUPABASE ===\n');
  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(3);
      if (error) {
        console.log(`Table '${t}': NOT FOUND or ERROR -> ${error.message} (code: ${error.code})`);
      } else {
        console.log(`Table '${t}': EXISTS -> ${count} total rows.`);
        if (data && data.length > 0) {
          console.log(`   Columns:`, Object.keys(data[0]));
          console.log(`   Sample:`, JSON.stringify(data[0], null, 2));
        }
      }
    } catch (e) {
      console.log(`Table '${t}': EXCEPTION -> ${e.message}`);
    }
  }
}

inspectAllTables();
