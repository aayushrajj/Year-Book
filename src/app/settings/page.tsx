import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DeleteAccountForm } from "./delete-account-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="container-narrow py-12">
      <h1 className="font-serif text-4xl">Settings</h1>

      <section className="mt-10 border-t border-ink-200/60 pt-6">
        <h2 className="font-serif text-2xl">Account</h2>
        <p className="mt-1 text-sm text-ink-500">
          Signed in as <span className="font-mono text-ink-900">{user.email}</span>
        </p>
        <form action="/auth/sign-out" method="post" className="mt-4">
          <Button variant="secondary" type="submit">
            Sign out
          </Button>
        </form>
        <p className="mt-4 max-w-md text-xs text-ink-500">
          No password to manage. Yearbook signs you in with a one-time code sent to your college
          email — fresh every time, so there's nothing to remember or update.
        </p>
      </section>

      <section className="mt-12 border-t border-ink-200/60 pt-6">
        <h2 className="font-serif text-2xl">Delete account</h2>
        <p className="mt-2 text-sm text-ink-500">
          Hard delete. Your profile, photo, and all associated data are removed. This cannot be
          undone.
        </p>
        <div className="mt-4">
          <DeleteAccountForm email={user.email} />
        </div>
      </section>
    </div>
  );
}
