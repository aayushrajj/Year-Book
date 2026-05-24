"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/constants";

export type DeleteState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function deleteAccount(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const user = await requireUser();
  const confirmEmail = formData.get("confirmEmail")?.toString().trim().toLowerCase() ?? "";

  if (confirmEmail !== user.email.toLowerCase()) {
    return { status: "error", message: "Email does not match." };
  }

  const supabase = await getSupabaseServer();

  // Best-effort photo cleanup before account deletion. RLS allows the owner to
  // delete their own objects, so this works even without service-role.
  try {
    const { data: files } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .list(user.id, { limit: 100 });
    if (files && files.length > 0) {
      await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .remove(files.map((f) => `${user.id}/${f.name}`));
    }
  } catch (err) {
    console.warn("photo cleanup failed:", err);
  }

  // Profile + users rows cascade from auth.users via the trigger + FK chain
  // (see drizzle/0001_rls_policies.sql). Service-role required for deleting
  // the auth.users row itself.
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("admin deleteUser error:", error.message);
      return {
        status: "error",
        message: "Could not delete account. Please contact us.",
      };
    }
  } catch (err) {
    console.error("admin client unavailable:", err);
    return {
      status: "error",
      message:
        "Account deletion isn't fully configured on the server. Please contact hi@yearbook.example.",
    };
  }

  // Sign out (clears cookies) and bounce to home.
  await supabase.auth.signOut();
  redirect("/");
}
