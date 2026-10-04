-- Add bilingual Malayalam support columns to questions and quiz_session_questions tables

ALTER TABLE IF EXISTS public.questions 
  ADD COLUMN IF NOT EXISTS question_text_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_a_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_b_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_c_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_d_ml TEXT;

ALTER TABLE IF EXISTS public.quiz_session_questions 
  ADD COLUMN IF NOT EXISTS question_text_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_a_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_b_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_c_ml TEXT,
  ADD COLUMN IF NOT EXISTS option_d_ml TEXT;
