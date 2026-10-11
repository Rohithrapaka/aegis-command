import { createClient, SupabaseClient, Session } from "@supabase/supabase-js";

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
 * Supabase client instance using persistent anonymous/session authentication.
 * Enables localStorage session caching and auto token refresh so the dashboard
 * holds a stable authenticated session needed for paired RLS reads.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "aegis_command_auth_session",
      },
    });
  }
  return clientInstance;
}

/**
 * Ensures the dashboard browser holds an active authenticated anonymous session.
 * If no session exists, signs in anonymously to obtain a valid auth.uid().
 */
export async function ensureAuthenticatedDashboardSession(): Promise<Session | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (!sessionError && sessionData?.session) {
      return sessionData.session;
    }

    const { data: authData, error: authError } = await client.auth.signInAnonymously();
    if (authError || !authData?.session) {
      console.warn("Could not initialize anonymous dashboard session:", authError?.message);
      return null;
    }
    return authData.session;
  } catch (err) {
    console.warn("Failed to check dashboard session:", err);
    return null;
  }
}
