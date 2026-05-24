export default function Loading() {
  return (
    <div className="container-narrow py-12">
      <div className="mb-10 flex flex-col gap-3">
        <div className="h-3 w-24 animate-pulse rounded bg-cream-200" />
        <div className="h-10 w-48 animate-pulse rounded bg-cream-200" />
        <div className="h-3 w-20 animate-pulse rounded bg-cream-200" />
      </div>
      <div className="flex items-center gap-6">
        <div className="h-28 w-28 animate-pulse rounded-md bg-cream-200" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 animate-pulse rounded bg-cream-200" />
          <div className="h-9 w-44 animate-pulse rounded bg-cream-200" />
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholder
          <div key={i} className="h-11 w-full animate-pulse rounded bg-cream-200" />
        ))}
      </div>
    </div>
  );
}
