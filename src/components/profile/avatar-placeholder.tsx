import { cn } from "@/lib/utils";

/**
 * Deterministic warm-tone gradient + initials placeholder for profiles that
 * haven't uploaded a photo. The gradient is derived from a hash of `seed`
 * (typically display name or user_id) so the same person always gets the
 * same colours — visually stable across sessions, and across the batch grid.
 *
 * Palette is constrained to the project's warm cream/ink space so a wall of
 * placeholders doesn't feel like a colour vomit.
 */

type Props = {
  seed: string;
  name: string;
  className?: string;
  /** "lg" — big enough to read; default for batch cards/profile hero. */
  size?: "sm" | "md" | "lg";
};

// Warm-leaning hue pairs (each is [base, accent] in HSL hue degrees).
// Chosen to stay in the earth-tone band: ochres, terracotta, mosses, sienna.
const HUE_PAIRS: Array<[number, number]> = [
  [22, 38],   // warm sienna → ochre
  [32, 48],   // ochre → straw
  [12, 28],   // brick → russet
  [350, 18],  // rose-brown → terracotta
  [55, 75],   // mustard → olive
  [85, 105],  // moss → sage
  [180, 200], // muted teal → slate-blue
  [225, 250], // dusty blue → indigo
  [275, 300], // muted aubergine → plum
  [200, 25],  // slate → warm ochre (contrast pair)
];

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) {
    const p = parts[0] ?? "";
    return p.slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

const TEXT_SIZE = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-3xl",
} as const;

export function AvatarPlaceholder({ seed, name, className, size = "lg" }: Props) {
  const h = hash(seed);
  // HUE_PAIRS is a non-empty literal, so the fallback short-circuits to a
  // known-good value. We extract it once to avoid `!` and keep TS happy.
  const fallback = HUE_PAIRS[0] ?? [22, 38];
  const pair = HUE_PAIRS[h % HUE_PAIRS.length] ?? fallback;
  const angle = (h % 12) * 30; // 0..330° in 30° steps for variety

  // Saturated enough to be warm, muted enough to feel editorial.
  // Two-stop gradient; the body's cream gives the lightness anchor at edges.
  const a = `hsl(${pair[0]}, 42%, 62%)`;
  const b = `hsl(${pair[1]}, 38%, 48%)`;
  const style = {
    backgroundImage: `linear-gradient(${angle}deg, ${a}, ${b})`,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        "flex h-full w-full items-center justify-center font-serif font-medium tracking-tight text-cream-50",
        TEXT_SIZE[size],
        className,
      )}
    >
      {initialsOf(name)}
    </div>
  );
}
