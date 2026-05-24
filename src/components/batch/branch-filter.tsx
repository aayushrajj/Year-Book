import type { Route } from "next";
import Link from "next/link";
import type { BranchInfo } from "@/lib/profiles";
import { route } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  branches: BranchInfo[];
  activeBranchId: string | null;
  /** Base path the chips link to, e.g. `/bit-mesra/2018`. */
  basePath: Route;
};

export function BranchFilter({ branches, activeBranchId, basePath }: Props) {
  if (branches.length === 0) return null;

  return (
    <nav aria-label="Filter by program" className="flex flex-wrap gap-2">
      <Chip href={basePath} active={activeBranchId === null}>
        All
      </Chip>
      {branches.map((b) => (
        <Chip
          key={b.id}
          href={route(`${basePath}?branch=${encodeURIComponent(b.id)}`)}
          active={activeBranchId === b.id}
          subtle={b.degree}
        >
          {b.shortName}
        </Chip>
      ))}
    </nav>
  );
}

function Chip({
  href,
  active,
  subtle,
  children,
}: {
  href: Route;
  active: boolean;
  subtle?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150",
        active
          ? "border-ink-900 bg-ink-900 text-cream-100"
          : "border-ink-200 bg-cream-50 text-ink-700 hover:border-ink-300 hover:text-ink-900",
      )}
    >
      <span>{children}</span>
      {subtle && !active ? (
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-300">
          {subtle}
        </span>
      ) : null}
    </Link>
  );
}
