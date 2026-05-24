-- Yearbook: Supabase Storage bucket for profile photos
-- Run after RLS policies.

-- Public-read bucket (photos are visible to same-college users only by URL
-- obscurity until we move to signed URLs in v1.5; profile visibility itself
-- is controlled at the DB layer by RLS on profiles).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: only the owning user can write to their own folder
-- Path convention: profile-photos/{user_id}/{filename}

drop policy if exists "profile_photos_insert_own" on storage.objects;
create policy "profile_photos_insert_own" on storage.objects
  for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_photos_update_own" on storage.objects;
create policy "profile_photos_update_own" on storage.objects
  for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_photos_delete_own" on storage.objects;
create policy "profile_photos_delete_own" on storage.objects
  for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_photos_select_public" on storage.objects;
create policy "profile_photos_select_public" on storage.objects
  for select
  using (bucket_id = 'profile-photos');
