import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { BranchFilter } from "@/components/batch/branch-filter";
import { ProfileCard } from "@/components/profile/profile-card";
import { getBatchProfiles, getBranchesInBatch } from "@/lib/profiles";
import { urls } from "@/lib/routes";

type Params = Promise<{ college: string; year: string }>;
type Search = Promise<{ branch?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { college, year } = await params;
  return {
    title: `${college} — ${year} batch`,
    robots: { index: false, follow: false },
  };
}

export default async function BatchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  await requireUser();

  const { college: collegeSlug, year: yearStr } = await params;
  const sp = await searchParams;
  const yearNum = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(yearNum)) notFound();

  const activeBranchId = sp.branch?.trim() || null;

  const [{ college, profiles }, allBranches] = await Promise.all([
    getBatchProfiles(collegeSlug, yearNum, activeBranchId),
    // Fetch the list of branches in the unfiltered batch so chips stay stable.
    // (Otherwise selecting a branch would collapse the chip row.)
    (async () => {
      const supabase_call = await getBatchProfiles(collegeSlug, yearNum, null);
      if (!supabase_call.college) return [];
      return getBranchesInBatch(supabase_call.college.id, yearNum);
    })(),
  ]);

  if (!college) notFound();

  const basePath = urls.batch(collegeSlug, yearNum);
  const total = profiles.length;

  return (
    <div className="container-wide py-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
            {college.name}
          </p>
          <h1 className="mt-2 font-serif text-5xl leading-[1.05] tracking-tightish text-ink-900">
            {yearNum} batch
          </h1>
        </div>
        <p className="font-mono text-xs text-ink-500">
          {total} {total === 1 ? "profile" : "profiles"}
          {activeBranchId ? " · filtered" : ""}
        </p>
      </header>

      {allBranches.length > 1 ? (
        <div className="mb-10">
          <BranchFilter
            branches={allBranches}
            activeBranchId={activeBranchId}
            basePath={basePath}
          />
        </div>
      ) : null}

      {profiles.length === 0 ? (
        <EmptyState
          collegeName={college.name}
          year={yearNum}
          isFiltered={Boolean(activeBranchId)}
          basePath={basePath}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {profiles.map((p) => (
            <li key={p.id}>
              <ProfileCard card={p} collegeSlug={college.slug} joiningYear={yearNum} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({
  collegeName,
  year,
  isFiltered,
  basePath,
}: {
  collegeName: string;
  year: number;
  isFiltered: boolean;
  basePath: string;
}) {
  void basePath; // referenced via the anchor below; keeps strict TS happy if we tweak copy
  if (isFiltered) {
    return (
      <div className="rounded-lg border border-ink-200/60 bg-cream-50 p-10 text-center">
        <p className="font-serif text-2xl text-ink-900">No one here yet.</p>
        <p className="mt-2 text-ink-500">
          Nobody from this branch has filled out a profile yet.{" "}
          <a href={basePath} className="underline">
            See everyone
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200/60 bg-cream-50 p-10 text-center">
      <p className="font-serif text-2xl text-ink-900">First one in.</p>
      <p className="mt-3 max-w-xl mx-auto text-ink-700">
        You're the first from {collegeName}'s {year} batch on Yearbook. Tell your batchmates —
        a yearbook without them isn't much of a yearbook.
      </p>
    </div>
  );
}
