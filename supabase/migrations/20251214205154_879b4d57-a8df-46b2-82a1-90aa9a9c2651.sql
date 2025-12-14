-- PHASE 2.1: Symptom Intelligence Data Model

-- 1. Enum for symptom severity levels
CREATE TYPE public.symptom_severity AS ENUM ('mild', 'moderate', 'severe', 'critical');

-- 2. Enum for red flag status
CREATE TYPE public.red_flag_status AS ENUM ('none', 'monitor', 'urgent', 'emergency');

-- 3. Symptom severity rules (deterministic configuration)
CREATE TABLE public.symptom_severity_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_keyword text NOT NULL,
  body_region text,
  base_severity symptom_severity NOT NULL DEFAULT 'mild',
  duration_hours_threshold integer DEFAULT 24,
  escalation_severity symptom_severity,
  red_flag_triggers text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial severity rules (deterministic medical logic)
INSERT INTO public.symptom_severity_rules (symptom_keyword, body_region, base_severity, duration_hours_threshold, escalation_severity, red_flag_triggers) VALUES
  ('chest pain', 'chest', 'severe', 1, 'critical', ARRAY['radiating', 'crushing', 'shortness of breath', 'sweating', 'nausea']),
  ('shortness of breath', 'chest', 'moderate', 2, 'severe', ARRAY['sudden onset', 'at rest', 'chest pain', 'blue lips']),
  ('headache', 'head', 'mild', 72, 'moderate', ARRAY['worst ever', 'sudden onset', 'stiff neck', 'fever', 'confusion']),
  ('abdominal pain', 'abdomen', 'mild', 24, 'moderate', ARRAY['severe', 'rigid abdomen', 'blood in stool', 'vomiting blood']),
  ('back pain', 'back', 'mild', 168, 'moderate', ARRAY['numbness', 'weakness', 'bladder problems', 'fever']),
  ('fever', 'general', 'mild', 72, 'moderate', ARRAY['above 39.5', 'stiff neck', 'rash', 'confusion', 'difficulty breathing']),
  ('dizziness', 'head', 'mild', 24, 'moderate', ARRAY['fainting', 'chest pain', 'slurred speech', 'weakness']),
  ('fatigue', 'general', 'mild', 336, 'moderate', ARRAY['weight loss', 'night sweats', 'unexplained']),
  ('joint pain', 'musculoskeletal', 'mild', 168, 'moderate', ARRAY['swelling', 'redness', 'hot to touch', 'fever']),
  ('numbness', 'neurological', 'moderate', 24, 'severe', ARRAY['sudden onset', 'one side', 'facial drooping', 'speech problems']);

-- 4. Symptom checks (user symptom check sessions)
CREATE TABLE public.symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_status text NOT NULL DEFAULT 'in_progress' CHECK (session_status IN ('in_progress', 'completed', 'abandoned')),
  overall_severity symptom_severity DEFAULT 'mild',
  red_flag_status red_flag_status DEFAULT 'none',
  red_flag_reasons text[] DEFAULT '{}',
  primary_complaint text,
  symptom_duration_hours integer,
  symptom_onset text,
  associated_symptoms text[] DEFAULT '{}',
  medical_history_flags text[] DEFAULT '{}',
  interpretation_ready boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom checks"
ON public.symptom_checks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own symptom checks"
ON public.symptom_checks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom checks"
ON public.symptom_checks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom checks"
ON public.symptom_checks FOR DELETE
USING (auth.uid() = user_id);

-- 5. Symptom entries (individual symptoms within a check)
CREATE TABLE public.symptom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_check_id uuid NOT NULL REFERENCES public.symptom_checks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  symptom_text text NOT NULL,
  body_region text,
  severity symptom_severity NOT NULL DEFAULT 'mild',
  severity_score integer DEFAULT 1 CHECK (severity_score BETWEEN 1 AND 10),
  duration_hours integer,
  frequency text,
  triggers text[] DEFAULT '{}',
  relieving_factors text[] DEFAULT '{}',
  associated_symptoms text[] DEFAULT '{}',
  is_primary boolean DEFAULT false,
  matched_rule_id uuid REFERENCES public.symptom_severity_rules(id),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom entries"
ON public.symptom_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own symptom entries"
ON public.symptom_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom entries"
ON public.symptom_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom entries"
ON public.symptom_entries FOR DELETE
USING (auth.uid() = user_id);

-- 6. Red flag detection log (audit trail for trigger logic)
CREATE TABLE public.symptom_red_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_check_id uuid NOT NULL REFERENCES public.symptom_checks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  flag_type text NOT NULL,
  flag_reason text NOT NULL,
  triggered_by_symptom_id uuid REFERENCES public.symptom_entries(id),
  triggered_by_rule_id uuid REFERENCES public.symptom_severity_rules(id),
  severity_level red_flag_status NOT NULL,
  recommendation text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.symptom_red_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own red flags"
ON public.symptom_red_flags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own red flags"
ON public.symptom_red_flags FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 7. Function to calculate severity from score
CREATE OR REPLACE FUNCTION public.score_to_severity(score integer)
RETURNS symptom_severity
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN score <= 3 THEN 'mild'::symptom_severity
    WHEN score <= 5 THEN 'moderate'::symptom_severity
    WHEN score <= 7 THEN 'severe'::symptom_severity
    ELSE 'critical'::symptom_severity
  END
$$;

-- 8. Function to get highest severity from array
CREATE OR REPLACE FUNCTION public.max_severity(severities symptom_severity[])
RETURNS symptom_severity
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN 'critical' = ANY(severities) THEN 'critical'::symptom_severity
    WHEN 'severe' = ANY(severities) THEN 'severe'::symptom_severity
    WHEN 'moderate' = ANY(severities) THEN 'moderate'::symptom_severity
    ELSE 'mild'::symptom_severity
  END
$$;

-- 9. Trigger to update symptom_checks when entries change
CREATE OR REPLACE FUNCTION public.update_symptom_check_severity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_sev symptom_severity;
BEGIN
  SELECT public.max_severity(array_agg(severity))
  INTO max_sev
  FROM public.symptom_entries
  WHERE symptom_check_id = COALESCE(NEW.symptom_check_id, OLD.symptom_check_id);

  UPDATE public.symptom_checks
  SET overall_severity = COALESCE(max_sev, 'mild'),
      updated_at = now()
  WHERE id = COALESCE(NEW.symptom_check_id, OLD.symptom_check_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_symptom_entry_change
AFTER INSERT OR UPDATE OR DELETE ON public.symptom_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_symptom_check_severity();

-- 10. Indexes for performance
CREATE INDEX idx_symptom_checks_user_id ON public.symptom_checks(user_id);
CREATE INDEX idx_symptom_checks_status ON public.symptom_checks(session_status);
CREATE INDEX idx_symptom_entries_check_id ON public.symptom_entries(symptom_check_id);
CREATE INDEX idx_symptom_red_flags_check_id ON public.symptom_red_flags(symptom_check_id);
CREATE INDEX idx_severity_rules_keyword ON public.symptom_severity_rules(symptom_keyword);
CREATE INDEX idx_severity_rules_active ON public.symptom_severity_rules(is_active) WHERE is_active = true;