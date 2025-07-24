-- Create user_physician_preferences table to store user's preferred/selected physicians
CREATE TABLE public.user_physician_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  physician_name text NOT NULL,
  physician_title text NOT NULL,
  physician_location text NOT NULL,
  selection_count integer NOT NULL DEFAULT 1,
  last_selected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure unique physician per user
  UNIQUE(user_id, physician_name)
);

-- Enable Row Level Security
ALTER TABLE public.user_physician_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own physician preferences" 
ON public.user_physician_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own physician preferences" 
ON public.user_physician_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own physician preferences" 
ON public.user_physician_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own physician preferences" 
ON public.user_physician_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_physician_preferences_updated_at
BEFORE UPDATE ON public.user_physician_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create search_history table for storing user search queries
CREATE TABLE public.search_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  health_issue text NOT NULL,
  budget integer,
  location text,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for search history
CREATE POLICY "Users can view their own search history" 
ON public.search_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_physician_preferences_user_id ON public.user_physician_preferences(user_id);
CREATE INDEX idx_user_physician_preferences_physician_name ON public.user_physician_preferences(physician_name);
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at);