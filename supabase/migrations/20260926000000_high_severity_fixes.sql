-- =========================================================================
-- Gandhi Knowledge Challenge 2026 (TKFK) — Migration: High Severity Fixes
-- =========================================================================

-- 1. Unique constraint on quiz_sessions(participant_id) to prevent duplicate sessions (Issue 13)
ALTER TABLE public.quiz_sessions 
ADD CONSTRAINT quiz_sessions_participant_id_key UNIQUE (participant_id);

-- 2. Frozen Quiz Session Questions table (Issues 11 & 12)
CREATE TABLE IF NOT EXISTS public.quiz_session_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_id),
    UNIQUE(session_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_quiz_session_questions_session ON public.quiz_session_questions(session_id);

-- 3. Persistent Rate Limits table for distributed rate limiting (Issue 22)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_ts ON public.rate_limits(key, timestamp);

-- 4. Enable RLS on new tables
ALTER TABLE public.quiz_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY service_role_all_quiz_session_questions ON public.quiz_session_questions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_rate_limits ON public.rate_limits FOR ALL USING (auth.role() = 'service_role');
