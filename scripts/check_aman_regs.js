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
  const { data: regs } = await supabase.from('registrations').select('*').eq('phone', '9847513564');
  console.log('Registrations for 9847513564:', regs);

  const { data: regsEmail } = await supabase.from('registrations').select('*').eq('email', 'zakirhusain815380@gmail.com');
  console.log('Registrations for zakirhusain815380@gmail.com:', regsEmail);
}

main().catch(console.error);
