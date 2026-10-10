// Follow this setup guide to integrate the Deno runtime into your IDE:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Approved enum domains
const VALID_EVENT_TYPES = new Set([
  "PROFILE_ENROLLED",
  "PROFILE_UPDATED",
  "PROFILE_DISABLED",
  "AUTH_SUCCESS",
  "AUTH_FAILURE",
  "AUTH_LOCKED",
  "BIOMETRIC_FALLBACK",
  "ACTIVE_CHALLENGE",
  "PROTECTED_APP_OPENED",
  "PROTECTION_ENABLED",
  "PROTECTION_DISABLED",
  "SECURITY_ALERT",
  "SERVICE_STATUS",
]);

const VALID_AUTH_METHODS = new Set([
  "FACE",
  "SYSTEM_BIOMETRIC",
  "PATTERN_RECOVERY",
  "NONE",
]);

const VALID_FAILURE_REASONS = new Set([
  "NO_FACE_DETECTED",
  "FACE_TOO_FAR",
  "FACE_TOO_CLOSE",
  "FACE_NOT_CLEAR",
  "POOR_LIGHTING",
  "FACE_ANGLE_INVALID",
  "PASSIVE_LIVENESS_FAILED",
  "ACTIVE_CHALLENGE_FAILED",
  "FACE_NOT_RECOGNIZED",
  "FACE_DOES_NOT_MATCH",
  "SYSTEM_BIOMETRIC_FAILED",
  "RECOVERY_FAILED",
  "AUTH_TIMEOUT",
  "ACCESS_DENIED",
]);

const VALID_SEVERITIES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const VALID_ALERT_TYPES = new Set([
  "SPOOF_ATTEMPT",
  "MULTIPLE_FAILURES",
  "UNAUTHORIZED_APP_ACCESS",
  "LOCKOUT_TRIGGERED",
  "INTEGRITY_ANOMALY",
  "ACTIVE_CHALLENGE_FAILED",
]);

const MAX_PAYLOAD_BYTES = 32 * 1024; // 32KB
const MAX_CLOCK_SKEW_MS = 15 * 60 * 1000; // 15 minutes max skew

interface IngestPayload {
  category: string;
  timestamp: number;
  // Device metadata (optional update)
  model?: string;
  osVersion?: string;
  appVersion?: string;
  // Profile telemetry
  profileIndex?: number;
  profileName?: string;
  hasFaceEnrolled?: boolean;
  hasDeviceBiometric?: boolean;
  profileStatus?: string;
  // Protected app telemetry
  packageName?: string;
  appLabel?: string;
  isProtected?: boolean;
  policy?: string;
  // Auth event telemetry
  authMethod?: string;
  failureReason?: string;
  riskScore?: number;
  livenessScore?: number;
  latencyMs?: number;
  // Security alert telemetry
  alertSeverity?: string;
  alertType?: string;
  alertDetails?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Authenticate the caller session JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Supabase client scoped to caller's JWT to inherit RLS & verify identity
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUid = user.id;

