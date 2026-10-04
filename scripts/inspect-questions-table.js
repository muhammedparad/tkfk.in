const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectQuestionsTable() {
  const { data: questions, error } = await supabase.from('questions').select('*').limit(5);
  console.log('Sample questions in Supabase:', questions, 'Error:', error);
}

inspectQuestionsTable();
