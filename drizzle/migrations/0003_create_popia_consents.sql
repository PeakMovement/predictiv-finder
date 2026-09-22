
CREATE TABLE public.popia_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  consent_version text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  UNIQUE (user_id, consent_version)
);

GRANT SELECT, INSERT ON public.popia_consents TO authenticated;
GRANT ALL ON public.popia_consents TO service_role;

ALTER TABLE public.popia_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consents"
  ON public.popia_consents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own consents"
  ON public.popia_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_popia_consents_user_version ON public.popia_consents (user_id, consent_version);