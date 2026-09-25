-- =========================================================================
-- Gandhi Knowledge Challenge 2026 (TKFK) — Migration: Unify Status Constraints
-- Date: 2026-09-25
-- Fixes participant.status ('PENDING', 'ACTIVE', 'BLOCKED', 'CANCELLED')
-- & registration.registration_status ('PENDING', 'CONFIRMED', 'CANCELLED')
-- =========================================================================

-- 1. Update participants.status check constraint and default
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'participants_status_check'
    ) THEN
        ALTER TABLE public.participants DROP CONSTRAINT participants_status_check;
    END IF;

    ALTER TABLE public.participants
    ADD CONSTRAINT participants_status_check
    CHECK (status IN ('PENDING', 'ACTIVE', 'BLOCKED', 'CANCELLED'));
END $$;

ALTER TABLE public.participants ALTER COLUMN status SET DEFAULT 'PENDING';

-- 2. Update registrations.registration_status check constraint and default
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_registration_status_check'
    ) THEN
        ALTER TABLE public.registrations DROP CONSTRAINT registrations_registration_status_check;
    END IF;

    ALTER TABLE public.registrations
    ADD CONSTRAINT registrations_registration_status_check
    CHECK (registration_status IN ('PENDING', 'CONFIRMED', 'CANCELLED'));
END $$;

ALTER TABLE public.registrations ALTER COLUMN registration_status SET DEFAULT 'PENDING';
