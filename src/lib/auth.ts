import "server-only";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AuthedUser = {
  id: string;
  email: string;
};

export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email };
}

export async function requireUser(): Promise<AuthedUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

export type ProfileContext = {
  user: AuthedUser;
  /** Row in public.users (college membership). May be null until trigger fires. */
  userRow: { id: string; email: string; collegeId: string } | null;
  /** Row in public.profiles. Null if onboarding incomplete. */
  profile: {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    isPublished: boolean;
  } | null;
};

export async function getProfileContext(): Promise<ProfileContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabaseServer();

  const [{ data: userRow }, { data: profileRow }] = await Promise.all([
    supabase.from("users").select("id, email, college_id").eq("id", user.id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, user_id, username, display_name, is_published")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    user,
    userRow: userRow
      ? { id: userRow.id, email: userRow.email, collegeId: userRow.college_id }
      : null,
    profile: profileRow
      ? {
          id: profileRow.id,
          userId: profileRow.user_id,
          username: profileRow.username,
          displayName: profileRow.display_name,
          isPublished: profileRow.is_published,
        }
      : null,
  };
}
