"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Label } from "@/components/ui/label";
import { Select, SelectGroup, SelectItem, SelectSeparator } from "@/components/ui/select";
import type { CollegeOption } from "@/lib/colleges";
import {
  sendMagicLink,
  verifyOtpCode,
  type SendLinkState,
  type VerifyCodeState,
} from "./actions";

const sendInitial: SendLinkState = { status: "idle" };
const verifyInitial: VerifyCodeState = { status: "idle" };

export function LoginForm({ colleges }: { colleges: CollegeOption[] }) {
  const activeColleges = useMemo(() => colleges.filter((c) => c.isActive), [colleges]);
  const inactiveColleges = useMemo(() => colleges.filter((c) => !c.isActive), [colleges]);

  const [sendState, sendAction, sendPending] = useActionState(sendMagicLink, sendInitial);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpCode, verifyInitial);

  const [collegeSlug, setCollegeSlug] = useState<string>(activeColleges[0]?.slug ?? "");

  const selected = useMemo(
    () => colleges.find((c) => c.slug === collegeSlug),
    [collegeSlug, colleges],
  );

  // After the magic link is sent, swap the form for the code-entry step.
  if (sendState.status === "sent") {
    return <CodeStep email={sendState.email} state={verifyState} action={verifyAction} pending={verifyPending} />;
  }

  return (
    <form action={sendAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="collegeSlug">College</Label>
        <Select
          id="collegeSlug"
          name="collegeSlug"
          value={collegeSlug}
          onValueChange={setCollegeSlug}
          required
          placeholder="Pick your college"
        >
          {activeColleges.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
          {inactiveColleges.length > 0 ? (
            <>
              <SelectSeparator />
              <SelectGroup label="Coming soon">
                {inactiveColleges.map((c) => (
                  <SelectItem key={c.slug} value={c.slug} disabled>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : null}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="localpart" hint={selected ? `@${selected.emailDomain}` : undefined}>
          College email
        </Label>
        <div className="flex items-stretch overflow-hidden rounded-md border border-ink-200 bg-cream-50 focus-within:border-ink-700">
          <input
            id="localpart"
            name="localpart"
            type="text"
            autoComplete="email"
            required
            placeholder="your.name"
            pattern="[a-zA-Z0-9._%+\\-]+"
            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-ink-900 placeholder:text-ink-300 focus:outline-none"
          />
          <span className="flex items-center bg-cream-200 px-3 font-mono text-sm text-ink-500">
            @{selected?.emailDomain ?? ""}
          </span>
        </div>
      </div>

      {sendState.status === "error" ? <FieldError message={sendState.message} /> : null}

      <Button type="submit" disabled={sendPending || !selected}>
        {sendPending ? "Sending…" : "Send sign-in code"}
      </Button>

      <p className="font-mono text-xs text-ink-300">
        By signing in you agree to our{" "}
        <a href="/privacy" className="underline">
          privacy practices
        </a>
        . Only verified students from the same college can see your profile.
      </p>
    </form>
  );
}

function CodeStep({
  email,
  state,
  action,
  pending,
}: {
  email: string;
  state: VerifyCodeState;
  action: (formData: FormData) => void;
  pending: boolean;
}) {
  // Focus the code input as soon as the step renders. Done programmatically
  // (rather than autoFocus) so it's tied to the user-initiated transition,
  // and so we don't trip a11y warnings about disruptive auto-focus.
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-ink-200 bg-cream-50 p-5">
        <h2 className="font-serif text-2xl">Check your inbox.</h2>
        <p className="mt-2 text-sm text-ink-500">
          We sent a sign-in email to{" "}
          <span className="font-mono text-ink-900">{email}</span>. It expires in an hour.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          <li className="flex gap-2">
            <span className="font-mono text-ink-500">a.</span>
            <span>Click the link in the email — works if you opened it on this device.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-ink-500">b.</span>
            <span>
              Or paste the <span className="font-mono">6-digit code</span> from the email below —
              works from any device.
            </span>
          </li>
        </ul>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />

        <Label htmlFor="code" hint="from the email">
          Sign-in code
        </Label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          ref={codeRef}
          required
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder="123456"
          className="h-14 w-full rounded-md border border-ink-200 bg-cream-50 px-4 text-center font-mono text-2xl tracking-[0.4em] text-ink-900 placeholder:text-ink-300 focus:border-ink-700 focus:outline-none transition-colors"
        />

        {state.status === "error" ? <FieldError message={state.message} /> : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Verifying…" : "Sign in"}
        </Button>

        <p className="font-mono text-xs text-ink-300">
          Didn't get the email? Check spam, then{" "}
          <a href="/login" className="underline">
            start over
          </a>
          .
        </p>
      </form>
    </div>
  );
}
