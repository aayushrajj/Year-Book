import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Signing you in…",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  code?: string;
  token_hash?: string;
  type?: string;
  error?: string;
  error_description?: string;
}>;

/**
 * Magic-link landing page. Runs as a server component so failures can render
 * a useful error UI instead of bouncing through a hidden redirect.
 *
 * Why a page and not a route handler:
 *   - PKCE flow stores the code_verifier in cookies on the browser that
 *     called `signInWithOtp`. If the user clicks the magic link from a
 *     different browser/device (very common — email opened on phone, dev
 *     server running on laptop), the verifier isn't present and
 *     `exchangeCodeForSession` fails. A redirect to /login?error=... is
 *     opaque; rendering the failure here lets us tell them what to do.
 */
export default async function CallbackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await getSupabaseServer();

  // Supabase can pass an error back as a query param if the link itself was bad.
  if (params.error) {
    return <ErrorScreen title="That link didn't work." detail={params.error_description ?? params.error} />;
  }

  let exchangeError: string | null = null;

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) exchangeError = error.message;
  } else if (params.token_hash && params.type) {
    const { error } = await supabase.auth.verifyOtp({
      // biome-ignore lint/suspicious/noExplicitAny: Supabase's type union is wide; the value comes from our own outbound magic-link email.
      type: params.type as any,
      token_hash: params.token_hash,
    });
    if (error) exchangeError = error.message;
  } else {
    return (
      <ErrorScreen
        title="Missing sign-in token."
        detail="The link didn't include the credentials we need. Request a new sign-in email."
      />
    );
  }

  if (exchangeError) {
    return <ErrorScreen title="Could not finish signing you in." detail={exchangeError} />;
  }

  // Successful exchange → route based on profile state.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_published")
    .maybeSingle();

  redirect(profile ? "/me" : "/onboarding");
}

function ErrorScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="container-narrow flex min-h-[calc(100vh-4rem)] items-center py-16">
      <div className="w-full">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-500">Sign-in error</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{title}</h1>

        <p className="mt-4 max-w-md text-ink-700">{detail}</p>

        <div className="mt-8 rounded-md border border-ink-200/60 bg-cream-50 p-5 text-sm text-ink-700">
          <p className="font-medium text-ink-900">A common cause:</p>
          <p className="mt-2">
            You opened the email on a different device or browser than where you started signing
            in. The magic link needs the same browser; the 6-digit code in the email body works
            from anywhere.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-ink-900 px-5 py-3 font-sans text-cream-100 transition-colors hover:bg-ink-700"
          >
            Start over
          </Link>
        </div>
      </div>
    </div>
  );
}
