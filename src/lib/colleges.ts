import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type CollegeOption = {
  id: string;
  name: string;
  slug: string;
  emailDomain: string;
  isActive: boolean;
};

export const getColleges = cache(async (): Promise<CollegeOption[]> => {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("colleges")
    .select("id, name, slug, email_domain, is_active")
    .order("name");

  if (error) {
    console.error("Failed to load colleges:", error.message);
    return [];
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    emailDomain: c.email_domain,
    isActive: c.is_active,
  }));
});

export type BranchOption = {
  id: string;
  name: string;
  shortName: string;
  level: "UG" | "PG";
  degree: string;
  specialization: string | null;
  isActive: boolean;
};

export const getBranchesForCollege = cache(async (collegeId: string): Promise<BranchOption[]> => {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("branches")
    .select("id, name, short_name, level, degree, specialization, is_active, sort_order")
    .eq("college_id", collegeId)
    .order("level", { ascending: true }) // UG before PG (alphabetical)
    .order("is_active", { ascending: false }) // active first, legacy at bottom
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load branches:", error.message);
    return [];
  }

  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    shortName: b.short_name,
    level: b.level as "UG" | "PG",
    degree: b.degree,
    specialization: b.specialization,
    isActive: b.is_active,
  }));
});
