-- Branches v2: add level / degree / specialization / sort_order / is_active
-- so the dropdown can group by UG / PG, show full official names, and keep
-- discontinued programs around for alumni.

alter table public.branches
  add column if not exists level text,
  add column if not exists degree text,
  add column if not exists specialization text,
  add column if not exists sort_order integer not null default 100,
  add column if not exists is_active boolean not null default true;

-- Backfill defaults so the new NOT NULL constraints can be applied.
update public.branches set level = 'UG' where level is null;
update public.branches set degree = 'B.Tech' where degree is null;

alter table public.branches
  alter column level set not null,
  alter column degree set not null;

alter table public.branches
  add constraint branches_level_check check (level in ('UG', 'PG'));

create index if not exists branches_college_level_idx
  on public.branches (college_id, level, sort_order);
