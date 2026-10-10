const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const conf = {};
lines.forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k) conf[k.trim()] = v.join('=').trim();
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(conf.NEXT_PUBLIC_SUPABASE_URL, conf.SUPABASE_SERVICE_ROLE_KEY || conf.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function clearData() {
  console.log('--- Starting Complete System Wipe (Leaving System Questions Intact) ---');

  // Deletion order to satisfy Foreign Key constraints:
  // 1. quiz_answers
  // 2. quiz_session_questions (if any)
  // 3. quiz_sessions
  // 4. certificates
  // 5. proctoring_logs (if any)
  // 6. audit_logs
  // 7. payment_transactions
  // 8. registrations
  // 9. participants

  const wipeSequence = [
    { table: 'quiz_answers', filter: 'id' },
    { table: 'quiz_session_questions', filter: 'id' },
    { table: 'quiz_sessions', filter: 'id' },
    { table: 'certificates', filter: 'id' },
    { table: 'proctoring_logs', filter: 'id' },
    { table: 'audit_logs', filter: 'id' },
    { table: 'payment_transactions', filter: 'id' },
    { table: 'registrations', filter: 'id' },
    { table: 'participants', filter: 'id' }
  ];

  for (const item of wipeSequence) {
    try {
      console.log(`Clearing ${item.table}...`);
      // Delete all records where id is not null
      const { error } = await supabase.from(item.table).delete().neq(item.filter, '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn(`Warning deleting ${item.table}:`, error.message);
        // Fallback: fetch IDs and delete in batches
        const { data: rows } = await supabase.from(item.table).select('id');
        if (rows && rows.length > 0) {
          const ids = rows.map(r => r.id);
          for (let i = 0; i < ids.length; i += 100) {
            const batch = ids.slice(i, i + 100);
            await supabase.from(item.table).delete().in('id', batch);
          }
          console.log(`Deleted ${rows.length} rows from ${item.table} via batch`);
        }
      } else {
        console.log(`Successfully cleared ${item.table}`);
      }
    } catch (e) {
      console.error(`Exception clearing ${item.table}:`, e.message);
    }
  }

  // Verification of final counts
  console.log('\n--- Final Database Table Verification ---');
  const verifyTables = [
    'participants',
    'registrations',
    'payment_transactions',
    'quiz_sessions',
    'quiz_answers',
    'certificates',
    'audit_logs',
    'questions'
  ];

  for (const t of verifyTables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`${t}: ${count} rows`);
  }
}

clearData();
