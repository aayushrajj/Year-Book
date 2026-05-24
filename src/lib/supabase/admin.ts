import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Admin client backed by the service_role key. Bypasses RLS — use only for
 * trusted server-side operations like account deletion or admin moderation.
 * NEVER pass this client to a client component or ship the key to the browser.
 */
export function getSupabaseAdmin() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
