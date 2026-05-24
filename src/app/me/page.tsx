import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBranchesForCollege } from "@/lib/colleges";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ProfileForm, type ProfileInitial } from "@/components/profile/profile-form";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Edit profile",
};

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await getSupabaseServer();

  const { data: userRow } = await supabase
    .from("users")
    .select("college_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!userRow) {
    return (
      <div className="container-narrow py-16">
        <h1 className="font-serif text-3xl">Almost there.</h1>
        <p className="mt-3 text-ink-500">Your account is still being set up. Refresh shortly.</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, one_liner, known_for, branch_id, joining_year, graduating_year, current_state, current_city, photo_path, socials, username, is_published",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const branches = await getBranchesForCollege(userRow.college_id);

  const photoUrl = profile.photo_path
    ? supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(profile.photo_path).data.publicUrl
    : null;

  const initial: ProfileInitial = {
    displayName: profile.display_name,
    oneLiner: profile.one_liner,
    knownFor: profile.known_for,
    branchId: profile.branch_id,
    joiningYear: profile.joining_year,
    graduatingYear: profile.graduating_year,
    currentState: profile.current_state,
    currentCity: profile.current_city,
    socials: (profile.socials as ProfileInitial["socials"]) ?? {},
    photoPath: profile.photo_path,
    photoPublicUrl: photoUrl,
  };

  return (
    <div className="container-narrow py-12">
      <div className="mb-10 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500">Your profile</p>
          <h1 className="mt-2 font-serif text-4xl">{profile.display_name}</h1>
        </div>
        <p className="font-mono text-xs text-ink-300">@{profile.username}</p>
      </div>
      <ProfileForm branches={branches} initial={initial} userId={user.id} mode="edit" />
    </div>
  );
}
