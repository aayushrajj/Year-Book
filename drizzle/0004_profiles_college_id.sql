-- 0004: denormalize college_id onto profiles for RLS that doesn't peek at
-- other users' rows.
--
-- The previous "same-college" SELECT policy on profiles joined public.users
-- to look up the profile owner's college. That join is itself subject to RLS,
-- and our users-table policy only lets each user see their own row. Result:
-- the inner join to the target user's row came back empty, the EXISTS
-- evaluated false, and a signed-in user from college A could not see other
-- profiles from college A — even though they should.
--
-- Storing college_id directly on profiles fixes this: the policy only needs
-- to check `profiles.college_id` against the requester's own college_id (and
-- the user is allowed to see their own users row), so the RLS chain stays
-- inside data the requester can already access.

alter table public.profiles
  add column if not exists college_id uuid;

-- backfill from users
update public.profiles p
set college_id = u.college_id
from public.users u
where u.id = p.user_id
  and p.college_id is null;

alter table public.profiles
  alter column college_id set not null;

-- skip adding the FK if it already exists (idempotent re-runs)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_college_id_fk'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_college_id_fk
        foreign key (college_id) references public.colleges(id) on delete restrict;
  end if;
end$$;

create index if not exists profiles_college_year_idx
  on public.profiles (college_id, joining_year)
  where is_published;

-- Replace the SELECT policy with a same-college check that no longer joins
-- other users' rows.
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
          select 1 from public.users me
          where me.id = auth.uid()
            and me.college_id = profiles.college_id
        )
      )
    )
  );

-- Belt-and-suspenders: a trigger to auto-set college_id on insert if the
-- app forgets. SECURITY DEFINER bypasses RLS for the lookup so it works
-- regardless of the caller's perspective.
create or replace function public.set_profile_college_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid_college uuid;
begin
  if new.college_id is null then
    select college_id into uid_college from public.users where id = new.user_id;
    if uid_college is null then
      raise exception 'No college_id found for user %', new.user_id;
    end if;
    new.college_id := uid_college;
  end if;
  return new;
end;
$$;

drop trigger if exists set_profile_college_id_trigger on public.profiles;
create trigger set_profile_college_id_trigger
  before insert on public.profiles
  for each row execute function public.set_profile_college_id();
