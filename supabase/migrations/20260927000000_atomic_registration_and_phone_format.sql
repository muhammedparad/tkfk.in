-- Migration: Atomic Participant Registration RPC & Canonical Phone Normalization
-- Fixes Issue 32 (Atomic Registration) and Issue 35 (Canonical Phone Format)

-- 1. Standardize existing participant phone numbers to canonical 10-digit format
UPDATE public.participants
SET normalized_phone = CASE
    WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 12 AND REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '91%'
    THEN SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 3)
    WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 11 AND REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '0%'
    THEN SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 2)
    ELSE REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
END
WHERE phone IS NOT NULL;

UPDATE public.participants
SET phone = normalized_phone
WHERE normalized_phone IS NOT NULL AND LENGTH(normalized_phone) = 10;

-- 2. Atomic Registration RPC Function
CREATE OR REPLACE FUNCTION public.create_participant_with_registration(
    p_participant_id TEXT,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_state TEXT,
    p_city TEXT DEFAULT NULL,
    p_college TEXT DEFAULT NULL,
    p_referral_code TEXT DEFAULT NULL,
    p_amount NUMERIC DEFAULT 99,
    p_currency TEXT DEFAULT 'INR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_participant public.participants;
    v_registration public.registrations;
    v_existing_p public.participants;
    v_existing_r public.registrations;
    v_clean_phone TEXT;
BEGIN
    -- Normalize phone input to canonical 10-digit format
    v_clean_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
    IF LENGTH(v_clean_phone) = 12 AND v_clean_phone LIKE '91%' THEN
        v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
    ELSIF LENGTH(v_clean_phone) = 11 AND v_clean_phone LIKE '0%' THEN
        v_clean_phone := SUBSTRING(v_clean_phone FROM 2);
    END IF;

    -- Check for existing participant by email or normalized phone
    SELECT * INTO v_existing_p
    FROM public.participants
    WHERE LOWER(email) = LOWER(TRIM(p_email)) OR normalized_phone = v_clean_phone OR phone = v_clean_phone
    LIMIT 1;

    IF v_existing_p.id IS NOT NULL THEN
        SELECT * INTO v_existing_r
        FROM public.registrations
        WHERE participant_id = v_existing_p.id
        LIMIT 1;

        IF v_existing_r.payment_status = 'SUCCESS' THEN
            RETURN jsonb_build_object(
                'status', 'ALREADY_REGISTERED',
                'participant', to_jsonb(v_existing_p),
                'registration', to_jsonb(v_existing_r)
            );
        ELSIF v_existing_r.id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'status', 'PENDING',
                'participant', to_jsonb(v_existing_p),
                'registration', to_jsonb(v_existing_r)
            );
        END IF;
    END IF;

    -- Insert participant atomically
    INSERT INTO public.participants (
        participant_id, name, email, phone, normalized_phone, state, city, college, referral_code, status
    ) VALUES (
        p_participant_id, TRIM(p_name), LOWER(TRIM(p_email)), v_clean_phone, v_clean_phone, TRIM(p_state), TRIM(p_city), TRIM(p_college), UPPER(TRIM(p_referral_code)), 'PENDING'
    )
    RETURNING * INTO v_participant;

    -- Insert registration atomically in same transaction
    INSERT INTO public.registrations (
        participant_id, registration_status, payment_status, amount, currency
    ) VALUES (
        v_participant.id, 'PENDING', 'PENDING', p_amount, p_currency
    )
    RETURNING * INTO v_registration;

    RETURN jsonb_build_object(
        'status', 'NEW',
        'participant', to_jsonb(v_participant),
        'registration', to_jsonb(v_registration)
    );
END;
$$;
