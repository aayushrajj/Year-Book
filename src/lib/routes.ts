import type { Route } from "next";

/**
 * Cast a dynamically-built URL string into Next.js's `Route` type so it can
 * be passed to `<Link href={...}>`. Use this only for URLs you've constructed
 * yourself — never for user input. typedRoutes can't statically prove that
 * a template literal matches a known route segment.
 */
export function route<T extends string>(href: T): Route {
  return href as Route;
}

/**
 * URL builders for the dynamic /[college]/[year]/* routes. Centralising
 * these keeps the URL shape in one place — if we add /[college]/[year]/photos
 * or rename a segment later, only this file changes.
 */
export const urls = {
  batch: (collegeSlug: string, year: number) => route(`/${collegeSlug}/${year}`),
  profile: (collegeSlug: string, year: number, username: string) =>
    route(`/${collegeSlug}/${year}/${username}`),
  batchFiltered: (collegeSlug: string, year: number, branchId: string) =>
    route(`/${collegeSlug}/${year}?branch=${encodeURIComponent(branchId)}`),
};
