import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <section className="container-narrow pt-24 pb-16">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tightish text-ink-900 sm:text-6xl">
          The people you went
          <br />
          to college with, kept.
        </h1>
        <p className="mt-6 max-w-md text-lg text-ink-700">
          A photo, a line, a profile — for everyone who was there.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {user ? (
            <Link
              href="/me"
              className="rounded-md bg-ink-900 px-5 py-3 font-sans text-cream-100 transition-colors hover:bg-ink-700"
            >
              Open your profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-ink-900 px-5 py-3 font-sans text-cream-100 transition-colors hover:bg-ink-700"
            >
              Sign in with your college email
            </Link>
          )}
          <Link
            href="/about"
            className="rounded-md border border-ink-200 px-5 py-3 font-sans text-ink-900 transition-colors hover:bg-cream-200"
          >
            What this is
          </Link>
        </div>
      </section>

      <section className="container-wide grid grid-cols-1 gap-12 border-t border-ink-200/60 py-16 sm:grid-cols-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500">01</p>
          <h3 className="mt-3 font-serif text-2xl">A profile, not a feed.</h3>
          <p className="mt-2 text-ink-700">
            A photo. A line about you. The thing you're known for. That's the whole product.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500">02</p>
          <h3 className="mt-3 font-serif text-2xl">Visible only to your batch.</h3>
          <p className="mt-2 text-ink-700">
            Verified by college email. No public discoverability. No outside world.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500">03</p>
          <h3 className="mt-3 font-serif text-2xl">Built to last.</h3>
          <p className="mt-2 text-ink-700">
            Years from now, you'll come back to look at who was there. We're building for that
            moment.
          </p>
        </div>
      </section>
    </>
  );
}
