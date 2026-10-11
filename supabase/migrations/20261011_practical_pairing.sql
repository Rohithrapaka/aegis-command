-- ==============================================================================
-- 1. Create table for cryptographic pairing sessions
-- Store SHA-256 hash of pairing code, NOT plaintext.
-- Use built-in gen_random_uuid() for universal PostgreSQL 13+ compatibility.
CREATE TABLE IF NOT EXISTS public.device_pairings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL UNIQUE,
    dashboard_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED')),
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    code_expires_at TIMESTAMPTZ NOT NULL,
    pairing_expires_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure explicit SELECT permissions for authenticated role on underlying tables
GRANT SELECT ON public.devices TO authenticated;
GRANT SELECT ON public.device_pairings TO authenticated;

-- Partial unique indexes to prevent concurrency races and multiple active devices
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_pairings_pending 
    ON public.device_pairings (device_id) 
    WHERE status = 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_pairings_active_dash 
    ON public.device_pairings (dashboard_auth_id) 
    WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_device_pairings_lookup 
    ON public.device_pairings (code_hash, status, code_expires_at);

-- Enable RLS on device_pairings
ALTER TABLE public.device_pairings ENABLE ROW LEVEL SECURITY;

-- Block direct mutations by clients; modifications must occur via functions
REVOKE INSERT, UPDATE, DELETE ON public.device_pairings FROM anon, authenticated;

