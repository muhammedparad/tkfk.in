-- =========================================================================
-- Gandhi Knowledge Challenge 2026 (TKFK) — Supabase PostgreSQL Database Schema
-- =========================================================================

-- Enable pgcrypto / uuid extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id TEXT UNIQUE, -- GKC2026-XXXXXX (assigned upon confirmed payment)
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    normalized_phone TEXT UNIQUE NOT NULL,
    college TEXT,
    state TEXT NOT NULL DEFAULT 'Kerala',
    city TEXT,
    referral_code TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'BLOCKED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_id ON public.participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_phone ON public.participants(phone);
CREATE INDEX IF NOT EXISTS idx_participants_normalized_phone ON public.participants(normalized_phone);

-- 2. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    registration_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (registration_status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'MANUAL_REVIEW')),
    payment_reference TEXT,
    amount INTEGER NOT NULL DEFAULT 99,
    currency TEXT NOT NULL DEFAULT 'INR',
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_participant ON public.registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);

-- 3. REFERRAL CODES TABLE
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    category TEXT DEFAULT 'Gandhi History',
    difficulty TEXT DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUIZ SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID UNIQUE REFERENCES public.participants(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED')),
    score INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    total_questions INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_participant ON public.quiz_sessions(participant_id);

-- 5b. FROZEN QUIZ SESSION QUESTIONS TABLE
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

-- 6. QUIZ ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- 7. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_code TEXT UNIQUE NOT NULL,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    verification_hash TEXT NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    grade TEXT NOT NULL
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SYSTEM CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure is_public column exists if table was pre-existing
ALTER TABLE public.system_config ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- 10. ADMIN ROLES TABLE
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'auditor')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_order_id TEXT UNIQUE,
    provider_payment_id TEXT UNIQUE,
    provider_event_id TEXT UNIQUE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 99.00 CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'MANUAL_REVIEW')),
    provider_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    last_webhook_at TIMESTAMPTZ
);

-- 13. PAYMENT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_ts ON public.rate_limits(key, timestamp);

-- Insert Default Controlled Results Release config
INSERT INTO public.system_config (key, value, is_public)
VALUES ('results_release', '{"published": false, "note": "Results awaiting verification by TKFK officials"}'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Questions View (Restricted to server-side/authenticated quiz session)
CREATE OR REPLACE VIEW public.client_questions AS
SELECT id, question_text, option_a, option_b, option_c, option_d, category, difficulty
FROM public.questions;

-- REVOKE public access to client_questions view to protect question bank
REVOKE SELECT ON public.client_questions FROM anon;

-- System Config RLS: Expose only deliberate public configuration values
DROP POLICY IF EXISTS "Public can view system config" ON public.system_config;
DROP POLICY IF EXISTS "Public can view public system config" ON public.system_config;
CREATE POLICY "Public can view public system config" ON public.system_config FOR SELECT USING (is_public = true OR key IN ('results_release', 'study_material'));

-- Certificates RLS: Only participant can view their certificate, or public verification by certificate code
DROP POLICY IF EXISTS "Participants can view their own certificate" ON public.certificates;
CREATE POLICY "Participants can view their own certificate" ON public.certificates FOR SELECT USING (
    participant_id IN (SELECT id FROM public.participants WHERE auth_user_id = auth.uid())
);

-- Service Role full access policies
DROP POLICY IF EXISTS service_role_all_payment_transactions ON public.payment_transactions;
CREATE POLICY service_role_all_payment_transactions ON public.payment_transactions FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_all_payment_events ON public.payment_events;
CREATE POLICY service_role_all_payment_events ON public.payment_events FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_all_quiz_session_questions ON public.quiz_session_questions;
CREATE POLICY service_role_all_quiz_session_questions ON public.quiz_session_questions FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_all_rate_limits ON public.rate_limits;
CREATE POLICY service_role_all_rate_limits ON public.rate_limits FOR ALL USING (auth.role() = 'service_role');
