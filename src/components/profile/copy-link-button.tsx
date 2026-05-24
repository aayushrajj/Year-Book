"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Absolute or root-relative URL to copy. We resolve to absolute at click time. */
  path: string;
  /** Label shown before copy. */
  label?: string;
  /** Override styling (otherwise matches the small outline-button look). */
  className?: string;
};

export function CopyLinkButton({ path, label = "Copy link", className }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(t);
  }, [state]);

  async function copy() {
    const absolute = path.startsWith("http")
      ? path
      : typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      await navigator.clipboard.writeText(absolute);
      setState("copied");
    } catch {
      setState("error");
    }
  }

  const display =
    state === "copied" ? "Copied" : state === "error" ? "Couldn't copy" : label;

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-ink-200 px-3 py-1.5 text-sm text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100",
        state === "copied" && "border-ink-900 text-ink-900",
        className,
      )}
      aria-live="polite"
    >
      <LinkIcon />
      <span>{display}</span>
    </button>
  );
}

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 9a3 3 0 0 0 4.2 0l2.1-2.1a3 3 0 1 0-4.2-4.2L8 3.8" />
      <path d="M9 7a3 3 0 0 0-4.2 0L2.7 9.1a3 3 0 1 0 4.2 4.2L8 12.2" />
    </svg>
  );
}
