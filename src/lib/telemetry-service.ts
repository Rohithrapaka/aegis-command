import { getSupabase, isSupabaseConfigured, ensureAuthenticatedDashboardSession } from "./supabase";
import type {
  BiometricProfileSummary,
  AuthenticationEvent,
  SecurityAlert,
  ProtectedAppSummary,
  DashboardKPIs,
  DeviceMetadata,
} from "./telemetry";

/**
 * Fetch all registered biometric profiles from Supabase.
 * Returns empty array if no real profiles or Supabase is unconfigured.
 */
export async function fetchBiometricProfiles(): Promise<BiometricProfileSummary[]> {
  await ensureAuthenticatedDashboardSession();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("biometric_profiles")
    .select("*")
    .order("profile_index", { ascending: true });

  if (error) {
    console.warn("Supabase biometric_profiles query returned error:", error.message);
    return [];
  }
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    deviceId: row.device_id,
    profileIndex: row.profile_index,
    displayName: row.display_name,
    hasFaceEnrolled: Boolean(row.has_face_enrolled),
    hasDeviceBiometric: Boolean(row.has_device_biometric),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Fetch authentication event timeline from Supabase.
 */
export async function fetchAuthTimeline(limit = 20): Promise<AuthenticationEvent[]> {
  await ensureAuthenticatedDashboardSession();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("authentication_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Supabase authentication_events query returned error:", error.message);
    return [];
  }
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    deviceId: row.device_id,
    profileId: row.profile_id,
    packageName: row.package_name,
    appLabel: row.app_label,
    eventType: row.event_type,
    authMethod: row.auth_method,
    failureReason: row.failure_reason,
    riskScore: row.risk_score,
    livenessScore: row.liveness_score,
    latencyMs: row.latency_ms,
    createdAt: row.created_at,
  }));
}

/**
 * Fetch security alerts & incidents from Supabase.
 */
export async function fetchSecurityAlerts(limit = 20): Promise<SecurityAlert[]> {
  await ensureAuthenticatedDashboardSession();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("security_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Supabase security_alerts query returned error:", error.message);
    return [];
  }
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    deviceId: row.device_id,
    severity: row.severity,
    alertType: row.alert_type,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/**
 * Fetch protected apps configured for devices.
 */
export async function fetchProtectedApps(): Promise<ProtectedAppSummary[]> {
  await ensureAuthenticatedDashboardSession();
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("protected_apps")
    .select("*")
    .order("app_label", { ascending: true });

  if (error) {
    console.warn("Supabase protected_apps query returned error:", error.message);
    return [];
  }
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    deviceId: row.device_id,
    packageName: row.package_name,
    appLabel: row.app_label,
    isProtected: Boolean(row.is_protected),
    policy: row.policy,
    updatedAt: row.updated_at,
  }));
}

/**
 * Calculate aggregated KPIs derived strictly from real Supabase records.
 */
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  await ensureAuthenticatedDashboardSession();
  const supabase = getSupabase();
  if (!supabase) {
    return {
      enrolledProfilesCount: 0,
      grantedAuths24h: 0,
      blockedAuths24h: 0,
      medianLatencyMs: null,
      avgRiskScore24h: null,
      threatsPrevented24h: 0,
      protectedAppsCount: 0,
      systemIntegrityPercent: null,
      hasRealData: false,
    };
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Fetch count of enrolled profiles
  const { count: profileCount } = await supabase
    .from("biometric_profiles")
    .select("*", { count: "exact", head: true });

  // Fetch count of protected apps
  const { count: appsCount } = await supabase
    .from("protected_apps")
    .select("*", { count: "exact", head: true });

  // Fetch 24h auth events
  const { data: authEvents } = await supabase
    .from("authentication_events")
    .select("event_type, latency_ms, risk_score")
    .gte("created_at", twentyFourHoursAgo);

  // Fetch 24h alerts
  const { count: threatsCount } = await supabase
    .from("security_alerts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", twentyFourHoursAgo);

  const totalEvents = authEvents?.length || 0;
  const granted = authEvents?.filter((e) => e.event_type === "AUTH_SUCCESS").length || 0;
  const blocked = authEvents?.filter((e) => e.event_type === "AUTH_FAILURE" || e.event_type === "AUTH_LOCKED").length || 0;

  // Calculate real latency median if timing data exists
  const latencies = authEvents
    ?.map((e) => e.latency_ms)
    .filter((l): l is number => typeof l === "number" && l > 0)
    .sort((a, b) => a - b) || [];
  
  let medianLatency: number | null = null;
  if (latencies.length > 0) {
    const mid = Math.floor(latencies.length / 2);
    medianLatency = latencies.length % 2 !== 0 ? latencies[mid]! : Math.round((latencies[mid - 1]! + latencies[mid]!) / 2);
  }

  // Calculate real average risk
  const riskScores = authEvents
    ?.map((e) => e.risk_score)
    .filter((r): r is number => typeof r === "number") || [];
  
  const avgRisk = riskScores.length > 0 
    ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
    : null;

  const hasRealData = (profileCount || 0) > 0 || totalEvents > 0 || (threatsCount || 0) > 0;

  return {
    enrolledProfilesCount: profileCount || 0,
    grantedAuths24h: granted,
    blockedAuths24h: blocked,
    medianLatencyMs: medianLatency,
    avgRiskScore24h: avgRisk,
    threatsPrevented24h: threatsCount || 0,
    protectedAppsCount: appsCount || 0,
    systemIntegrityPercent: hasRealData ? (totalEvents > 0 ? Number(((granted / totalEvents) * 100).toFixed(2)) : 100.0) : null,
    hasRealData,
  };
}
