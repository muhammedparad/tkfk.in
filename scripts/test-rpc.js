const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testRpc() {
  // Let's test if we can run an RPC or query
  const { data, error } = await supabase.rpc('exec_sql', { query: 'ALTER TABLE public.quiz_answers ALTER COLUMN question_id TYPE TEXT;' });
  console.log('RPC result:', data, 'Error:', error);
}

testRpc();
