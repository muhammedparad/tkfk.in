const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectAnswers() {
  const { data: answers } = await supabase.from('quiz_answers').select('*');
  console.log('Total answers in DB:', answers ? answers.length : 0);
  if (answers && answers.length > 0) {
    console.log('Sample 10 answers:', answers.slice(0, 10));
    
    // Check which sessions have answers
    const bySession = {};
    for (const a of answers) {
      bySession[a.session_id] = (bySession[a.session_id] || 0) + 1;
    }
    console.log('Answers count per session:', bySession);
  }
}

inspectAnswers();
