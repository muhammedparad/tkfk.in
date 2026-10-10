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
  console.log('--- PURGING TEST & JUNK PARTICIPANTS FROM DATABASE ---');

  const testIds = [
    'b94bf3a2-8537-4748-83bd-ff1cbd561154', // Wuu4
    '40a1603e-cef4-4ad2-a08b-3a2743ad197a', // adFSGHJK
    '04a8c7d3-4f49-4e2c-9d47-cedf0b6c2bcd', // Juduieie
    '8d812905-d84e-4530-95c2-481607577e3c', // sadsdas
    '6dc8014b-96fa-405a-9b31-8f33fc212069', // asd
    '57b04075-5038-4e61-ad82-bc2a16f6f385', // jhh
    'fe770b28-4543-4483-879a-417995d3cd6a'  // TKFK Admin Tester
  ];

  // 1. Delete quiz sessions for test accounts
  const { error: sErr } = await supabase.from('quiz_sessions').delete().in('participant_id', testIds);
  if (sErr) console.error('Error deleting test quiz sessions:', sErr);
  else console.log('✅ Deleted test quiz sessions');

  // 2. Delete registrations for test accounts
  const { error: rErr } = await supabase.from('registrations').delete().in('participant_id', testIds);
  if (rErr) console.error('Error deleting test registrations:', rErr);
  else console.log('✅ Deleted test registrations');

  // 3. Delete participant rows for test accounts
  const { error: pErr } = await supabase.from('participants').delete().in('id', testIds);
  if (pErr) console.error('Error deleting test participants:', pErr);
  else console.log('✅ Deleted test participants');

  console.log('✅ Mock & junk test data purge complete!');
}

main().catch(console.error);
