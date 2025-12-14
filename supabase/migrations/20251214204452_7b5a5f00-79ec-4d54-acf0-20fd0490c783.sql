-- PHASE 1.1: Core Data and Security Hardening

-- 1. Fix function search_path vulnerabilities
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix calendar_integrations RLS - CRITICAL: Only practitioners can access their own integrations
DROP POLICY IF EXISTS "Users can manage calendar integrations" ON public.calendar_integrations;

CREATE POLICY "Practitioners can view own integrations"
ON public.calendar_integrations
FOR SELECT
USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert own integrations"
ON public.calendar_integrations
FOR INSERT
WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update own integrations"
ON public.calendar_integrations
FOR UPDATE
USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete own integrations"
ON public.calendar_integrations
FOR DELETE
USING (auth.uid() = practitioner_id);

-- 3. Fix availability_slots RLS - CRITICAL: Public can view, only owners can manage
DROP POLICY IF EXISTS "Authenticated users can view availability slots" ON public.availability_slots;
DROP POLICY IF EXISTS "Practitioners can manage their availability slots" ON public.availability_slots;

CREATE POLICY "Anyone can view availability slots"
ON public.availability_slots
FOR SELECT
USING (true);

CREATE POLICY "Practitioners can insert own slots"
ON public.availability_slots
FOR INSERT
WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update own slots"
ON public.availability_slots
FOR UPDATE
USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete own slots"
ON public.availability_slots
FOR DELETE
USING (auth.uid() = practitioner_id);

-- 4. Add missing DELETE policies for user privacy
CREATE POLICY "Users can delete their own search history"
ON public.search_history
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Create ai_interactions table for audit logging (referenced by edge function)
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  context jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions"
ON public.ai_interactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
ON public.ai_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Create security helper function for role checking (future-proofing)
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = _user_id
$$;