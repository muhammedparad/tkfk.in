const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

function questionIdToUuid(qId) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qId)) {
    return qId;
  }
  const num = parseInt(qId.replace(/[^0-9]/g, ''), 10) || 1;
  return `00000000-0000-0000-0000-${String(num).padStart(12, '0')}`;
}

async function seed() {
  // Read src/data/questions.ts content and extract OFFICIAL_50_QUESTIONS
  const qTs = fs.readFileSync('src/data/questions.ts', 'utf8');
  // Use tsx or evaluate
  const { execSync } = require('child_process');
  
  // Or parse JSON if exported or require via tsx
  console.log('Connecting to Supabase...');
  
  // Let's create questions directly from questions.ts using tsx eval
}

seed();
