/**
 * Batch-grid skeleton. Matches the live page's layout (header + chip row +
 * 8 placeholder cards in a 2/3/4-col responsive grid) so the perceived
 * transition is "this same page, just loading" rather than "blank → content".
 */
export default function Loading() {
  return (
    <div className="container-wide py-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-3 w-48 animate-pulse rounded bg-cream-200" />
          <div className="mt-3 h-12 w-40 animate-pulse rounded bg-cream-200" />
        </div>
        <div className="h-3 w-20 animate-pulse rounded bg-cream-200" />
      </header>

      {/* chip row placeholder */}
      <div className="mb-10 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable placeholder layout
          <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-cream-200" />
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable placeholder layout
          <li key={i} className="flex flex-col gap-3">
            <div className="aspect-square animate-pulse rounded-md bg-cream-200" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-cream-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-cream-200" />
          </li>
        ))}
      </ul>
    </div>
  );
}
