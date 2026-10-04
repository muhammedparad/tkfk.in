const fs = require('fs');
let code = fs.readFileSync('src/data/questions.ts', 'utf8');

code = code.replace(/"id":\s*"q-(\d+)"/g, (match, num) => {
  const pad = String(num).padStart(12, '0');
  return `"id": "00000000-0000-0000-0000-${pad}"`;
});

fs.writeFileSync('src/data/questions.ts', code, 'utf8');
console.log('Successfully updated questions.ts with UUIDs.');
