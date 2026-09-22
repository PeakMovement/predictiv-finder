-- Close two security findings from the cutover:
-- 1. symptom_severity_rules had RLS disabled, so anyone with the anon key could
--    read (and authenticated users change/delete) the rule set. The client never
--    reads this table directly - only the symptom-severity-evaluator edge function
--    does, with the service role, which bypasses RLS. Lock it down to read-only.
ALTER TABLE public.symptom_severity_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read severity rules" ON public.symptom_severity_rules;
CREATE POLICY "Anyone can read active severity rules"
  ON public.symptom_severity_rules
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- 2. The storage read policies still allowed anonymous downloads from the
--    avatars / professional-photos buckets. Those buckets are now private and
--    only the practitioner portal uploads there, so scope reads to signed-in users.
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Authenticated read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public read professional photos" ON storage.objects;
CREATE POLICY "Authenticated read professional photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'professional-photos');