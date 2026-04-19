/*
  # Extend Professionals Table for Practitioner Portal

  ## Summary
  Adds comprehensive fields to the professionals table to support the new
  private practitioner registration portal. These capture full credential
  information, practice details, and professional background for proper vetting.

  ## New Columns on `professionals`
  - `registration_number` - Professional license/registration number (HPCSA, AHPCSA, etc.)
  - `governing_body` - Regulatory body the practitioner is registered with
  - `years_experience` - Years of professional experience
  - `qualification` - Highest qualification obtained
  - `institution` - Institution where qualification was obtained
  - `practice_name` - Name of the practice or clinic
  - `contact_number` - Professional contact phone number
  - `bio` - Short personal statement / professional bio
  - `consultation_type` - Offering type: in-person, online, or both
  - `languages` - Languages spoken (array)
  - `expertise_areas` - Additional expertise areas beyond specialities (array)

  ## Notes
  1. All new columns are nullable - existing records are not affected
  2. Uses IF NOT EXISTS pattern - fully idempotent
  3. No data is dropped or modified
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN registration_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'governing_body'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN governing_body text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'years_experience'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN years_experience integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'qualification'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN qualification text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'institution'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN institution text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'practice_name'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN practice_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'contact_number'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN contact_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'consultation_type'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN consultation_type text DEFAULT 'in-person';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'languages'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN languages text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'expertise_areas'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN expertise_areas text[] DEFAULT '{}';
  END IF;
END $$;
