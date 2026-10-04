const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=');
  return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
}));

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const candidateList = [
  { publicId: 'TKFK26-835601', name: 'Miqdad Ali' },
  { publicId: 'TKFK26-649383', name: 'Ahmed Ismail' },
  { publicId: 'TKFK26-225133', name: 'Nidhafathima' },
  { publicId: 'TKFK26-514226', name: 'BYEZID ALI' },
  { publicId: 'TKFK26-884644', name: 'Muhammad Anas' },
  { publicId: 'TKFK26-102315', name: 'Mohammad Aadil S K' },
  { publicId: 'TKFK26-192628', name: 'Mohammed Rafi Haq' },
  { publicId: 'TKFK26-296559', name: 'Fathimathul Shaja PP' },
  { publicId: 'TKFK26-106511', name: 'Muhammad Nashath' },
  { publicId: 'TKFK26-772260', name: 'Rishan Alathiyur' },
  { publicId: 'TKFK26-707431', name: 'Muhammad Shahinsha' },
  { publicId: 'TKFK26-746740', name: 'Muhammad Sinan' },
  { publicId: 'TKFK26-345185', name: 'ALOOF AP' },
  { publicId: 'TKFK26-544046', name: 'MUHAMMED SWALIH K' },
  { publicId: 'TKFK26-336147', name: 'SUBAIDA P' },
  { publicId: 'TKFK26-539061', name: 'AYISHA RAFA T P' },
  { publicId: 'TKFK26-476039', name: 'ABDUL BASITH. K' },
  { publicId: 'TKFK26-918545', name: 'Muhammed Habeeb' },
  { publicId: 'TKFK26-510149', name: 'Muhammad Hafeef' },
  { publicId: 'TKFK26-516234', name: 'Muhammed Aflah K' },
  { publicId: 'TKFK26-810934', name: 'Fathima Ashique' },
  { publicId: 'TKFK26-536605', name: 'FASAL RAHMAN P' },
  { publicId: 'TKFK26-589280', name: 'മുഹമ്മദ് ഷാഫി' },
  { publicId: 'TKFK26-180939', name: 'Ayshath Rabeea AM' },
  { publicId: 'TKFK26-878266', name: 'Abdul Aman R' },
  { publicId: 'TKFK26-343409', name: 'Bazil Aboobacker B C' },
  { publicId: 'TKFK26-680020', name: 'MUHAMMED RAFI E' },
  { publicId: 'TKFK26-998840', name: 'Kadeejath Jamseela C H' },
  { publicId: 'TKFK26-371033', name: 'Ahmad Ameen' },
  { publicId: 'TKFK26-715335', name: 'Anshiba M' },
  { publicId: 'TKFK26-729150', name: 'Ramjan Ali' },
  { publicId: 'TKFK26-470330', name: 'Hadhir Hameed KN' }
];

async function main() {
  console.log(`Starting authorization & reset for ${candidateList.length} specified candidates...\n`);

  // Fetch all existing participants
  const { data: allParticipants, error: pErr } = await supabase
    .from('participants')
    .select('*');

  if (pErr || !allParticipants) {
    console.error('Error fetching participants:', pErr);
    process.exit(1);
  }

  // Get current retry whitelist
  const { data: configData } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'allowed_quiz_retries')
    .maybeSingle();

  let whitelist = (configData?.value?.allowedIds) || [];
  console.log(`Initial retry whitelist count: ${whitelist.length}`);

  const processed = [];
  const notFound = [];

  for (let idx = 0; idx < candidateList.length; idx++) {
    const item = candidateList[idx];
    const cleanId = item.publicId.trim().toUpperCase();

    // Find participant
    let p = allParticipants.find(p => p.participant_id && p.participant_id.trim().toUpperCase() === cleanId);
    if (!p) {
      // Try searching by name match if ID wasn't exact
      p = allParticipants.find(p => p.name && p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
    }

    if (!p) {
      console.warn(`[NOT FOUND] Candidate #${idx + 1}: ${item.publicId} - ${item.name}`);
      notFound.push(item);
      continue;
    }

    console.log(`\nCandidate #${idx + 1}: ${p.name} (Public ID: ${p.participant_id}, UUID: ${p.id}, Phone: ${p.phone})`);

    // 1. Add to whitelist (both UUID and Public ID and Phone)
    if (!whitelist.includes(p.id)) whitelist.push(p.id);
    if (p.participant_id && !whitelist.includes(p.participant_id)) whitelist.push(p.participant_id);
    if (p.phone && !whitelist.includes(p.phone)) whitelist.push(p.phone);

    // 2. Find and reset existing quiz sessions
    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('id, status, started_at, score')
      .eq('participant_id', p.id);

    if (sessions && sessions.length > 0) {
      const sIds = sessions.map(s => s.id);
      await supabase.from('quiz_answers').delete().in('session_id', sIds);
      await supabase.from('quiz_session_questions').delete().in('session_id', sIds);
      await supabase.from('quiz_sessions').delete().eq('participant_id', p.id);
      console.log(`  -> Cleared ${sessions.length} prior session(s) & answers.`);
    } else {
      console.log(`  -> No prior session found (clean state).`);
    }

    // 3. Ensure participant status is ACTIVE
    await supabase.from('participants').update({ status: 'ACTIVE' }).eq('id', p.id);

    processed.push({
      index: idx + 1,
      name: p.name,
      publicId: p.participant_id,
      phone: p.phone,
      uuid: p.id
    });
  }

  // Save updated whitelist
  const { error: cfgErr } = await supabase
    .from('system_config')
    .upsert({
      key: 'allowed_quiz_retries',
      value: { allowedIds: whitelist }
    }, { onConflict: 'key' });

  if (cfgErr) {
    console.error('Error saving updated whitelist:', cfgErr);
  } else {
    console.log(`\nSuccessfully updated retry whitelist in system_config! Total whitelisted entries: ${whitelist.length}`);
  }

  console.log(`\n======================================================`);
  console.log(`SUMMARY: ${processed.length} candidates unlocked for 2nd attempt.`);
  console.log(`Not found: ${notFound.length}`);
  console.log(`======================================================`);
}

main();
