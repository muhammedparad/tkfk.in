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
  // Check if there are other tables like audit_logs, proctoring_logs, etc.
  const { data: tables, error } = await supabase.rpc('get_tables');
  console.log('RPC tables:', tables, error?.message);

  // Let's check audit_logs or proctoring_logs if any
  const { data: audit, error: aErr } = await supabase.from('audit_logs').select('*').limit(5);
  console.log('Audit logs sample:', audit?.length, aErr?.message);

  const { data: proc, error: pErr } = await supabase.from('proctoring_logs').select('*').limit(5);
  console.log('Proctoring logs sample:', proc?.length, pErr?.message);
}

main().catch(console.error);
