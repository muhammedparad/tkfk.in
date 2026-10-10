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

async function fetchAll(table) {
  let allData = [];
  let page = 0;
  while (true) {
    const { data } = await supabase.from(table).select('*').range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < 1000) break;
    page++;
  }
  return allData;
}

async function main() {
  const allP = await fetchAll('participants');
  const allR = await fetchAll('registrations');
  const allS = await fetchAll('quiz_sessions');

  console.log(`Total Participants in DB: ${allP.length}`);
  console.log(`Total Registrations in DB: ${allR.length}`);
  console.log(`Total Quiz Sessions in DB: ${allS.length}`);

  // Identify suspicious/test/junk participants
  const testP = allP.filter(p => {
    const name = (p.name || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const phone = (p.phone || '');
    return (
      name.includes('test') ||
      name.includes('admin tester') ||
      name.includes('asdasd') ||
      name.includes('adfsghjk') ||
      name.includes('sadsdas') ||
      name.includes('wuu4') ||
      name.includes('juduieie') ||
      name.includes('jhh') ||
      name === 'asd' ||
      phone === '9999999999' ||
      phone === '2222222222' ||
      phone === '6546646464' ||
      phone === '7787878787' ||
      phone === '5473265325' ||
      phone === '2820043910' ||
      phone === '7888566843' ||
      p.participant_id === 'TKFK26-ADMIN99'
    );
  });

  console.log(`\nFound ${testP.length} test/junk participant records:`);
  testP.forEach(p => {
    console.log(`- ${p.id} | ${p.participant_id} | ${p.name} | ${p.phone} | ${p.email} | Status: ${p.status}`);
  });

  // Check junk registrations
  const testR = allR.filter(r => {
    const name = (r.name || '').toLowerCase();
    const phone = (r.phone || '');
    return (
      name.includes('test') ||
      name.includes('asdasd') ||
      name.includes('adfsghjk') ||
      name.includes('sadsdas') ||
      name.includes('wuu4') ||
      name.includes('juduieie') ||
      name.includes('jhh') ||
      name === 'asd' ||
      phone === '9999999999' ||
      phone === '2222222222' ||
      phone === '6546646464' ||
      phone === '7787878787' ||
      phone === '5473265325' ||
      phone === '2820043910' ||
      phone === '7888566843'
    );
  });

  console.log(`\nFound ${testR.length} test/junk registration records:`);
  testR.forEach(r => {
    console.log(`- ${r.id} | ${r.name} | ${r.phone} | Status: ${r.registration_status} | Payment: ${r.payment_status}`);
  });
}

main().catch(console.error);
