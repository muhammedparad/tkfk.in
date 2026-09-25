-- =========================================================================
-- Gandhi Knowledge Challenge 2026 (TKFK) — Migration: Supabase Auth & Phone Lifecycle
-- =========================================================================

-- 1. ADD NORMALIZED_PHONE AND UNIQUE CONSTRAINT TO PARTICIPANTS TABLE
ALTER TABLE public.participants 
  ADD COLUMN IF NOT EXISTS normalized_phone TEXT,
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill normalized_phone if existing rows exist
UPDATE public.participants 
SET normalized_phone = REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
WHERE normalized_phone IS NULL;

-- Make normalized_phone NOT NULL and UNIQUE after backfill
ALTER TABLE public.participants 
  ALTER COLUMN normalized_phone SET NOT NULL;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_normalized_phone'
    ) THEN 
        ALTER TABLE public.participants ADD CONSTRAINT unique_normalized_phone UNIQUE (normalized_phone);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_participants_normalized_phone ON public.participants(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_participants_auth_user ON public.participants(auth_user_id);

-- 2. INITIALIZE SYSTEM CONFIGURATION FOR STUDY MATERIAL RESOURCE
INSERT INTO public.system_config (key, value)
VALUES (
  'study_material',
  '{
    "url": "/study",
    "type": "resource_link",
    "title": "Official Gandhi Knowledge Challenge 2026 Preparation Modules"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 3. ENABLE RLS & POLICIES
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Participant self-access policy
CREATE POLICY "Participants can view their own record"
ON public.participants FOR SELECT
USING (auth.uid() = auth_user_id);

CREATE POLICY "Participants can view their own registrations"
ON public.registrations FOR SELECT
USING (
  participant_id IN (
    SELECT id FROM public.participants WHERE auth_user_id = auth.uid()
  )
);
