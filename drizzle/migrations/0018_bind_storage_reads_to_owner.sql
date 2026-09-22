-- Scope photo reads to the file's owner (the practitioner viewing their own profile).
DROP POLICY IF EXISTS "Authenticated read avatars" ON storage.objects;
CREATE POLICY "Authenticated read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND owner_id = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Authenticated read professional photos" ON storage.objects;
CREATE POLICY "Authenticated read professional photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'professional-photos'
    AND owner_id = (select auth.uid()::text)
  );