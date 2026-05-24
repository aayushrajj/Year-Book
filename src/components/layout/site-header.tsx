import Link from "next/link";
import { APP_NAME, PROFILE_PHOTOS_BUCKET } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { urls } from "@/lib/routes";
import { getSupabaseServer } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";

type HeaderUser = {
  displayName: string;
  username: string;
  collegeSlug: string;
  joiningYear: number;
  photoUrl: string | null;
  hasProfile: boolean;
};

async function getHeaderUser(userId: string): Promise<HeaderUser | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select(
      `display_name, username, joining_year, photo_path,
       college:colleges!inner(slug)`,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  const college = (data.college as unknown as { slug: string } | null);
  if (!college?.slug) return null;

  const photoUrl = data.photo_path
    ? supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(data.photo_path).data.publicUrl
    : null;

  return {
    displayName: data.display_name,
    username: data.username,
    collegeSlug: college.slug,
    joiningYear: data.joining_year,
    photoUrl,
    hasProfile: true,
  };
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const headerUser = user ? await getHeaderUser(user.id) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-cream-100/80 backdrop-blur">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-serif text-xl tracking-tightish text-ink-900 hover:text-ink-700"
        >
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link
            href="/about"
            className="hidden text-ink-500 hover:text-ink-900 sm:inline"
          >
            About
          </Link>

          {headerUser ? (
            <>
              <Link
                href={urls.batch(headerUser.collegeSlug, headerUser.joiningYear)}
                className="text-ink-500 hover:text-ink-900"
              >
                My batch
              </Link>
              <UserMenu
                displayName={headerUser.displayName}
                avatarSeed={headerUser.username}
                photoUrl={headerUser.photoUrl}
                profileHref={urls.profile(
                  headerUser.collegeSlug,
                  headerUser.joiningYear,
                  headerUser.username,
                )}
                batchHref={urls.batch(headerUser.collegeSlug, headerUser.joiningYear)}
              />
            </>
          ) : user ? (
            // Signed in but no profile yet — direct to onboarding, give sign-out via settings link
            <>
              <Link href="/onboarding" className="text-ink-500 hover:text-ink-900">
                Finish onboarding
              </Link>
              <Link
                href="/settings"
                className="text-ink-500 hover:text-ink-900"
              >
                Settings
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-ink-900 px-3 py-1.5 text-ink-900 hover:bg-ink-900 hover:text-cream-100 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
