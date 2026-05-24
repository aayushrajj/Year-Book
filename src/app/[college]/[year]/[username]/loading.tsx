/**
 * Profile detail skeleton — photo on left, name + metadata stub on right.
 * Mirrors the real layout's grid so the swap-in feels seamless.
 */
export default function Loading() {
  return (
    <article className="container-wide py-12">
      <div className="mb-10 h-3 w-64 animate-pulse rounded bg-cream-200" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div className="aspect-square w-full max-w-[400px] animate-pulse rounded-md bg-cream-200" />
        <div className="flex flex-col gap-6">
          <div className="h-14 w-3/4 animate-pulse rounded bg-cream-200" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-cream-200" />
          <div className="mt-6 h-4 w-1/2 animate-pulse rounded bg-cream-200" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 animate-pulse rounded bg-cream-200" />
            <div className="h-12 animate-pulse rounded bg-cream-200" />
            <div className="h-12 animate-pulse rounded bg-cream-200" />
          </div>
        </div>
      </div>
    </article>
  );
}
