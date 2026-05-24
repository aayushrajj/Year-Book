export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip combining marks (accents) after NFKD split
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const ADJECTIVES = ["the", "ace", "kind", "bright", "still", "wry", "warm", "quiet"] as const;

/**
 * Deterministic-ish handle suffixer: if base is taken, append "-2", "-3"...
 * The actual collision check happens in the caller (DB query).
 */
export function withSuffix(base: string, n: number) {
  return n <= 1 ? base : `${base}-${n}`;
}

export function pickHumanSuffix(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ADJECTIVES[h % ADJECTIVES.length] ?? "the";
}
