/*
  # Initial Schema Setup

  ## Summary
  Applies the full initial schema for the application including:
  - Core helper functions (handle_new_user, update_updated_at_column)
  - profiles table for all users
  - professionals table for healthcare practitioners
  - health_plans table for user health plans
  - bookings table
  - calendar_integrations and availability_slots
  - user_preferences and search_history
  - user_physician_preferences
  - All RLS policies
  - All triggers

  This migration is idempotent (uses IF NOT EXISTS throughout).
*/

-- Helper functions
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

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  profession text NOT NULL,
  specialities text[] NOT NULL DEFAULT '{}',
  price_min integer,
  price_max integer,
  location text,
  google_reviews_url text,
  calendly_url text NOT NULL,
  photo_url text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Professionals can view their own profile" ON public.professionals;
CREATE POLICY "Professionals can view their own profile"
ON public.professionals FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals can update their own profile" ON public.professionals;
CREATE POLICY "Professionals can update their own profile"
ON public.professionals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals can insert their own profile" ON public.professionals;
CREATE POLICY "Professionals can insert their own profile"
ON public.professionals FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view approved professionals" ON public.professionals;
CREATE POLICY "Anyone can view approved professionals"
ON public.professionals FOR SELECT
USING (is_approved = true);

DROP TRIGGER IF EXISTS update_professionals_updated_at ON public.professionals;
CREATE TRIGGER update_professionals_updated_at
BEFORE UPDATE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Health plans table
CREATE TABLE IF NOT EXISTS public.health_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  plan_type text NOT NULL,
  services jsonb,
  total_cost numeric,
  time_frame text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.health_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own health plans" ON public.health_plans;
CREATE POLICY "Users can view own health plans"
ON public.health_plans FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own health plans" ON public.health_plans;
CREATE POLICY "Users can create own health plans"
ON public.health_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own health plans" ON public.health_plans;
CREATE POLICY "Users can update own health plans"
ON public.health_plans FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own health plans" ON public.health_plans;
CREATE POLICY "Users can delete own health plans"
ON public.health_plans FOR DELETE
USING (auth.uid() = user_id);

-- Calendar integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  access_token text,
  refresh_token text,
  token_expiry timestamp with time zone,
  calendar_id text,
  webhook_url text,
  last_synced_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Practitioners can view own integrations" ON public.calendar_integrations;
CREATE POLICY "Practitioners can view own integrations"
ON public.calendar_integrations FOR SELECT
USING (auth.uid() = practitioner_id);

DROP POLICY IF EXISTS "Practitioners can insert own integrations" ON public.calendar_integrations;
CREATE POLICY "Practitioners can insert own integrations"
ON public.calendar_integrations FOR INSERT
WITH CHECK (auth.uid() = practitioner_id);

DROP POLICY IF EXISTS "Practitioners can update own integrations" ON public.calendar_integrations;
CREATE POLICY "Practitioners can update own integrations"
ON public.calendar_integrations FOR UPDATE
USING (auth.uid() = practitioner_id);

DROP POLICY IF EXISTS "Practitioners can delete own integrations" ON public.calendar_integrations;
CREATE POLICY "Practitioners can delete own integrations"
ON public.calendar_integrations FOR DELETE
USING (auth.uid() = practitioner_id);

-- Availability slots table
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL,
  calendar_integration_id uuid REFERENCES public.calendar_integrations(id),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  event_title text,
  external_event_id text,
  sync_source text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view availability slots" ON public.availability_slots;
CREATE POLICY "Anyone can view availability slots"
ON public.availability_slots FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Practitioners can insert own slots" ON public.availability_slots;
CREATE POLICY "Practitioners can insert own slots"
ON public.availability_slots FOR INSERT
WITH CHECK (auth.uid() = practitioner_id);

DROP POLICY IF EXISTS "Practitioners can update own slots" ON public.availability_slots;
CREATE POLICY "Practitioners can update own slots"
ON public.availability_slots FOR UPDATE
USING (auth.uid() = practitioner_id);

DROP POLICY IF EXISTS "Practitioners can delete own slots" ON public.availability_slots;
CREATE POLICY "Practitioners can delete own slots"
ON public.availability_slots FOR DELETE
USING (auth.uid() = practitioner_id);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  practitioner_id uuid NOT NULL,
  plan_id uuid REFERENCES public.health_plans(id),
  appointment_date timestamp with time zone NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
CREATE POLICY "Users can create own bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  preferred_location text,
  budget_range text,
  preferred_professions text[] DEFAULT '{}',
  notification_settings jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own preferences" ON public.user_preferences;
CREATE POLICY "Users can create own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences FOR DELETE
USING (auth.uid() = user_id);

-- Search history table
CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  health_issue text NOT NULL,
  budget integer,
  location text,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
CREATE POLICY "Users can view their own search history"
ON public.search_history FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own search history" ON public.search_history;
CREATE POLICY "Users can create their own search history"
ON public.search_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own search history" ON public.search_history;
CREATE POLICY "Users can delete their own search history"
ON public.search_history FOR DELETE
USING (auth.uid() = user_id);

-- User physician preferences table
CREATE TABLE IF NOT EXISTS public.user_physician_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  physician_name text NOT NULL,
  physician_title text NOT NULL,
  physician_location text NOT NULL,
  selection_count integer NOT NULL DEFAULT 1,
  last_selected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, physician_name)
);

ALTER TABLE public.user_physician_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own physician preferences" ON public.user_physician_preferences;
CREATE POLICY "Users can view their own physician preferences"
ON public.user_physician_preferences FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own physician preferences" ON public.user_physician_preferences;
CREATE POLICY "Users can create their own physician preferences"
ON public.user_physician_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own physician preferences" ON public.user_physician_preferences;
CREATE POLICY "Users can update their own physician preferences"
ON public.user_physician_preferences FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own physician preferences" ON public.user_physician_preferences;
CREATE POLICY "Users can delete their own physician preferences"
ON public.user_physician_preferences FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_physician_preferences_updated_at ON public.user_physician_preferences;
CREATE TRIGGER update_user_physician_preferences_updated_at
BEFORE UPDATE ON public.user_physician_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI interactions table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  context jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own interactions" ON public.ai_interactions;
CREATE POLICY "Users can view their own interactions"
ON public.ai_interactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own interactions" ON public.ai_interactions;
CREATE POLICY "Users can create their own interactions"
ON public.ai_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Security helper function
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = _user_id
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_physician_preferences_user_id ON public.user_physician_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_approved ON public.professionals(is_approved);