    // 2. Read and enforce payload size limits
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > MAX_PAYLOAD_BYTES) {
      return new Response(JSON.stringify({ error: "Payload exceeds 32KB limit" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: IngestPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Malformed JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Telemetry Validation Rules
    if (!payload.category || !VALID_EVENT_TYPES.has(payload.category)) {
      return new Response(JSON.stringify({ error: "Invalid or missing event category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof payload.timestamp !== "number" || isNaN(payload.timestamp)) {
      return new Response(JSON.stringify({ error: "Invalid timestamp" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Timestamp clock skew check (±15 minutes)
    const now = Date.now();
    if (Math.abs(now - payload.timestamp) > MAX_CLOCK_SKEW_MS) {
      return new Response(JSON.stringify({ error: "Timestamp skew exceeds 15 minutes limit" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.profileIndex !== undefined) {
      if (!Number.isInteger(payload.profileIndex) || payload.profileIndex < 1 || payload.profileIndex > 5) {
        return new Response(JSON.stringify({ error: "profileIndex must be an integer between 1 and 5" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (payload.authMethod !== undefined && !VALID_AUTH_METHODS.has(payload.authMethod)) {
      return new Response(JSON.stringify({ error: "Invalid authMethod" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.failureReason !== undefined && payload.failureReason !== null && !VALID_FAILURE_REASONS.has(payload.failureReason)) {
      return new Response(JSON.stringify({ error: "Invalid failureReason" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.riskScore !== undefined && (payload.riskScore < 0 || payload.riskScore > 100)) {
      return new Response(JSON.stringify({ error: "riskScore must be between 0 and 100" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.latencyMs !== undefined && (payload.latencyMs < 0 || payload.latencyMs > 60000)) {
      return new Response(JSON.stringify({ error: "latencyMs must be between 0 and 60000" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.alertSeverity !== undefined && !VALID_SEVERITIES.has(payload.alertSeverity)) {
      return new Response(JSON.stringify({ error: "Invalid alertSeverity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.alertType !== undefined && !VALID_ALERT_TYPES.has(payload.alertType)) {
      return new Response(JSON.stringify({ error: "Invalid alertType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Resolve the AUTHORITATIVE Device Record from authUid (NEVER trusting client input)
    // Use admin client internally to query device or create on initial connection
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    let { data: device, error: deviceError } = await adminClient
      .from("devices")
      .select("id, device_id")
      .eq("owner_auth_id", authUid)
      .maybeSingle();

    if (!device) {
      // Auto-provision initial device record for this authenticated session
      const deviceHash = "DEV-" + authUid.substring(0, 8).toUpperCase();
      const { data: newDevice, error: createError } = await adminClient
        .from("devices")
        .insert({
          owner_auth_id: authUid,
          device_id: deviceHash,
          model: payload.model ?? "Android Endpoint",
          os_version: payload.osVersion ?? "Android",
          app_version: payload.appVersion ?? "1.0.2 (15)",
          status: "ACTIVE",
          last_seen_at: new Date(payload.timestamp).toISOString(),
        })
        .select("id, device_id")
        .single();

      if (createError || !newDevice) {
        console.error("Device creation failed:", createError);
        return new Response(JSON.stringify({ error: "Failed to establish device record" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      device = newDevice;
    } else {
      // Update last seen & version metadata
      await adminClient
        .from("devices")
        .update({
          last_seen_at: new Date(payload.timestamp).toISOString(),
          ...(payload.model ? { model: payload.model } : {}),
          ...(payload.osVersion ? { os_version: payload.osVersion } : {}),
          ...(payload.appVersion ? { app_version: payload.appVersion } : {}),
        })
        .eq("id", device.id);
    }

    const authoritativeDeviceId = device.id;

    // 5. Ingest Domain-Specific Telemetry
    if (payload.category.startsWith("PROFILE_") && payload.profileIndex !== undefined) {
      await adminClient.from("biometric_profiles").upsert(
        {
          device_id: authoritativeDeviceId,
          profile_index: payload.profileIndex,
          display_name: payload.profileName ?? `BIO ${payload.profileIndex}`,
          has_face_enrolled: payload.hasFaceEnrolled ?? true,
          has_device_biometric: payload.hasDeviceBiometric ?? false,
          status: payload.profileStatus ?? "ACTIVE",
          updated_at: new Date(payload.timestamp).toISOString(),
        },
        { onConflict: "device_id,profile_index" }
      );
    }

    if (payload.category.startsWith("PROTECTION_") && payload.packageName) {
      await adminClient.from("protected_apps").upsert(
        {
          device_id: authoritativeDeviceId,
          package_name: payload.packageName,
          app_label: payload.appLabel ?? payload.packageName,
          is_protected: payload.isProtected ?? true,
          policy: (payload.policy as any) ?? "FACE_STRICT",
          updated_at: new Date(payload.timestamp).toISOString(),
        },
        { onConflict: "device_id,package_name" }
      );
    }

    if (payload.category.startsWith("AUTH_") || payload.category === "BIOMETRIC_FALLBACK" || payload.category === "ACTIVE_CHALLENGE") {
      await adminClient.from("authentication_events").insert({
        device_id: authoritativeDeviceId,
        package_name: payload.packageName ?? null,
        app_label: payload.appLabel ?? null,
        event_type: payload.category,
        auth_method: payload.authMethod ?? "FACE",
        failure_reason: payload.failureReason ?? null,
        risk_score: payload.riskScore ?? null,
        liveness_score: payload.livenessScore ?? null,
        latency_ms: payload.latencyMs ?? null,
        created_at: new Date(payload.timestamp).toISOString(),
      });
    }

    if (payload.category === "SECURITY_ALERT" && payload.alertType) {
      await adminClient.from("security_alerts").insert({
        device_id: authoritativeDeviceId,
        severity: payload.alertSeverity ?? "HIGH",
        alert_type: payload.alertType,
        details: payload.alertDetails ?? "Security alert triggered on endpoint",
        status: "BLOCKED",
        created_at: new Date(payload.timestamp).toISOString(),
      });
    }

    // Record raw audit telemetry event
    await adminClient.from("telemetry_events").insert({
      device_id: authoritativeDeviceId,
      event_category: payload.category,
      payload: payload,
      created_at: new Date(payload.timestamp).toISOString(),
    });

    // 6. Return minimal sanitised acknowledgment
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Internal ingestion error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
