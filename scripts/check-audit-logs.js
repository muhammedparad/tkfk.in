const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_id', '7539a058-1daf-4346-ae12-927b8e35b90f');
  console.log('Audit logs for session:', logs);
}

run();
