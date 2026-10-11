import { getSupabase, ensureAuthenticatedDashboardSession } from "./supabase";

export interface PairedDevice {
  pairingId: string;
  deviceId: string;
  deviceIdentifier: string;
  model: string | null;
  osVersion: string | null;
  appVersion: string | null;
  deviceStatus: string;
  pairingStatus: string;
  claimedAt: string | null;
  pairingExpiresAt: string | null;
  createdAt: string;
}

export interface PairingResult {
  success: boolean;
  errorCode?: string;
  deviceId?: string;
  deviceModel?: string;
}

/**
 * Computes the SHA-256 hash of a normalized pairing code using Web Crypto API.
 */
export async function hashPairingCode(code: string): Promise<string> {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const encoder = new TextEncoder();
  const data = encoder.encode(clean);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Fetches the currently paired device for this dashboard session via the sanitized view.
 */
export async function getActivePairedDevice(): Promise<PairedDevice | null> {
  const client = getSupabase();
  if (!client) return null;

  await ensureAuthenticatedDashboardSession();

  try {
    const { data, error } = await client
      .from("paired_devices_view")
      .select("*")
      .eq("pairing_status", "ACTIVE")
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      pairingId: data.pairing_id,
      deviceId: data.device_id,
      deviceIdentifier: data.device_identifier,
      model: data.model,
      osVersion: data.os_version,
      appVersion: data.app_version,
      deviceStatus: data.device_status,
      pairingStatus: data.pairing_status,
      claimedAt: data.claimed_at,
      pairingExpiresAt: data.pairing_expires_at,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.warn("Could not query paired devices view:", err);
    return null;
  }
}

/**
 * Claims a device pairing code atomically via the Supabase RPC.
 */
export async function claimDevicePairing(pairingCode: string): Promise<PairingResult> {
  const client = getSupabase();
  if (!client) {
    return { success: false, errorCode: "SUPABASE_NOT_CONFIGURED" };
  }

  // Ensure active authenticated session
  const session = await ensureAuthenticatedDashboardSession();
  if (!session) {
    return { success: false, errorCode: "AUTH_SESSION_FAILED" };
  }

  try {
    const codeHash = await hashPairingCode(pairingCode);

    const { data, error } = await client.rpc("claim_device_pairing", {
      p_code_hash: codeHash,
    });

    if (error) {
      return { success: false, errorCode: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, errorCode: "NO_RESPONSE" };
    }

    const row = data[0];
    if (!row.success) {
      return { success: false, errorCode: row.error_code };
    }

    return {
      success: true,
      deviceId: row.device_id,
      deviceModel: row.device_model,
    };
  } catch (err: any) {
    return { success: false, errorCode: err.message || "UNKNOWN_ERROR" };
  }
}

/**
 * Revokes an existing active pairing.
 */
export async function unpairCurrentDevice(pairingId: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { data, error } = await client.rpc("unpair_device", {
      p_pairing_id: pairingId,
    });

    if (error || !data) {
      console.warn("Failed to unpair device:", error?.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Error unpairing device:", err);
    return false;
  }
}
