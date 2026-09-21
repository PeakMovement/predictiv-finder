-- Cutover-safety for moving off the linked supabase.com project
-- (zpddlphtoeluytrejioj) onto Lovable Cloud.
--
-- 1. Drop the leftover public.practitioners view. It is not created by any
--    repo migration, the app never queries it (directory reads professionals
--    where is_approved = true), and on 2026-09-21 the live view exposed 3
--    unapproved rows to anon (professionals RLS correctly hid those 37-3).
--    Do not recreate this view on Cloud.
-- 2. Ensure the storage buckets the portal upload helpers expect exist with
--    public read. Object lists on the linked project were empty; creating
--    these on Cloud (and on the linked project if missing) is idempotent.

drop view if exists public.practitioners;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'professional-photos',
    'professional-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
on conflict (id) do nothing;

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated upload avatars" on storage.objects;
create policy "Authenticated upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

drop policy if exists "Authenticated update avatars" on storage.objects;
create policy "Authenticated update avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

drop policy if exists "Public read professional photos" on storage.objects;
create policy "Public read professional photos"
  on storage.objects for select
  using (bucket_id = 'professional-photos');

drop policy if exists "Authenticated upload professional photos" on storage.objects;
create policy "Authenticated upload professional photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'professional-photos');

drop policy if exists "Authenticated update professional photos" on storage.objects;
create policy "Authenticated update professional photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'professional-photos')
  with check (bucket_id = 'professional-photos');
