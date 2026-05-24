import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-200/60 py-10">
      <div className="container-wide flex flex-col gap-4 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-serif">{APP_NAME}</span>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-ink-900">
            About
          </Link>
          <Link href="/privacy" className="hover:text-ink-900">
            Privacy
          </Link>
          <a href="mailto:hi@yearbook.example" className="hover:text-ink-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
