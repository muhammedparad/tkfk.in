-- Migration: Secure System Configuration Table RLS Policy & Column

CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_config
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark public configuration keys as explicitly public
UPDATE public.system_config
SET is_public = TRUE
WHERE key IN ('results_release', 'study_material', 'quiz_schedule');

-- Drop permissive public view policy if present
DROP POLICY IF EXISTS "Public can view system config" ON public.system_config;
DROP POLICY IF EXISTS "Public can view public system config" ON public.system_config;

-- Restrict public access to only explicitly public configuration rows
CREATE POLICY "Public can view public system config"
ON public.system_config
FOR SELECT
USING (is_public = TRUE OR key IN ('results_release', 'study_material'));
