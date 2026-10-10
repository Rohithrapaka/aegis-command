/**
 * ==============================================================================
 * AEGIS COMMAND — CENTRAL TELEMETRY CONTRACT & TYPES
 * ==============================================================================
 * CRITICAL SECURITY BOUNDARY:
 * This contract STRICTLY enforces data minimization.
 * NEVER add raw biometric templates, face vectors, BioHash matrices,
 * credentials, patterns, or sensor streams to this contract.
 * ==============================================================================
 */

export type TelemetryEventCategory =
  | "PROFILE_ENROLLED"
  | "PROFILE_UPDATED"
  | "PROFILE_DISABLED"
  | "AUTH_SUCCESS"
  | "AUTH_FAILURE"
  | "AUTH_LOCKED"
  | "BIOMETRIC_FALLBACK"
  | "ACTIVE_CHALLENGE"
  | "PROTECTED_APP_OPENED"
  | "PROTECTION_ENABLED"
  | "PROTECTION_DISABLED"
  | "SECURITY_ALERT"
  | "SERVICE_STATUS";

export type AuthenticationFailureReason =
  | "NO_FACE_DETECTED"
  | "FACE_TOO_FAR"
  | "FACE_TOO_CLOSE"
  | "FACE_NOT_CLEAR"
  | "POOR_LIGHTING"
  | "FACE_ANGLE_INVALID"
  | "PASSIVE_LIVENESS_FAILED"
  | "ACTIVE_CHALLENGE_FAILED"
  | "FACE_NOT_RECOGNIZED"
  | "FACE_DOES_NOT_MATCH"
  | "SYSTEM_BIOMETRIC_FAILED"
  | "RECOVERY_FAILED"
  | "AUTH_TIMEOUT"
  | "ACCESS_DENIED";

export type AuthenticationMethod =
  | "FACE"
  | "SYSTEM_BIOMETRIC"
  | "PATTERN_RECOVERY"
  | "NONE";

export type SecurityAlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SecurityAlertType =
  | "SPOOF_ATTEMPT"
  | "MULTIPLE_FAILURES"
  | "UNAUTHORIZED_APP_ACCESS"
  | "LOCKOUT_TRIGGERED"
  | "INTEGRITY_ANOMALY"
  | "ACTIVE_CHALLENGE_FAILED";

export type NodeSecurityStatus =
  | "ACTIVE"
  | "MONITORED"
  | "WARNING"
  | "BLOCKED"
  | "OFFLINE";

export interface DeviceMetadata {
  id: string;
  deviceId: string;
  model?: string | null;
  osVersion?: string | null;
  appVersion: string;
  status: NodeSecurityStatus;
  lastSeenAt: string;
  createdAt: string;
}

export interface BiometricProfileSummary {
  id: string;
  deviceId: string;
  profileIndex: number;
  displayName: string;
  hasFaceEnrolled: boolean;
  hasDeviceBiometric: boolean;
  status: NodeSecurityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProtectedAppSummary {
  id: string;
  deviceId: string;
  packageName: string;
  appLabel: string;
  isProtected: boolean;
  policy: "FACE_STRICT" | "FACE_OR_BIOMETRIC" | "STEP_UP_CHALLENGE";
  updatedAt: string;
}

export interface AuthenticationEvent {
  id: string;
  deviceId: string;
  profileId?: string | null;
  packageName?: string | null;
  appLabel?: string | null;
  eventType: TelemetryEventCategory;
  authMethod: AuthenticationMethod;
  failureReason?: AuthenticationFailureReason | null;
  riskScore?: number | null;
  livenessScore?: number | null;
  latencyMs?: number | null;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  deviceId: string;
  severity: SecurityAlertSeverity;
  alertType: SecurityAlertType;
  details: string;
  status: "BLOCKED" | "MONITORED" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface SecurityTelemetryPayload {
  deviceId: string;
  model?: string;
  osVersion?: string;
  appVersion: string;
  category: TelemetryEventCategory;
  timestamp: number;
  profileIndex?: number;
  profileName?: string;
  hasFaceEnrolled?: boolean;
  hasDeviceBiometric?: boolean;
  packageName?: string;
  appLabel?: string;
  authMethod?: AuthenticationMethod;
  failureReason?: AuthenticationFailureReason;
  riskScore?: number;
  livenessScore?: number;
  latencyMs?: number;
  alertSeverity?: SecurityAlertSeverity;
  alertType?: SecurityAlertType;
  alertDetails?: string;
}

/** Dashboard KPI Aggregate Structure */
export interface DashboardKPIs {
  enrolledProfilesCount: number;
  grantedAuths24h: number;
  blockedAuths24h: number;
  medianLatencyMs: number | null;
  avgRiskScore24h: number | null;
  threatsPrevented24h: number;
  protectedAppsCount: number;
  systemIntegrityPercent: number | null;
  hasRealData: boolean;
}
