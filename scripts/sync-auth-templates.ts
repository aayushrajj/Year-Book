/**
 * Sync Supabase auth email templates so both the magic-link flow (returning
 * users) and the confirmation flow (first-time signups) deliver the same
 * Yearbook-styled email with the 6-digit OTP + clickable link.
 *
 * Without this, new users get Supabase's default "Confirm your email address"
 * template, which has no OTP code — making sign-in impossible cross-device.
 *
 * Usage:
 *   SUPABASE_PROJECT_REF=<ref> SUPABASE_PAT=<sbp_…> \
 *     tsx scripts/sync-auth-templates.ts
 */

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF;

if (!PAT || !REF) {
  console.error(
    "Missing env. Set SUPABASE_PAT (Personal Access Token, sbp_…) and " +
      "SUPABASE_PROJECT_REF (the project ref from your dashboard URL).",
  );
  process.exit(1);
}

const SUBJECT = "{{ .Token }} is your Yearbook sign-in code";

const TEMPLATE = `<!DOCTYPE html>
<html>
  <body style="font-family: ui-sans-serif, -apple-system, system-ui, sans-serif; background: #FAF7F2; color: #1A1814; margin: 0; padding: 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto;">
      <tr><td>
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 500; margin: 0 0 16px; letter-spacing: -0.015em;">
          Your Yearbook sign-in.
        </h1>
        <p style="font-size: 15px; line-height: 1.55; color: #3A352E; margin: 0 0 32px;">
          Use one of the two options below. They expire in an hour and only work once.
        </p>

        <div style="border: 1px solid #E8E1D2; background: #FDFBF7; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-family: ui-monospace, Menlo, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #6B6356;">
            Option A — paste this code
          </p>
          <p style="margin: 0; font-family: ui-monospace, Menlo, monospace; font-size: 36px; font-weight: 500; letter-spacing: 0.4em; color: #1A1814;">
            {{ .Token }}
          </p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #6B6356;">
            Works from any device. Type it into the sign-in screen on your computer.
          </p>
        </div>

        <div style="border: 1px solid #E8E1D2; background: #FDFBF7; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
          <p style="margin: 0 0 12px; font-family: ui-monospace, Menlo, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #6B6356;">
            Option B — click this link
          </p>
          <p style="margin: 0;">
            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 20px; background: #1A1814; color: #FAF7F2; text-decoration: none; border-radius: 6px; font-size: 15px;">
              Sign in to Yearbook
            </a>
          </p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #6B6356;">
            Only works in the same browser where you started signing in.
          </p>
        </div>

        <p style="font-size: 12px; line-height: 1.6; color: #9B9285; margin: 0;">
          If you didn't request this, you can ignore the email. Nobody else can sign in as you without the code or link.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

const payload = {
  // OTP length the {{ .Token }} renders at — must match the 6-digit input
  // on the /login post-send screen.
  mailer_otp_length: 6,
  mailer_otp_exp: 3600,

  // Returning-user flow (signInWithOtp on a confirmed account).
  mailer_subjects_magic_link: SUBJECT,
  mailer_templates_magic_link_content: TEMPLATE,

  // First-time signup flow (signInWithOtp on a brand-new email — Supabase
  // implicitly creates the account and sends this template, not the
  // magic-link one). Same content keeps the UX consistent.
  mailer_subjects_confirmation: SUBJECT,
  mailer_templates_confirmation_content: TEMPLATE,
};

async function main() {
  const url = `https://api.supabase.com/v1/projects/${REF}/config/auth`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
      "User-Agent": "yearbook-auth-sync/0.1",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error(`Failed: HTTP ${res.status}\n${await res.text()}`);
    process.exit(1);
  }
  const body = await res.json();
  console.log("Applied:");
  console.log("  mailer_otp_length:", body.mailer_otp_length);
  console.log("  magic_link subject:", body.mailer_subjects_magic_link);
  console.log("  confirmation subject:", body.mailer_subjects_confirmation);
  const same =
    body.mailer_templates_magic_link_content ===
    body.mailer_templates_confirmation_content;
  console.log("  templates identical:", same ? "yes ✓" : "NO — investigate");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
