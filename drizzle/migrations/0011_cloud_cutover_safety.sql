-- Cutover-safety for moving onto Lovable Cloud.
--
-- 1. Drop the leftover public.practitioners view. It is not created by any
--    repo migration, the app never queries it (directory reads professionals
--    where is_approved = true), and on the linked project the view exposed 3
--    unapproved rows to anon. Do not recreate this view on Cloud.
-- 2. Storage bucket rows are inserted via the query tool at cutover (DML is
--    not allowed in migrations); the bucket policies are created here.

drop view if exists public.practitioners;

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