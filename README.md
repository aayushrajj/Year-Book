# Yearbook

An interactive digital yearbook for college batches. v1 launches with BIT Mesra.

---

## Stack

- **Next.js 15** (App Router) + TypeScript (strict)
- **Tailwind CSS**, `next/font` (Fraunces + Inter + JetBrains Mono)
- **Supabase** — Postgres, Auth (magic link), Storage
- **Drizzle ORM** + Drizzle Kit migrations
- **Zod** at every boundary
- **Biome** for lint + format; **Vitest** for unit tests
- **pnpm**

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then fill in Supabase keys (see below)
pnpm dev
```

The app runs at <http://localhost:3000>. Without Supabase credentials, the UI
renders but auth and DB calls will fail.

## Supabase setup (first run)

1. Create a project at <https://supabase.com>. Pick a region close to your users.
2. Project Settings → API: copy the **Project URL**, **anon public key**, and
   **service_role secret key** into `.env.local`.
3. Project Settings → Database → Connection string → URI: copy into `DATABASE_URL`.
4. Authentication → Providers → Email: enable, set **Magic link** on.
5. Authentication → URL Configuration: add `http://localhost:3000/login/callback`
   to the allowed redirect URLs.
6. Apply migrations:
   ```bash
   pnpm db:migrate
   pnpm db:seed   # seeds BIT Mesra + branches
   ```
7. Storage: the `profile-photos` bucket is created automatically by
   `drizzle/0002_storage_bucket.sql`. If your project doesn't allow the SQL to
   `insert into storage.buckets`, create it manually as **public**, 5 MB cap,
   allowed MIME `image/jpeg, image/png, image/webp`.

## Scripts

```bash
pnpm dev          # next dev
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome lint
pnpm check        # biome lint + format check
pnpm test         # vitest run
pnpm db:generate  # drizzle-kit generate from schema.ts
pnpm db:migrate   # run drizzle migrations
pnpm db:seed      # seed colleges + branches
pnpm db:studio    # drizzle studio
```

## Source layout

```
src/
  app/                # App Router routes
    page.tsx          # landing
    login/            # magic-link sign-in
    onboarding/       # first-time profile creation
    me/               # edit own profile
    settings/         # sign out + delete account
    about/, privacy/  # public content
    auth/sign-out/    # POST → clears session
  components/
    layout/           # site header + footer
    profile/          # ProfileForm (used by onboarding & /me)
    ui/               # button, input, label primitives
  db/
    schema.ts         # Drizzle schema
    seed.ts           # BIT Mesra + branches
    migrate.ts        # migration runner
  lib/
    supabase/         # server, browser, middleware, admin clients
    auth.ts           # getCurrentUser, requireUser, profile context
    colleges.ts       # cached college + branch fetchers
    constants.ts      # limits, allowlists
    env.ts            # Zod-validated env
    profile.ts        # username generator
    validators.ts     # Zod schemas for forms
    utils.ts          # cn, slugify
  middleware.ts       # refreshes Supabase session on every request
drizzle/
  0000_init.sql       # tables (generated)
  0001_rls_policies.sql  # RLS + triggers (the security boundary)
  0002_storage_bucket.sql
```

## Security model

RLS is the primary security boundary. See `drizzle/0001_rls_policies.sql`:

- Profiles are visible only to users in the **same college** (`college_id` join via `public.users`).
- Profile writes are restricted to the owner (`auth.uid() = user_id`).
- A trigger on `auth.users` insert mirrors the row into `public.users` with the
  `college_id` resolved from the `college_slug` we put in `raw_user_meta_data`
  during signup.

Application checks (`requireUser()`, server-action guards) are belt-and-
suspenders; do **not** rely on them as the only line of defense.

## What's done (Phase 0 + 1)

- Scaffold, tooling, CI, design tokens
- Drizzle schema + RLS policies + storage bucket + triggers
- Magic-link auth (college-gated, domain-locked)
- Onboarding flow with photo compression + upload
- Edit profile (`/me`)
- Settings + hard-delete account
- Landing, about, privacy pages

## What's next (Phase 2)

See `plan.md §7` — batch view, profile page, search, OG cards, motion polish.
