import "server-only";
import { cache } from "react";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/constants";
import { getSupabaseServer } from "@/lib/supabase/server";

export type College = {
  id: string;
  name: string;
  slug: string;
};

export type BranchInfo = {
  id: string;
  name: string;
  shortName: string;
  degree: string;
  level: "UG" | "PG";
  specialization: string | null;
};

export type Socials = {
  instagram?: string;
  linkedin?: string;
  github?: string;
  x?: string;
};

export type BatchCard = {
  id: string;
  username: string;
  displayName: string;
  oneLiner: string;
  branch: BranchInfo;
  photoUrl: string | null;
  isOwner: boolean;
};

export type ProfileDetail = BatchCard & {
  knownFor: string;
  joiningYear: number;
  graduatingYear: number;
  currentCity: string | null;
  currentState: string | null;
  socials: Socials;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// helpers

async function publicPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await getSupabaseServer();
  return supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}

function asBranch(raw: unknown): BranchInfo {
  // Supabase returns the joined branch row as an object (not an array) when
  // the relation is many-to-one. The runtime type can be ambiguous; we trust
  // the shape because the select string pins it.
  const b = raw as {
    id: string;
    name: string;
    short_name: string;
    degree: string;
    level: string;
    specialization: string | null;
  };
  return {
    id: b.id,
    name: b.name,
    shortName: b.short_name,
    degree: b.degree,
    level: b.level === "PG" ? "PG" : "UG",
    specialization: b.specialization,
  };
}

// ---------------------------------------------------------------------------
// fetchers

/**
 * Returns the (College, BatchCard[]) for a given college slug + joining year.
 * RLS enforces same-college visibility; if the requester is signed in but in
 * a different college, profiles[] will be empty.
 */
export const getBatchProfiles = cache(
  async (
    collegeSlug: string,
    year: number,
    branchId?: string | null,
  ): Promise<{ college: College | null; profiles: BatchCard[] }> => {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: college } = await supabase
      .from("colleges")
      .select("id, name, slug")
      .eq("slug", collegeSlug)
      .maybeSingle();

    if (!college) return { college: null, profiles: [] };

    let query = supabase
      .from("profiles")
      .select(
        `id, username, display_name, one_liner, user_id, photo_path,
         branch:branches!inner(id, name, short_name, degree, level, specialization)`,
      )
      .eq("joining_year", year)
      .eq("is_published", true);

    if (branchId) query = query.eq("branch_id", branchId);

    const { data, error } = await query.order("display_name");
    if (error) {
      console.error("getBatchProfiles error:", error.message);
      return { college, profiles: [] };
    }

    const profiles: BatchCard[] = await Promise.all(
      (data ?? []).map(async (p) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        oneLiner: p.one_liner,
        branch: asBranch(p.branch),
        photoUrl: await publicPhotoUrl(p.photo_path),
        isOwner: p.user_id === user?.id,
      })),
    );

    return { college, profiles };
  },
);

/**
 * Returns the full profile for (college slug, username) tuple. RLS blocks
 * cross-college reads at the DB layer.
 */
export const getProfileByUsername = cache(
  async (
    collegeSlug: string,
    username: string,
  ): Promise<{ college: College | null; profile: ProfileDetail | null }> => {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: college } = await supabase
      .from("colleges")
      .select("id, name, slug")
      .eq("slug", collegeSlug)
      .maybeSingle();

    if (!college) return { college: null, profile: null };

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `id, username, display_name, one_liner, known_for,
         user_id, photo_path, joining_year, graduating_year,
         current_city, current_state, socials, updated_at,
         branch:branches!inner(id, name, short_name, degree, level, specialization)`,
      )
      .ilike("username", username)
      .maybeSingle();

    if (error) {
      console.error("getProfileByUsername error:", error.message);
      return { college, profile: null };
    }
    if (!data) return { college, profile: null };

    return {
      college,
      profile: {
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        oneLiner: data.one_liner,
        knownFor: data.known_for,
        branch: asBranch(data.branch),
        joiningYear: data.joining_year,
        graduatingYear: data.graduating_year,
        currentCity: data.current_city,
        currentState: data.current_state,
        socials: (data.socials as Socials) ?? {},
        photoUrl: await publicPhotoUrl(data.photo_path),
        updatedAt: data.updated_at,
        isOwner: data.user_id === user?.id,
      },
    };
  },
);

/**
 * Distinct branch ids represented in (college, joining_year). Used to build
 * the chip filter on the batch view. Skips branches with zero profiles.
 */
export const getBranchesInBatch = cache(
  async (collegeId: string, year: number): Promise<BranchInfo[]> => {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("profiles")
      .select(
        "branch:branches!inner(id, name, short_name, degree, level, specialization)",
      )
      .eq("joining_year", year)
      .eq("is_published", true);

    const seen = new Set<string>();
    const branches: BranchInfo[] = [];
    for (const row of data ?? []) {
      const b = asBranch(row.branch);
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      branches.push(b);
    }
    branches.sort((a, b) => a.shortName.localeCompare(b.shortName));
    // collegeId is intentionally unused here — RLS already restricts the
    // join to same-college rows. The arg is kept so future cross-college
    // queries (admin views, alumni features) plug in without API churn.
    void collegeId;
    return branches;
  },
);
