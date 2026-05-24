import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What Yearbook is and why it exists.",
};

export default function AboutPage() {
  return (
    <article className="container-narrow prose-quiet py-16">
      <h1 className="font-serif text-4xl">About.</h1>

      <p className="mt-6 text-lg text-ink-700">
        Yearbook is an interactive digital yearbook for college batches. Each verified student in
        a batch gets a profile, and the batch can browse and discover each other through a
        deliberately crafted experience.
      </p>

      <h2 className="mt-12 font-serif text-2xl">What it isn't.</h2>
      <p className="mt-3 text-ink-700">
        Not a social network. Not a feed. There are no DMs, no comments, no notifications, no
        algorithm. The comparison points are publications and personal-archive products, not
        Instagram.
      </p>

      <h2 className="mt-12 font-serif text-2xl">How it works.</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-ink-700">
        <li>Sign in with your college email — currently restricted to BIT Mesra.</li>
        <li>Complete your profile: photo, a line about yourself, branch, batch.</li>
        <li>Browse your batch. Search by name, branch, or what people are known for.</li>
      </ol>

      <h2 className="mt-12 font-serif text-2xl">Why.</h2>
      <p className="mt-3 text-ink-700">
        WhatsApp groups die. Instagram stories expire. Within a few years of graduating, batchmates
        get lost. There's no preserved, browseable record of who was in your batch. We'd like there
        to be one.
      </p>
    </article>
  );
}
