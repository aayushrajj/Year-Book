/**
 * Default loading UI for any route that doesn't define its own loading.tsx.
 * Kept deliberately quiet — most routes will define a more specific skeleton.
 * This exists so even unexpected slow routes get an immediate paint.
 */
export default function Loading() {
  return (
    <div className="container-narrow py-16">
      <div className="h-8 w-40 animate-pulse rounded bg-cream-200" />
      <div className="mt-6 h-4 w-64 animate-pulse rounded bg-cream-200" />
      <div className="mt-3 h-4 w-48 animate-pulse rounded bg-cream-200" />
    </div>
  );
}
