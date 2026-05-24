import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { getProfileContext } from "@/lib/auth";

export async function SiteHeader() {
  const ctx = await getProfileContext();

  return (
    <header className="border-b border-ink-200/60 bg-cream-100/80 backdrop-blur">
      <div className="container-wide flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-tightish text-ink-900 hover:text-ink-700"
        >
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about" className="text-ink-500 hover:text-ink-900">
            About
          </Link>
          {ctx?.user ? (
            <>
              <Link href="/me" className="text-ink-500 hover:text-ink-900">
                My profile
              </Link>
              <Link href="/settings" className="text-ink-500 hover:text-ink-900">
                Settings
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-ink-900 px-3 py-1.5 text-ink-900 hover:bg-ink-900 hover:text-cream-100 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
