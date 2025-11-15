-- Create professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  specialities TEXT[] NOT NULL DEFAULT '{}',
  price_min INTEGER,
  price_max INTEGER,
  location TEXT,
  google_reviews_url TEXT,
  calendly_url TEXT NOT NULL,
  photo_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own profile"
ON public.professionals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update their own profile"
ON public.professionals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can insert their own profile"
ON public.professionals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved professionals"
ON public.professionals
FOR SELECT
USING (is_approved = true);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_professionals_updated_at
BEFORE UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();