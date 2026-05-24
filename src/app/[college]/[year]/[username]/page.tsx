import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/profiles";
import { ProfileDetailView } from "@/components/profile/profile-detail";

type Params = Promise<{ college: string; year: string; username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { college, username } = await params;
  const { profile, college: c } = await getProfileByUsername(college, username);
  if (!profile || !c) return { title: "Profile not found" };
  return {
    title: `${profile.displayName} — ${c.name}`,
    description: profile.oneLiner || `${profile.displayName} on Yearbook`,
    openGraph: {
      title: `${profile.displayName} — ${c.name}`,
      description: profile.oneLiner || `${profile.displayName} on Yearbook`,
      type: "profile",
    },
    robots: { index: false, follow: false }, // never indexed; same-college only
  };
}

export default async function ProfilePage({ params }: { params: Params }) {
  await requireUser();
  const { college: collegeSlug, year: yearStr, username } = await params;

  const yearNum = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(yearNum)) notFound();

  const { college, profile } = await getProfileByUsername(collegeSlug, username);
  if (!college || !profile) notFound();
  // URL year must match the profile's joining_year — otherwise it's a bogus path.
  if (profile.joiningYear !== yearNum) notFound();

  return (
    <ProfileDetailView profile={profile} collegeName={college.name} collegeSlug={college.slug} />
  );
}
