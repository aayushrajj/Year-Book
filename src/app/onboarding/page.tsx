import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfileContext } from "@/lib/auth";
import { getBranchesForCollege } from "@/lib/colleges";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Complete your profile",
};

export default async function OnboardingPage() {
  const ctx = await getProfileContext();
  if (!ctx?.user) redirect("/login");
  if (ctx.profile?.isPublished) redirect("/me");

  // userRow may be null briefly until the trigger fires; fall back to looking
  // up by college via auth metadata if needed.
  const supabase = await getSupabaseServer();
  let collegeId = ctx.userRow?.collegeId;
  if (!collegeId) {
    const { data: u } = await supabase
      .from("users")
      .select("college_id")
      .eq("id", ctx.user.id)
      .maybeSingle();
    collegeId = u?.college_id;
  }

  if (!collegeId) {
    return (
      <div className="container-narrow py-16">
        <h1 className="font-serif text-3xl">One moment.</h1>
        <p className="mt-3 text-ink-500">
          Your account is still being set up. Refresh in a few seconds.
        </p>
      </div>
    );
  }

  const branches = await getBranchesForCollege(collegeId);

  return (
    <div className="container-narrow py-12">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-500">Step 1 of 1</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">A few things about you.</h1>
        <p className="mt-3 text-ink-500">
          This is the only profile you get. Make it count, but don't overthink it — you can edit
          anytime.
        </p>
      </div>
      <ProfileForm branches={branches} initial={null} userId={ctx.user.id} mode="create" />
    </div>
  );
}
