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
  const emails = ['mikkumikdadm@gmail.com', 'muhammadswalihk786@gmail.com', 'afthahashraf1@gmail.com'];
  const phones = ['8197151893', '6238781368', '7306382462'];

  const { data: allP } = await supabase.from('participants').select('*').in('phone', phones);
  console.log('All matching participants by phone:', allP);

  const { data: allPByEmail } = await supabase.from('participants').select('*').in('email', emails);
  console.log('All matching participants by email:', allPByEmail);
}

main().catch(console.error);
