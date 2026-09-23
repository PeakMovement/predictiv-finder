-- Two more signals, plus a retention rule.
--
-- not_found: someone asked for a page that does not exist. That is demand for
--   a suburb or profession page Predictiv has not built yet, and it is the
--   clearest possible input to what to build next.
-- engaged: they were still on the page after fifteen seconds, or scrolled half
--   way. Page views alone cannot separate a reader from a bounce.

ALTER TABLE public.directory_events
  DROP CONSTRAINT IF EXISTS directory_events_event_type_check;

ALTER TABLE public.directory_events
  ADD CONSTRAINT directory_events_event_type_check
  CHECK (event_type IN (
    'page_view',
    'not_found',
    'engaged',
    'search',
    'problem_described',
    'results_shown',
    'profile_view',
    'outbound_click'
  ));

-- Pages people asked for and did not get.
CREATE OR REPLACE VIEW public.analytics_missing_pages
WITH (security_invoker = true) AS
SELECT
  page_path,
  count(*)                  AS misses,
  count(DISTINCT visit_id)  AS visits,
  max(created_at)           AS last_seen
FROM public.directory_events
WHERE event_type = 'not_found' AND page_path IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;

-- Reading versus bouncing, per page.
CREATE OR REPLACE VIEW public.analytics_engagement
WITH (security_invoker = true) AS
SELECT
  v.page_path,
  count(*)                                        AS views,
  coalesce(e.engaged, 0)                          AS engaged,
  round(100.0 * coalesce(e.engaged, 0) / nullif(count(*), 0), 1) AS engaged_pct
FROM public.directory_events v
LEFT JOIN (
  SELECT page_path, count(*) AS engaged
  FROM public.directory_events
  WHERE event_type = 'engaged'
  GROUP BY 1
) e ON e.page_path = v.page_path
WHERE v.event_type = 'page_view' AND v.page_path IS NOT NULL
GROUP BY v.page_path, e.engaged
ORDER BY 2 DESC;

GRANT SELECT ON public.analytics_missing_pages, public.analytics_engagement TO authenticated;

-- Retention. The table only ever grows, and nothing here is worth keeping for
-- longer than a year. Call this from a scheduled job, or run it by hand.
CREATE OR REPLACE FUNCTION public.prune_directory_events(keep_days integer DEFAULT 400)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.directory_events
  WHERE created_at < now() - (keep_days || ' days')::interval;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_directory_events(integer) FROM public, anon, authenticated;