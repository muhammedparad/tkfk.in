import { Question } from '@/types';

/**
 * Empty Question Banks for Clean State
 */
export const PREVIOUS_ORIGINAL_50_QUESTIONS: Question[] = [];
export const CURRENT_RECONDUCT_50_QUESTIONS: Question[] = [];
export const OFFICIAL_50_QUESTIONS: Question[] = [];

/**
 * Admin Accessible Question Banks
 */
export const ADMIN_QUESTION_BANKS = {
  current: {
    id: 'current',
    name: 'Current Question Bank',
    description: 'Current questions',
    questions: CURRENT_RECONDUCT_50_QUESTIONS
  },
  previous: {
    id: 'previous',
    name: 'Previous Question Bank',
    description: 'Previous questions',
    questions: PREVIOUS_ORIGINAL_50_QUESTIONS
  }
};
