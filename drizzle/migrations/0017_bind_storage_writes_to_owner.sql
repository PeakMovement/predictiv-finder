-- Bind all avatars / professional-photos write policies to the uploading user
-- so signed-in users can only touch their own files (files are named "<uid>-<random>").
DROP POLICY IF EXISTS "Authenticated upload avatars" ON storage.objects;
CREATE POLICY "Authenticated upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND owner_id = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Authenticated update avatars" ON storage.objects;
CREATE POLICY "Authenticated update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND owner_id = (select auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND owner_id = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Authenticated upload professional photos" ON storage.objects;
CREATE POLICY "Authenticated upload professional photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'professional-photos'
    AND owner_id = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Authenticated update professional photos" ON storage.objects;
CREATE POLICY "Authenticated update professional photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'professional-photos'
    AND owner_id = (select auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'professional-photos'
    AND owner_id = (select auth.uid()::text)
  );