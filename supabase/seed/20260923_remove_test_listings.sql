-- Review before running. Removes the two fake rows that were seeded during
-- development and are otherwise counted as real practices in every report.
--
-- Check first:
--   SELECT id, name, practice_name, profession, suburb, is_approved
--   FROM public.professionals
--   WHERE name IN ('Aladdin Jacobson', 'Samuel Stout');
--
-- Then:
DELETE FROM public.professionals
WHERE name IN ('Aladdin Jacobson', 'Samuel Stout')
  AND user_id IS NULL;
