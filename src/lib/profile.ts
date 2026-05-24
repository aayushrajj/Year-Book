import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify, withSuffix } from "@/lib/utils";

/**
 * Generates a unique username slug. Tries the slugified display name first,
 * then suffixes "-2", "-3", … until it finds an unused one. Excludes the
 * current profile when editing.
 */
export async function generateUniqueUsername(
  supabase: SupabaseClient,
  displayName: string,
  excludeUserId: string,
): Promise<string> {
  const base = slugify(displayName) || "student";

  for (let i = 1; i < 100; i++) {
    const candidate = withSuffix(base, i);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id")
      .ilike("username", candidate)
      .neq("user_id", excludeUserId)
      .limit(1);

    if (error) {
      console.error("username lookup error", error.message);
      // On lookup failure, fall back to a random-ish suffix so we never block onboarding.
      return `${base}-${Math.random().toString(36).slice(2, 7)}`;
    }

    if (!data || data.length === 0) return candidate;
  }

  // Fallback after 100 collisions
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}
