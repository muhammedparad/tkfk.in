-- Gandhi Knowledge Challenge 2026 (TKFK) — Migration: Lazy Participant ID Assignment Upon Payment
-- Ensures participant_id (TKFK26-XXXXXX) is only generated and assigned after successful payment confirmation

-- 1. Clear participant_id for all unconfirmed / pending / failed records
UPDATE public.participants 
SET participant_id = NULL 
WHERE status != 'ACTIVE' 
   OR id IN (
     SELECT p.id 
     FROM public.participants p 
     LEFT JOIN public.registrations r ON r.participant_id = p.id 
     WHERE r.payment_status != 'SUCCESS' OR r.payment_status IS NULL
   );

-- 2. Update Atomic Registration RPC Function to default participant_id to NULL
CREATE OR REPLACE FUNCTION public.create_participant_with_registration(
    p_participant_id TEXT DEFAULT NULL,
    p_name TEXT DEFAULT '',
    p_email TEXT DEFAULT '',
    p_phone TEXT DEFAULT '',
    p_state TEXT DEFAULT 'Kerala',
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

        IF v_existing_r.payment_status = 'SUCCESS' OR v_existing_p.status = 'ACTIVE' THEN
            RETURN jsonb_build_object(
                'status', 'ALREADY_REGISTERED',
                'participant', to_jsonb(v_existing_p),
                'registration', to_jsonb(v_existing_r)
            );
        ELSIF v_existing_r.id IS NOT NULL THEN
            -- Update existing pending/failed record with fresh details, keeping status PENDING and participant_id NULL
            UPDATE public.participants
            SET name = TRIM(p_name),
                state = TRIM(p_state),
                city = TRIM(p_city),
                college = TRIM(p_college),
                referral_code = UPPER(TRIM(p_referral_code)),
                status = 'PENDING',
                updated_at = NOW()
            WHERE id = v_existing_p.id
            RETURNING * INTO v_participant;

            UPDATE public.registrations
            SET payment_status = 'PENDING',
                registration_status = 'PENDING',
                amount = p_amount,
                currency = p_currency,
                payment_reference = NULL,
                confirmed_at = NULL,
                updated_at = NOW()
            WHERE id = v_existing_r.id
            RETURNING * INTO v_registration;

            RETURN jsonb_build_object(
                'status', 'PENDING',
                'participant', to_jsonb(v_participant),
                'registration', to_jsonb(v_registration)
            );
        END IF;
    END IF;

    -- Insert participant atomically with NULL participant_id (only assigned upon confirmed payment)
    INSERT INTO public.participants (
        participant_id, name, email, phone, normalized_phone, state, city, college, referral_code, status
    ) VALUES (
        NULL, TRIM(p_name), LOWER(TRIM(p_email)), v_clean_phone, v_clean_phone, TRIM(p_state), TRIM(p_city), TRIM(p_college), UPPER(TRIM(p_referral_code)), 'PENDING'
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
