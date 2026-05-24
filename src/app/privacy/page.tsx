import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Plain-English privacy practices.",
};

export default function PrivacyPage() {
  return (
    <article className="container-narrow py-16 text-ink-700">
      <h1 className="font-serif text-4xl text-ink-900">Privacy.</h1>
      <p className="mt-3 text-sm text-ink-500">Plain English. No dark patterns.</p>

      <h2 className="mt-10 font-serif text-2xl text-ink-900">What we collect</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Your college email (for verification).</li>
        <li>Whatever you put on your profile: name, photo, one-liner, branch, batch, hometown, socials.</li>
        <li>Minimal request metadata (so we can keep the site running).</li>
      </ul>

      <h2 className="mt-10 font-serif text-2xl text-ink-900">Who can see your profile</h2>
      <p className="mt-3">
        Only verified students from the same college. Cross-college access is blocked at the
        database layer, not just the app layer.
      </p>

      <h2 className="mt-10 font-serif text-2xl text-ink-900">What we don't do</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Sell or share your data. Ever.</li>
        <li>Run third-party tracking pixels.</li>
        <li>Profile you with advertising tech.</li>
      </ul>

      <h2 className="mt-10 font-serif text-2xl text-ink-900">Deletion</h2>
      <p className="mt-3">
        You can hard-delete your account from <a className="underline" href="/settings">Settings</a>.
        Your profile, photo, and account row are removed. We retain minimal logs for up to 30 days
        for abuse prevention, then they're gone.
      </p>

      <h2 className="mt-10 font-serif text-2xl text-ink-900">Contact</h2>
      <p className="mt-3">
        Questions: <a className="underline" href="mailto:hi@yearbook.example">hi@yearbook.example</a>
      </p>
    </article>
  );
}
