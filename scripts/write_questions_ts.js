const fs = require('fs');
const path = require('path');
const qList = require('./full_50_bilingual_questions.json');

const targetPath = path.join(__dirname, '..', 'src', 'data', 'questions.ts');
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const content = `import { Question } from '@/types';

export const OFFICIAL_50_QUESTIONS: Question[] = ${JSON.stringify(qList, null, 2)};
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully wrote to:', targetPath);
