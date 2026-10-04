const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', '458d633a-53b8-49d3-9098-ed7540485342')
    .single();

  console.log('Session detail:', session);

  const { data: answers } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('session_id', '458d633a-53b8-49d3-9098-ed7540485342');
  console.log('Answers count:', answers ? answers.length : 0, answers);
}

run();
