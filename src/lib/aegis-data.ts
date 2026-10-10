/**
 * ==============================================================================
 * AEGIS DATA MODEL — DEPRECATED MOCK DATA CONTAINER
 * ==============================================================================
 * Notice: All fake and mock datasets have been permanently removed.
 * The AEGIS Command Center strictly consumes real telemetry via:
 * `@/lib/telemetry-service.ts` backed by Supabase PostgreSQL.
 * ==============================================================================
 */

export interface DeprecatedDataType {
  readonly notice: string;
}

export const DATA_POLICY = {
  telemetrySource: "LIVE_SUPABASE_DATABASE",
  dataMinimization: true,
  noRawBiometrics: true,
};