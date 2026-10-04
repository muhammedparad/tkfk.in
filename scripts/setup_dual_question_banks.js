const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const previousContent = execSync('git show d69e0b1:src/data/questions.ts', { encoding: 'utf8' });
const matchPrev = previousContent.match(/export const OFFICIAL_50_QUESTIONS: Question\[\] = (\[[\s\S]*?\]);/);
if (!matchPrev) throw new Error('Could not parse previous questions');
const previousQuestions = JSON.parse(matchPrev[1]);

const currentContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'questions.ts'), 'utf8');
const matchCurr = currentContent.match(/export const OFFICIAL_50_QUESTIONS: Question\[\] = (\[[\s\S]*?\]);/);
if (!matchCurr) throw new Error('Could not parse current questions');
const currentQuestions = JSON.parse(matchCurr[1]);

const output = [
  "import { Question } from '@/types';",
  "",
  "/**",
  " * 1. PREVIOUS ORIGINAL 4:00 PM QUESTION BANK (50 Questions)",
  " * Official 50 module questions used during the original 4:00 PM examination session.",
  " */",
  `export const PREVIOUS_ORIGINAL_50_QUESTIONS: Question[] = ${JSON.stringify(previousQuestions, null, 2)};`,
  "",
  "/**",
  " * 2. CURRENT / RE-CONDUCT QUESTION BANK (50 Questions)",
  " * Official 50 bilingual questions used during the 7:00 PM make-up examination session.",
  " */",
  `export const CURRENT_RECONDUCT_50_QUESTIONS: Question[] = ${JSON.stringify(currentQuestions, null, 2)};`,
  "",
  "/**",
  " * Default Active Question Set",
  " */",
  "export const OFFICIAL_50_QUESTIONS: Question[] = CURRENT_RECONDUCT_50_QUESTIONS;",
  "",
  "/**",
  " * Admin Accessible Question Banks",
  " */",
  "export const ADMIN_QUESTION_BANKS = {",
  "  current: {",
  "    id: 'current',",
  "    name: 'Re-conduct Session Question Bank (7:00 PM)',",
  "    description: 'Current 50 bilingual questions used for re-conduct',",
  "    questions: CURRENT_RECONDUCT_50_QUESTIONS",
  "  },",
  "  previous: {",
  "    id: 'previous',",
  "    name: 'Previous Original Question Bank (4:00 PM)',",
  "    description: 'Original 50 module questions from 4:00 PM session',",
  "    questions: PREVIOUS_ORIGINAL_50_QUESTIONS",
  "  }",
  "};",
  ""
].join('\n');

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'questions.ts'), output, 'utf8');
console.log('✅ Generated src/data/questions.ts successfully!');
