-- Migration: Improve Payment Database Model for Real Payment Provider (Razorpay)
-- Date: 2026-09-24

-- 1. Create payment_transactions table
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

-- Partial unique indices for non-null provider keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_provider_order_id 
    ON public.payment_transactions(provider_order_id) WHERE provider_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_provider_payment_id 
    ON public.payment_transactions(provider_payment_id) WHERE provider_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_provider_event_id 
    ON public.payment_transactions(provider_event_id) WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_registration_id 
    ON public.payment_transactions(registration_id);

-- 2. Create payment_events table for raw immutable webhook log retention & idempotency
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

CREATE INDEX IF NOT EXISTS idx_payment_events_provider_event_id 
    ON public.payment_events(provider_event_id);

CREATE INDEX IF NOT EXISTS idx_payment_events_registration_id 
    ON public.payment_events(registration_id);

-- 3. Update registrations payment_status check constraint if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_payment_status_check'
    ) THEN
        ALTER TABLE public.registrations DROP CONSTRAINT registrations_payment_status_check;
    END IF;
    
    ALTER TABLE public.registrations
    ADD CONSTRAINT registrations_payment_status_check
    CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'MANUAL_REVIEW'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 4. Enable Row Level Security (RLS) policies
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Service role access policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_payment_transactions'
    ) THEN
        CREATE POLICY service_role_all_payment_transactions ON public.payment_transactions
            FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_payment_events'
    ) THEN
        CREATE POLICY service_role_all_payment_events ON public.payment_events
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;
