import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read public environment variables safely with indexed access for TypeScript strict mode
// Supports both VITE_ and NEXT_PUBLIC_ prefixes for deployment flexibility
const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env["VITE_SUPABASE_URL"] || env["NEXT_PUBLIC_SUPABASE_URL"] || "";
const supabaseAnonKey = env["VITE_SUPABASE_ANON_KEY"] || env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] || env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "";

/**
 * Returns true if real Supabase credentials are configured in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder"));
}

let clientInstance: SupabaseClient | null = null;

/**
 * Supabase client instance using the anonymous/publishable public key.
 * If credentials are not present, operations gracefully resolve to empty data.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return clientInstance;
}
