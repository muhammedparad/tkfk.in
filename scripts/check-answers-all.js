const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: allAnswers } = await supabase
    .from('quiz_answers')
    .select('session_id, question_id, selected_option, updated_at');
  
  console.log('Total answers recorded across all sessions:', allAnswers ? allAnswers.length : 0);
  if (allAnswers && allAnswers.length > 0) {
    const bySession = {};
    for (const a of allAnswers) {
      bySession[a.session_id] = (bySession[a.session_id] || 0) + 1;
    }
    console.log('Answers per session:', bySession);
  }

  const { data: frozenQuestions } = await supabase
    .from('quiz_session_questions')
    .select('session_id, question_id')
    .eq('session_id', '58730bb5-2f9a-430b-a12f-25598d7cbdf2');

  console.log('Frozen questions for Ramjan Ali session:', frozenQuestions ? frozenQuestions.length : 0);
}

run();