-- ==============================================================================
-- 2. Non-Recursive Authorization Helper Functions (SECURITY DEFINER)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_device_owner(p_device_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.devices
        WHERE id = p_device_id
          AND owner_auth_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_device_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_device_owner(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_device_paired_dashboard(p_device_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.device_pairings
        WHERE device_id = p_device_id
          AND dashboard_auth_id = auth.uid()
          AND status = 'ACTIVE'
          AND (pairing_expires_at IS NULL OR pairing_expires_at > NOW())
    );
$$;

REVOKE ALL ON FUNCTION public.is_device_paired_dashboard(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_device_paired_dashboard(UUID) TO authenticated;

-- ==============================================================================
-- 3. Sanitized View for Paired Devices (Excludes code_hash and internal counters)
-- security_invoker = true explicitly enforces that querying this view operates under
-- caller's permissions and RLS policies, preventing leakage beyond authorized entities.
-- ==============================================================================
CREATE OR REPLACE VIEW public.paired_devices_view 
WITH (security_invoker = true)
AS
SELECT 
    dp.id AS pairing_id,
    dp.device_id,
    d.device_id AS device_identifier,
    d.model,
    d.os_version,
    d.app_version,
    d.status AS device_status,
    dp.status AS pairing_status,
    dp.claimed_at,
    dp.pairing_expires_at,
    dp.created_at
FROM public.device_pairings dp
JOIN public.devices d ON d.id = dp.device_id
WHERE 
    d.owner_auth_id = auth.uid()
    OR (
        dp.dashboard_auth_id = auth.uid() 
        AND dp.status = 'ACTIVE'
        AND (dp.pairing_expires_at IS NULL OR dp.pairing_expires_at > NOW())
    );

ALTER VIEW public.paired_devices_view OWNER TO postgres;
GRANT SELECT ON public.paired_devices_view TO authenticated;

-- RLS Policy on device_pairings table:
-- Allows callers to select rows without exposing raw code_hash directly
DROP POLICY IF EXISTS "pairings_authorized_select" ON public.device_pairings;
CREATE POLICY "pairings_authorized_select" ON public.device_pairings
    FOR SELECT TO authenticated
    USING (
        dashboard_auth_id = auth.uid()
        OR public.is_device_owner(device_id)
    );

-- ==============================================================================
-- 4. Atomic Code Generation: create_device_pairing(p_code_hash TEXT)
-- Callable by authenticated Android Device Owner
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_device_pairing(
    p_code_hash TEXT
)
RETURNS TABLE (
    pairing_id UUID,
    device_id UUID,
    code_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_device RECORD;
    v_expires_at TIMESTAMPTZ;
    v_new_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Authentication required' USING ERRCODE = '28000';
    END IF;

    -- Validate p_code_hash format: strictly 64 hexadecimal characters
    IF p_code_hash IS NULL OR p_code_hash !~ '^[a-fA-F0-9]{64}$' THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: p_code_hash must be exactly 64 hexadecimal characters' USING ERRCODE = '22023';
    END IF;

    -- Look up device owned by caller
    SELECT id INTO v_device
    FROM public.devices
    WHERE owner_auth_id = auth.uid()
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'FORBIDDEN: Caller does not own a registered device' USING ERRCODE = '42501';
    END IF;

    -- Expire any previous pending codes for this device
    UPDATE public.device_pairings
    SET status = 'EXPIRED'
    WHERE device_id = v_device.id
      AND status = 'PENDING';

    v_expires_at := NOW() + INTERVAL '5 minutes';

    INSERT INTO public.device_pairings (
        device_id,
        code_hash,
        status,
        code_expires_at
    ) VALUES (
        v_device.id,
        LOWER(p_code_hash),
        'PENDING',
        v_expires_at
    )
    RETURNING id INTO v_new_id;

    RETURN QUERY SELECT v_new_id, v_device.id, v_expires_at;
END;
$$;

REVOKE ALL ON FUNCTION public.create_device_pairing(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_device_pairing(TEXT) TO authenticated;

-- ==============================================================================
-- 5. Atomic Claim Function: claim_device_pairing(p_code_hash TEXT)
-- Callable by authenticated Dashboard Session
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.claim_device_pairing(
    p_code_hash TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    error_code TEXT,
    device_id UUID,
    device_model TEXT,
    paired_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_pairing RECORD;
    v_device RECORD;
    v_active_dashboards INT;
BEGIN
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Authentication required' USING ERRCODE = '28000';
    END IF;

    -- Validate p_code_hash format: strictly 64 hexadecimal characters
    IF p_code_hash IS NULL OR p_code_hash !~ '^[a-fA-F0-9]{64}$' THEN
        RETURN QUERY SELECT FALSE, 'INVALID_CODE_FORMAT', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Lock candidate pairing row
    SELECT * INTO v_pairing
    FROM public.device_pairings
    WHERE code_hash = LOWER(p_code_hash)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'INVALID_CODE', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_pairing.status = 'ACTIVE' THEN
        RETURN QUERY SELECT FALSE, 'CODE_ALREADY_USED', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_pairing.status = 'REVOKED' THEN
        RETURN QUERY SELECT FALSE, 'CODE_REVOKED', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_pairing.code_expires_at <= NOW() THEN
        UPDATE public.device_pairings SET status = 'EXPIRED' WHERE id = v_pairing.id;
        RETURN QUERY SELECT FALSE, 'CODE_EXPIRED', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Check device ownership
    SELECT id, model, owner_auth_id INTO v_device
    FROM public.devices
    WHERE id = v_pairing.device_id
    FOR UPDATE;

    IF v_device.owner_auth_id = v_caller_uid THEN
        RETURN QUERY SELECT FALSE, 'CANNOT_PAIR_OWN_DEVICE', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Enforce max 3 dashboards per device
    SELECT COUNT(*) INTO v_active_dashboards
    FROM public.device_pairings
    WHERE device_id = v_device.id
      AND status = 'ACTIVE'
      AND (pairing_expires_at IS NULL OR pairing_expires_at > NOW());

    IF v_active_dashboards >= 3 THEN
        RETURN QUERY SELECT FALSE, 'DEVICE_DASHBOARD_LIMIT_REACHED', NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Revoke existing active pairing for this dashboard session (1 device per dashboard)
    UPDATE public.device_pairings
    SET status = 'REVOKED', revoked_at = NOW()
    WHERE dashboard_auth_id = v_caller_uid
      AND status = 'ACTIVE';

    -- Activate pairing with 30-day lifetime
    UPDATE public.device_pairings
    SET status = 'ACTIVE',
        dashboard_auth_id = v_caller_uid,
        claimed_at = NOW(),
        pairing_expires_at = NOW() + INTERVAL '30 days'
    WHERE id = v_pairing.id;

    RETURN QUERY SELECT TRUE, 'SUCCESS', v_device.id, v_device.model, NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.claim_device_pairing(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_device_pairing(TEXT) TO authenticated;

-- ==============================================================================
-- 6. Atomic Revocation: unpair_device(p_pairing_id UUID)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.unpair_device(
    p_pairing_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_pairing RECORD;
    v_device RECORD;
BEGIN
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE = '28000';
    END IF;

    SELECT * INTO v_pairing
    FROM public.device_pairings
    WHERE id = p_pairing_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Allow paired dashboard to unpair itself
    IF v_pairing.dashboard_auth_id = v_caller_uid THEN
        UPDATE public.device_pairings
        SET status = 'REVOKED', revoked_at = NOW()
        WHERE id = p_pairing_id;
        RETURN TRUE;
    END IF;

    -- Allow device owner to unpair
    SELECT id INTO v_device
    FROM public.devices
    WHERE id = v_pairing.device_id
      AND owner_auth_id = v_caller_uid;

    IF FOUND THEN
        UPDATE public.device_pairings
        SET status = 'REVOKED', revoked_at = NOW()
        WHERE id = p_pairing_id;
        RETURN TRUE;
    END IF;

    RAISE EXCEPTION 'FORBIDDEN: Caller not authorized to unpair this session' USING ERRCODE = '42501';
END;
$$;

REVOKE ALL ON FUNCTION public.unpair_device(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unpair_device(UUID) TO authenticated;

-- ==============================================================================
-- 7. Update Table SELECT Policies to Authorize Paired Dashboards Non-Recursively
-- ==============================================================================
-- DEVICES
DROP POLICY IF EXISTS "device_owner_select" ON public.devices;
DROP POLICY IF EXISTS "device_viewer_select" ON public.devices;
DROP POLICY IF EXISTS "devices_select_authorized" ON public.devices;
CREATE POLICY "devices_select_authorized" ON public.devices
    FOR SELECT TO authenticated
    USING (
        owner_auth_id = auth.uid()
        OR public.is_device_paired_dashboard(id)
    );

-- BIOMETRIC PROFILES
DROP POLICY IF EXISTS "profile_owner_select" ON public.biometric_profiles;
DROP POLICY IF EXISTS "profile_viewer_select" ON public.biometric_profiles;
DROP POLICY IF EXISTS "profiles_select_authorized" ON public.biometric_profiles;
CREATE POLICY "profiles_select_authorized" ON public.biometric_profiles
    FOR SELECT TO authenticated
    USING (
        public.is_device_owner(device_id)
        OR public.is_device_paired_dashboard(device_id)
    );

-- PROTECTED APPS
DROP POLICY IF EXISTS "apps_owner_select" ON public.protected_apps;
DROP POLICY IF EXISTS "apps_viewer_select" ON public.protected_apps;
DROP POLICY IF EXISTS "apps_select_authorized" ON public.protected_apps;
CREATE POLICY "apps_select_authorized" ON public.protected_apps
    FOR SELECT TO authenticated
    USING (
        public.is_device_owner(device_id)
        OR public.is_device_paired_dashboard(device_id)
    );

-- AUTHENTICATION EVENTS
DROP POLICY IF EXISTS "events_owner_select" ON public.authentication_events;
DROP POLICY IF EXISTS "events_viewer_select" ON public.authentication_events;
DROP POLICY IF EXISTS "events_select_authorized" ON public.authentication_events;
CREATE POLICY "events_select_authorized" ON public.authentication_events
    FOR SELECT TO authenticated
    USING (
        public.is_device_owner(device_id)
        OR public.is_device_paired_dashboard(device_id)
    );

-- SECURITY ALERTS
DROP POLICY IF EXISTS "alerts_owner_select" ON public.security_alerts;
DROP POLICY IF EXISTS "alerts_viewer_select" ON public.security_alerts;
DROP POLICY IF EXISTS "alerts_select_authorized" ON public.security_alerts;
CREATE POLICY "alerts_select_authorized" ON public.security_alerts
    FOR SELECT TO authenticated
    USING (
        public.is_device_owner(device_id)
        OR public.is_device_paired_dashboard(device_id)
    );

-- AUDIT TELEMETRY EVENTS
DROP POLICY IF EXISTS "telemetry_owner_select" ON public.telemetry_events;
DROP POLICY IF EXISTS "telemetry_viewer_select" ON public.telemetry_events;
DROP POLICY IF EXISTS "telemetry_events_select_authorized" ON public.telemetry_events;
CREATE POLICY "telemetry_events_select_authorized" ON public.telemetry_events
    FOR SELECT TO authenticated
    USING (
        public.is_device_owner(device_id)
        OR public.is_device_paired_dashboard(device_id)
    );
