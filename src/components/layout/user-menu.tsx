"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import type { Route } from "next";
import { AvatarPlaceholder } from "@/components/profile/avatar-placeholder";

type Props = {
  displayName: string;
  /** Used as the deterministic seed for the gradient avatar. */
  avatarSeed: string;
  /** Public URL of the user's photo, or null. */
  photoUrl: string | null;
  profileHref: Route;
  batchHref: Route;
};

export function UserMenu({ displayName, avatarSeed, photoUrl, profileHref, batchHref }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent px-1.5 py-1 text-sm text-ink-700 transition-colors hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
          aria-label="Account menu"
        >
          <span className="h-7 w-7 overflow-hidden rounded-md border border-ink-200">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <AvatarPlaceholder seed={avatarSeed} name={displayName} size="sm" />
            )}
          </span>
          <span className="hidden font-sans sm:inline">{firstName(displayName)}</span>
          <ChevronIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[200px] overflow-hidden rounded-md border border-ink-200 bg-cream-50 p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        >
          {/* small mobile-only header so the dropdown isn't a mystery on phones */}
          <div className="border-b border-ink-200/60 px-2.5 py-2 sm:hidden">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
              Signed in
            </p>
            <p className="mt-0.5 truncate text-sm text-ink-900">{displayName}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href={profileHref}
              className="flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-sm text-ink-900 outline-none transition-colors data-[highlighted]:bg-cream-200"
            >
              My profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href={batchHref}
              className="flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-sm text-ink-900 outline-none transition-colors data-[highlighted]:bg-cream-200"
            >
              My batch
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              // biome-ignore lint/suspicious/noExplicitAny: typedRoutes — /settings is static so this is just a TS prop tightening
              href={"/settings" as any}
              className="flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-sm text-ink-900 outline-none transition-colors data-[highlighted]:bg-cream-200"
            >
              Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-ink-200/60" />

          <DropdownMenu.Item asChild>
            <form action="/auth/sign-out" method="post" className="m-0">
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center rounded-sm px-2.5 py-2 text-left text-sm text-ink-700 outline-none transition-colors hover:text-ink-900 data-[highlighted]:bg-cream-200"
              >
                Sign out
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0] ?? s;
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      className="text-ink-500"
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
