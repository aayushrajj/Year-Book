-- Yearbook RLS policies
-- Run AFTER drizzle-kit's generated initial schema migration.
-- RLS is the primary security model; application checks are belt-and-suspenders.

-- ---------------------------------------------------------------------------
-- Enable RLS on all app tables
-- ---------------------------------------------------------------------------

alter table public.colleges enable row level security;
alter table public.branches enable row level security;
alter table public.users enable row level security;
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- colleges: world-readable (used by the login dropdown). No writes from clients.
-- ---------------------------------------------------------------------------

drop policy if exists "colleges_select_public" on public.colleges;
create policy "colleges_select_public" on public.colleges
  for select
  using (true);

-- ---------------------------------------------------------------------------
-- branches: world-readable. No writes from clients.
-- ---------------------------------------------------------------------------

drop policy if exists "branches_select_public" on public.branches;
create policy "branches_select_public" on public.branches
  for select
  using (true);

-- ---------------------------------------------------------------------------
-- users: a user can only read their own row.
-- INSERT happens via trigger from auth.users (see below), so no INSERT policy.
-- ---------------------------------------------------------------------------

drop policy if exists "users_select_self" on public.users;
create policy "users_select_self" on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- profiles: the security boundary.
--
-- SELECT: a profile is visible iff
--   - the requester is signed in, AND
--   - the requester's college_id == the profile's owner's college_id, AND
--   - the profile is published (is_published = true) OR the requester is the owner.
--
-- INSERT/UPDATE/DELETE: only the owner.
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_same_college" on public.profiles;
create policy "profiles_select_same_college" on public.profiles
  for select
  using (
    auth.uid() is not null
    and (
      auth.uid() = user_id
      or (
        is_published = true
        and exists (
          select 1
          from public.users me
          join public.users target on target.id = profiles.user_id
          where me.id = auth.uid()
            and me.college_id = target.college_id
        )
      )
    )
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Composite uniqueness: username unique within (college, joining_year).
-- Expressed as a partial unique index that joins users for college_id.
-- We use a materialized expression via a unique index on (lower(username), branch_id...)
-- but the cleanest way is a unique index on (user_id) (already there) + an
-- application-side username generator that includes a college/year scope.
-- Here we enforce a simpler global username uniqueness, which the generator respects.
-- ---------------------------------------------------------------------------

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- Trigger: when a new auth.users row is created, insert a matching row in
-- public.users. The college_id is read from raw_user_meta_data which we set
-- during signup. This keeps the mirror table in sync without round-trips.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_college_slug text;
  resolved_college_id uuid;
begin
  meta_college_slug := coalesce(new.raw_user_meta_data ->> 'college_slug', '');

  select id into resolved_college_id
  from public.colleges
  where slug = meta_college_slug and is_active = true
  limit 1;

  if resolved_college_id is null then
    raise exception 'No active college for slug %', meta_college_slug;
  end if;

  insert into public.users (id, email, college_id)
  values (new.id, new.email, resolved_college_id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Trigger: when auth.users is deleted, cascade to public.users.
-- (FK from public.users.id → auth.users.id is implicit because both share the
--  uuid. We rely on the cascade from public.users → profiles via Drizzle FK.)
-- ---------------------------------------------------------------------------

create or replace function public.handle_auth_user_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_auth_user_deleted();

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_users_updated_at on public.users;
create trigger touch_users_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_colleges_updated_at on public.colleges;
create trigger touch_colleges_updated_at
  before update on public.colleges
  for each row execute function public.touch_updated_at();
