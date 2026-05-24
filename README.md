# Yearbook

An interactive digital yearbook for college batches.

A college-gated space where verified students from a single batch can browse
each other's profiles — one photo, one line, one thing you're known for. Not a
social network. No feed, no DMs, no notifications. Visible only to your batch.

The launch cohort is BIT Mesra. The architecture is multi-tenant from day one
so other colleges can be added without code changes.

---

## Stack

- **Next.js 15** (App Router) + TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Tailwind CSS** + `next/font` (Fraunces + Inter + JetBrains Mono, self-hosted)
- **Supabase** — Postgres, Auth (magic link + 6-digit OTP), Storage
- **Drizzle ORM** + Drizzle Kit migrations
- **Zod** for runtime validation at every boundary
- **Radix UI** primitives (Select), styled to the project's design system
- **Biome** for lint + format
- **Vitest** for unit tests
- **pnpm** for package management

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then fill in Supabase keys (see below)
pnpm dev
```

The app runs at <http://localhost:3000>. Without Supabase credentials, the UI
renders but auth and DB calls will fail.

## Supabase setup

1. Create a project at <https://supabase.com>. Pick a region close to your users.
2. Project Settings → API: copy the **Project URL**, **anon public key**, and
   **service_role secret key** into `.env.local`.
3. Project Settings → Database → Connection string → URI: copy into `DATABASE_URL`.
4. Authentication → Providers → Email: enable. Magic link is on by default.
5. Authentication → URL Configuration: add `http://localhost:3000/login/callback`
   to the allowed redirect URLs.
6. Apply schema and seed:
   ```bash
   pnpm db:migrate
   pnpm db:seed   # seeds the launch college + branches
   ```
7. Storage: the `profile-photos` bucket is created automatically by
   `drizzle/0002_storage_bucket.sql`. If your project rejects the SQL, create it
   manually: **public**, 5 MB cap, MIME allowlist `image/jpeg, image/png, image/webp`.

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
    login/            # email entry → 6-digit OTP code
    onboarding/       # first-time profile creation
    me/               # edit own profile
    settings/         # sign out + hard-delete account
    about/, privacy/  # public content
    auth/sign-out/    # POST → clears session
  components/
    layout/           # site header + footer
    profile/          # ProfileForm (used by onboarding & /me)
    ui/               # button, input, label, select primitives
  db/
    schema.ts         # Drizzle schema
    seed.ts           # college + branches seed
    migrate.ts        # migration runner
  lib/
    supabase/         # server, browser, middleware, admin clients
    auth.ts           # getCurrentUser, requireUser, profile context
    colleges.ts       # cached college + branch fetchers
    constants.ts      # limits, allowlists
    env.ts            # Zod-validated env
    profile.ts        # username generator (collision-safe)
    validators.ts     # Zod schemas for forms
    utils.ts          # cn, slugify
  middleware.ts       # refreshes Supabase session on every request
drizzle/
  0000_init.sql               # tables (generated)
  0001_rls_policies.sql       # RLS + triggers (the security boundary)
  0002_storage_bucket.sql     # storage bucket + RLS
```

## Architecture notes

### Auth

Two flows from the same `/login` entry point:

- **Magic link** — convenient on a single device. Click the link in the email
  and you're signed in. Uses Supabase PKCE; requires the same browser that
  started sign-in.
- **6-digit OTP code** — robust across devices. Read the code from the email
  on your phone, type it on your laptop. Always works.

Email entry is domain-locked per college (e.g. `@bitmesra.ac.in`).

### Multi-tenancy & RLS

The data hierarchy is `College → Batch → Branch → Student`. A student belongs
to exactly one batch in one college. Branch is a filter on the batch view, not
its own page.

Row-Level Security is the primary security boundary. See
[`drizzle/0001_rls_policies.sql`](./drizzle/0001_rls_policies.sql):

- Profiles are visible only to users in the **same college**
  (`college_id` join via `public.users`).
- Profile writes are restricted to the owner (`auth.uid() = user_id`).
- A trigger on `auth.users` insert mirrors the row into `public.users` with
  `college_id` resolved from the `college_slug` we put in `raw_user_meta_data`
  during signup. Cross-college reads are blocked at the DB layer.

Application checks (`requireUser()`, server-action guards) are
belt-and-suspenders; **RLS is the line of defense**.

### Image pipeline

- Client-side compression with `browser-image-compression` (WebP, max 1600 px,
  ~600 KB target).
- Direct upload to Supabase Storage, scoped to `profile-photos/<user_id>/…`
  with RLS allowing only the owner to write.
- Served via `next/image` for responsive sizing.

## License

Not currently licensed for redistribution. Contact the author if you'd like to
adapt this for your campus.
