import Image from "next/image";
import Link from "next/link";
import type { ProfileDetail } from "@/lib/profiles";
import { urls } from "@/lib/routes";
import { AvatarPlaceholder } from "./avatar-placeholder";
import { CopyLinkButton } from "./copy-link-button";

type Props = {
  profile: ProfileDetail;
  collegeName: string;
  collegeSlug: string;
};

export function ProfileDetailView({ profile, collegeName, collegeSlug }: Props) {
  const branchLabel = profile.branch.specialization
    ? `${profile.branch.degree} — ${profile.branch.name} (${profile.branch.specialization})`
    : `${profile.branch.degree} — ${profile.branch.name}`;

  const location =
    profile.currentCity && profile.currentState
      ? `${profile.currentCity}, ${profile.currentState}`
      : profile.currentCity || profile.currentState || null;

  return (
    <article className="container-wide py-12">
      {/* breadcrumb + actions -------------------------------------------- */}
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <Link
          href={urls.batch(collegeSlug, profile.joiningYear)}
          className="font-mono text-xs uppercase tracking-widest text-ink-500 hover:text-ink-900"
        >
          ← {collegeName} · {profile.joiningYear} batch
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <CopyLinkButton
            path={urls.profile(collegeSlug, profile.joiningYear, profile.username)}
            label="Share profile"
          />
          {profile.isOwner ? (
            <Link
              href="/me"
              className="inline-flex items-center rounded-md border border-ink-200 px-3 py-1.5 font-sans text-sm text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900"
            >
              Edit profile
            </Link>
          ) : null}
        </div>
      </div>

      {/* hero ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,400px)_1fr]">
        {/* photo */}
        <div className="aspect-square w-full max-w-[400px] overflow-hidden rounded-md border border-ink-200 bg-cream-200">
          {profile.photoUrl ? (
            <Image
              src={profile.photoUrl}
              alt={profile.displayName}
              width={800}
              height={800}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <AvatarPlaceholder seed={profile.id} name={profile.displayName} />
          )}
        </div>

        {/* identity + content */}
        <div className="flex flex-col">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tightish text-ink-900 sm:text-6xl">
            {profile.displayName}
          </h1>

          {profile.oneLiner ? (
            <p className="mt-6 max-w-xl font-serif text-2xl italic leading-snug text-ink-700">
              {smartQuote(profile.oneLiner)}
            </p>
          ) : null}

          {profile.knownFor ? (
            <div className="mt-10">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
                Known for
              </p>
              <p className="mt-2 text-lg text-ink-900">{profile.knownFor}</p>
            </div>
          ) : null}

          <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            <Field label="Program">{branchLabel}</Field>
            <Field label="Batch">
              {profile.joiningYear} — {profile.graduatingYear}
            </Field>
            {location ? <Field label="Currently in">{location}</Field> : null}
          </dl>

          {hasAnySocial(profile.socials) ? (
            <div className="mt-10">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
                Elsewhere
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {socialLinks(profile.socials).map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-md border border-ink-200 px-3 py-1.5 text-sm text-ink-700 transition-colors hover:bg-ink-900 hover:text-cream-100"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-widest text-ink-500">{label}</dt>
      <dd className="mt-1.5 text-ink-900">{children}</dd>
    </div>
  );
}

function smartQuote(s: string) {
  // Wrap one-liner in editorial double quotes
  return `“${s}”`;
}

function hasAnySocial(s: ProfileDetail["socials"]) {
  return Boolean(s.instagram || s.linkedin || s.github || s.x);
}

function socialLinks(s: ProfileDetail["socials"]) {
  const out: Array<{ label: string; href: string }> = [];
  if (s.instagram) out.push({ label: "Instagram", href: `https://instagram.com/${s.instagram}` });
  if (s.linkedin) out.push({ label: "LinkedIn", href: `https://linkedin.com/in/${s.linkedin}` });
  if (s.github) out.push({ label: "GitHub", href: `https://github.com/${s.github}` });
  if (s.x) out.push({ label: "X", href: `https://x.com/${s.x}` });
  return out;
}
