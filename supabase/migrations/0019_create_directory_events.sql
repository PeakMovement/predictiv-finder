CREATE TABLE public.directory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('search','problem_described','results_shown','profile_view','outbound_click')),
  query text,
  profession text,
  suburb text,
  result_count integer,
  professional_id uuid REFERENCES public.professionals(id) ON DELETE SET NULL,
  link_type text CHECK (link_type IN ('website','phone','booking')),
  page_path text,
  referrer text,
  device text
);

CREATE INDEX directory_events_created_at_idx ON public.directory_events (created_at);
CREATE INDEX directory_events_event_type_idx ON public.directory_events (event_type);
CREATE INDEX directory_events_professional_id_idx ON public.directory_events (professional_id);

GRANT INSERT ON public.directory_events TO anon, authenticated;
GRANT SELECT ON public.directory_events TO authenticated;
GRANT ALL ON public.directory_events TO service_role;

ALTER TABLE public.directory_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert directory events"
ON public.directory_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Only blog admins can read directory events"
ON public.directory_events
FOR SELECT
TO authenticated
USING (public.is_blog_admin());