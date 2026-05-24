"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";
import { profileFormSchema } from "@/lib/validators";
import { generateUniqueUsername } from "@/lib/profile";

export type SaveProfileState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "saved"; username: string };

const photoPathSchema = z
  .string()
  .max(256)
  .regex(/^[a-zA-Z0-9._/-]+$/)
  .optional()
  .nullable();

export async function saveProfile(
  _prev: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const user = await requireUser();
  const supabase = await getSupabaseServer();

  // socials arrive as separate fields; bundle them.
  const socialsRaw = {
    instagram: formData.get("socials.instagram")?.toString(),
    linkedin: formData.get("socials.linkedin")?.toString(),
    github: formData.get("socials.github")?.toString(),
    x: formData.get("socials.x")?.toString(),
  };

  const parsed = profileFormSchema.safeParse({
    displayName: formData.get("displayName"),
    oneLiner: formData.get("oneLiner") ?? "",
    knownFor: formData.get("knownFor") ?? "",
    branchId: formData.get("branchId"),
    joiningYear: formData.get("joiningYear"),
    graduatingYear: formData.get("graduatingYear"),
    currentState: formData.get("currentState") || null,
    currentCity: formData.get("currentCity") || null,
    socials: socialsRaw,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please check the fields below.",
      fieldErrors,
    };
  }

  const photoPathParsed = photoPathSchema.safeParse(formData.get("photoPath")?.toString() ?? null);
  if (!photoPathParsed.success) {
    return { status: "error", message: "Invalid photo." };
  }
  const photoPath = photoPathParsed.data ?? null;

  if (parsed.data.graduatingYear < parsed.data.joiningYear) {
    return {
      status: "error",
      message: "Graduating year cannot be before joining year.",
      fieldErrors: { graduatingYear: "Must be after joining year" },
    };
  }

  // Look up the existing profile to keep username stable across edits and
  // figure out whether this is a first-time save (→ publish + redirect).
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, username, is_published, photo_path, college_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let username = existing?.username;
  if (!username) {
    username = await generateUniqueUsername(supabase, parsed.data.displayName, user.id);
  }

  // college_id is denormalised onto profiles (see drizzle/0004) so RLS can do
  // same-college lookups without joining users. The BEFORE INSERT trigger
  // auto-fills this from public.users, but we also pass it explicitly so the
  // app stays correct if the trigger is ever dropped.
  const { data: meRow } = await supabase
    .from("users")
    .select("college_id")
    .eq("id", user.id)
    .maybeSingle();
  const collegeId = existing?.college_id ?? meRow?.college_id;
  if (!collegeId) {
    return {
      status: "error",
      message: "Your account isn't fully set up yet — refresh and try again.",
    };
  }

  const payload = {
    user_id: user.id,
    college_id: collegeId,
    username,
    display_name: parsed.data.displayName,
    one_liner: parsed.data.oneLiner,
    known_for: parsed.data.knownFor,
    branch_id: parsed.data.branchId,
    joining_year: parsed.data.joiningYear,
    graduating_year: parsed.data.graduatingYear,
    current_state: parsed.data.currentState ?? null,
    current_city: parsed.data.currentCity ?? null,
    socials: parsed.data.socials,
    photo_path: photoPath ?? existing?.photo_path ?? null,
    is_published: true,
  };

  const { error } = existing
    ? await supabase.from("profiles").update(payload).eq("user_id", user.id)
    : await supabase.from("profiles").insert(payload);

  if (error) {
    console.error("save profile error:", error.message);
    return { status: "error", message: "Could not save your profile. Please try again." };
  }

  revalidatePath("/me");
  // Also revalidate the eventual batch view path; harmless if nothing is there yet.
  revalidatePath("/", "layout");

  if (!existing) {
    redirect("/me");
  }

  return { status: "saved", username };
}
