"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getColleges } from "@/lib/colleges";
import { emailLocalpartSchema } from "@/lib/validators";
import { env } from "@/lib/env";

const sendLinkSchema = z.object({
  collegeSlug: z.string().min(1, "Pick a college"),
  localpart: emailLocalpartSchema,
});

export type SendLinkState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "sent"; email: string };

export async function sendMagicLink(
  _prev: SendLinkState,
  formData: FormData,
): Promise<SendLinkState> {
  const parsed = sendLinkSchema.safeParse({
    collegeSlug: formData.get("collegeSlug"),
    localpart: formData.get("localpart"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", message: first?.message ?? "Invalid input" };
  }

  const { collegeSlug, localpart } = parsed.data;

  const colleges = await getColleges();
  const college = colleges.find((c) => c.slug === collegeSlug);
  if (!college) {
    return { status: "error", message: "Unknown college" };
  }
  if (!college.isActive) {
    return { status: "error", message: "This college isn't open yet." };
  }

  const email = `${localpart}@${college.emailDomain}`;
  const supabase = await getSupabaseServer();

  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const host = headerStore.get("host");
  const origin = host ? `${proto}://${host}` : env.NEXT_PUBLIC_SITE_URL;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/login/callback`,
      data: { college_slug: collegeSlug },
    },
  });

  if (error) {
    console.error("magic-link error:", { code: error.code, status: error.status, message: error.message });

    // Surface specific Supabase errors with copy that actually helps.
    // Most common in dev: built-in mailer rate limit (2 emails/hour, project-wide,
    // can't be raised without custom SMTP).
    const msg = error.message?.toLowerCase() ?? "";
    if (
      error.code === "over_email_send_rate_limit" ||
      error.status === 429 ||
      msg.includes("rate limit") ||
      msg.includes("email rate")
    ) {
      return {
        status: "error",
        message:
          "Email send limit reached for this project. Wait an hour and try again, or ask the admin to set up custom SMTP.",
      };
    }
    if (msg.includes("invalid") && msg.includes("email")) {
      return { status: "error", message: "That email doesn't look right. Double-check and retry." };
    }
    return {
      status: "error",
      message: `Could not send the code. ${error.message ?? "Try again in a moment."}`,
    };
  }

  return { status: "sent", email };
}

// ---------------------------------------------------------------------------
// OTP code verification (cross-device-friendly path).
// The user can either click the magic link OR paste the 6-digit code from
// the email body. Code path works even from a phone reading email while
// typing into the laptop browser.
// ---------------------------------------------------------------------------

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from the email"),
});

export type VerifyCodeState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function verifyOtpCode(
  _prev: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const parsed = verifyCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", message: first?.message ?? "Invalid input" };
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "Token has expired or is invalid"
          ? "That code didn't match. Check the email or request a new one."
          : error.message,
    };
  }

  // Session is now set in cookies. Decide where to go next.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_published")
    .maybeSingle();

  redirect(profile ? "/me" : "/onboarding");
}
