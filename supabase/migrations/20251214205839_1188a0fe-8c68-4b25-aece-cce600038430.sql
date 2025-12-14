-- Enable RLS (safe even if already enabled)
ALTER TABLE public.symptom_severity_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can read severity rules"
ON public.symptom_severity_rules;

-- Create the read policy for authenticated users
CREATE POLICY "Authenticated users can read severity rules"
ON public.symptom_severity_rules
FOR SELECT
TO authenticated
USING (is_active = true);