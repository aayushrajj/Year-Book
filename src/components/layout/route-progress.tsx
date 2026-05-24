"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Thin top-bar progress indicator that gives users immediate feedback when
 * a route transition starts. Renders as a fixed 2px bar that grows from 0%
 * toward 90% during navigation, then snaps to 100% and fades.
 *
 * App Router doesn't expose `router.events`, so we approximate "navigation
 * in progress" by observing pathname/searchParams changes and using a
 * delayed reveal: any nav that completes within 100ms doesn't even paint
 * the bar (avoids flashing on already-prefetched routes).
 */

export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search.toString()}`;

  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastKey = useRef(key);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-running on every key change is the entire point of this effect; including `key` ensures that.
  useEffect(() => {
    // Detect actual route change (the effect also fires on first mount).
    if (lastKey.current === key) return;
    lastKey.current = key;

    // Navigation finished — finish the bar.
    if (showTimer.current) clearTimeout(showTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    if (active) {
      setProgress(100);
      const t = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 220);
      return () => clearTimeout(t);
    }
    return;
  }, [key]);

  useEffect(() => {
    // Intercept clicks on internal links to start the bar before the route
    // transition begins (App Router has no public "start" event).
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = (e.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      // External or new-tab links — let the browser handle.
      if (
        target.target === "_blank" ||
        target.rel.includes("external") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      if (showTimer.current) clearTimeout(showTimer.current);
      // Delay reveal — most navs complete in <100ms (prefetched), in which
      // case the bar never paints.
      showTimer.current = setTimeout(() => {
        setActive(true);
        setProgress(15);
        if (tickTimer.current) clearInterval(tickTimer.current);
        tickTimer.current = setInterval(() => {
          setProgress((p) => (p < 88 ? p + (90 - p) * 0.12 : p));
        }, 120);
      }, 100);
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-ink-900 transition-[width,opacity] duration-200 ease-quiet"
        style={{
          width: `${progress}%`,
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}
