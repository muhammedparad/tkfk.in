const fs = require('fs');
const path = require('path');
const recon = JSON.parse(fs.readFileSync(path.join(__dirname, 'master_reconciliation_results.json'), 'utf8'));

console.log('Reconciliation groups count:');
console.log('Category 1 (Submitted With Answers):', recon.categories.submitted_with_answers.count);
console.log('Category 2 (Submitted With 0 Answers):', recon.categories.submitted_zero_answers.count);
console.log('Category 3 (In Progress With 0 Answers):', recon.categories.in_progress_zero_answers.count);

console.log('\nSubmitted With 0 Answers:');
recon.categories.submitted_zero_answers.participants.forEach(p => {
  console.log(`- ${p.participant_id} | ${p.name} | ${p.phone}`);
});

console.log('\nIn Progress With 0 Answers:');
recon.categories.in_progress_zero_answers.participants.forEach(p => {
  console.log(`- ${p.participant_id} | ${p.name} | ${p.phone}`);
});
