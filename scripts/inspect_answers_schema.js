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
  const { data: answers, error } = await supabase
    .from('quiz_answers')
    .select('*')
    .limit(10);
    
  if (error) {
    console.error('Error fetching quiz_answers:', error);
    return;
  }
  console.log('Sample 10 quiz_answers records:');
  console.log(JSON.stringify(answers, null, 2));

  // Also check if quiz_sessions has any json metadata or answers field
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .limit(2);
  console.log('Sample 2 quiz_sessions records:');
  console.log(JSON.stringify(sessions, null, 2));
}

main().catch(console.error);
