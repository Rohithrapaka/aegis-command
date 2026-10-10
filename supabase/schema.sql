-- ==============================================================================
-- AEGIS COMMAND — HARDENED SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================
-- CRITICAL SECURITY INVARIANTS:
-- 1. Devices are strictly bound to authenticated Supabase Auth identities (auth.users).
-- 2. Client-submitted device_id is NEVER trusted for authorization.
-- 3. All RLS policies derive authorization strictly from auth.uid() = devices.owner_auth_id.
-- 4. INSERT policies use WITH CHECK, SELECT uses USING, UPDATE uses BOTH USING & WITH CHECK.
-- 5. No broad 'USING (true)' / 'WITH CHECK (true)' policies exist for public/anon roles.
-- 6. Zero biometric templates, face vectors, BioHash matrices, keys, or patterns are stored.
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEVICES
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL UNIQUE, -- Anonymized hardware/installation hash for display
    model TEXT,                     -- e.g. "Pixel 8", "Samsung S24"
    os_version TEXT,                -- e.g. "Android 15"
    app_version TEXT NOT NULL,      -- e.g. "1.0.2 (15)"
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WARNING', 'BLOCKED', 'OFFLINE')),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (owner_auth_id) -- 1:1 relation between authenticated installation user and device
);

-- 2. BIOMETRIC PROFILES (Synchronized from Android local profiles)
CREATE TABLE IF NOT EXISTS public.biometric_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    profile_index INTEGER NOT NULL CHECK (profile_index >= 1 AND profile_index <= 5),
    display_name TEXT NOT NULL DEFAULT 'Default',
    has_face_enrolled BOOLEAN NOT NULL DEFAULT TRUE,
    has_device_biometric BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MONITORED', 'WARNING', 'BLOCKED', 'OFFLINE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (device_id, profile_index)
);

-- 3. PROTECTED APPLICATIONS
CREATE TABLE IF NOT EXISTS public.protected_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    app_label TEXT NOT NULL,
    is_protected BOOLEAN NOT NULL DEFAULT TRUE,
    policy TEXT NOT NULL DEFAULT 'FACE_STRICT' CHECK (policy IN ('FACE_STRICT', 'FACE_OR_BIOMETRIC', 'STEP_UP_CHALLENGE')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (device_id, package_name)
);

-- 4. AUTHENTICATION EVENTS (Ledger of real auth decisions)
CREATE TABLE IF NOT EXISTS public.authentication_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.biometric_profiles(id) ON DELETE SET NULL,
    package_name TEXT,             -- Target app if triggered by app protection
    app_label TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'AUTH_SUCCESS', 
        'AUTH_FAILURE', 
        'AUTH_LOCKED', 
        'BIOMETRIC_FALLBACK', 
        'ACTIVE_CHALLENGE', 
        'PROTECTED_APP_OPENED',
        'RECOVERY_USED'
    )),
    auth_method TEXT NOT NULL CHECK (auth_method IN ('FACE', 'SYSTEM_BIOMETRIC', 'PATTERN_RECOVERY', 'NONE')),
    failure_reason TEXT CHECK (failure_reason IN (
        'NO_FACE_DETECTED',
        'FACE_TOO_FAR',
        'FACE_TOO_CLOSE',
        'FACE_NOT_CLEAR',
        'POOR_LIGHTING',
        'FACE_ANGLE_INVALID',
        'PASSIVE_LIVENESS_FAILED',
        'ACTIVE_CHALLENGE_FAILED',
        'FACE_NOT_RECOGNIZED',
        'FACE_DOES_NOT_MATCH',
        'SYSTEM_BIOMETRIC_FAILED',
        'RECOVERY_FAILED',
        'AUTH_TIMEOUT',
        'ACCESS_DENIED'
    )),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    liveness_score NUMERIC(5,4) CHECK (liveness_score >= 0 AND liveness_score <= 1),
    latency_ms INTEGER CHECK (latency_ms >= 0 AND latency_ms <= 60000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SECURITY ALERTS & INCIDENTS
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'SPOOF_ATTEMPT', 
        'MULTIPLE_FAILURES', 
        'UNAUTHORIZED_APP_ACCESS', 
        'LOCKOUT_TRIGGERED', 
        'INTEGRITY_ANOMALY',
        'ACTIVE_CHALLENGE_FAILED'
    )),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'BLOCKED' CHECK (status IN ('BLOCKED', 'MONITORED', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AUDIT TELEMETRY EVENTS
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    event_category TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_devices_owner ON public.devices(owner_auth_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON public.authentication_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_device ON public.authentication_events(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_device ON public.biometric_profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_apps_device ON public.protected_apps(device_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — HARDENED OWNERSHIP MODEL
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protected_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authentication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. DEVICES POLICIES
-- An authenticated device user can only read and manage its own device record.
-- ------------------------------------------------------------------------------
CREATE POLICY "device_owner_select" ON public.devices
    FOR SELECT TO authenticated
    USING (owner_auth_id = auth.uid());

CREATE POLICY "device_owner_insert" ON public.devices
    FOR INSERT TO authenticated
    WITH CHECK (owner_auth_id = auth.uid());

CREATE POLICY "device_owner_update" ON public.devices
    FOR UPDATE TO authenticated
    USING (owner_auth_id = auth.uid())
    WITH CHECK (owner_auth_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 2. BIOMETRIC PROFILES POLICIES
-- Scoped strictly to the device owned by the authenticated caller.
-- ------------------------------------------------------------------------------
CREATE POLICY "profile_owner_select" ON public.biometric_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.biometric_profiles.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "profile_owner_insert" ON public.biometric_profiles
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.biometric_profiles.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "profile_owner_update" ON public.biometric_profiles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.biometric_profiles.device_id
              AND d.owner_auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.biometric_profiles.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "profile_owner_delete" ON public.biometric_profiles
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.biometric_profiles.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 3. PROTECTED APPS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "apps_owner_select" ON public.protected_apps
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.protected_apps.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "apps_owner_insert" ON public.protected_apps
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.protected_apps.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "apps_owner_update" ON public.protected_apps
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.protected_apps.device_id
              AND d.owner_auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.protected_apps.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 4. AUTHENTICATION EVENTS POLICIES (Append-only & owner read)
-- ------------------------------------------------------------------------------
CREATE POLICY "events_owner_select" ON public.authentication_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.authentication_events.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "events_owner_insert" ON public.authentication_events
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.authentication_events.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 5. SECURITY ALERTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "alerts_owner_select" ON public.security_alerts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.security_alerts.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "alerts_owner_insert" ON public.security_alerts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.security_alerts.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 6. TELEMETRY AUDIT LOG POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "telemetry_owner_select" ON public.telemetry_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.telemetry_events.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "telemetry_owner_insert" ON public.telemetry_events
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = public.telemetry_events.device_id
              AND d.owner_auth_id = auth.uid()
        )
    );
