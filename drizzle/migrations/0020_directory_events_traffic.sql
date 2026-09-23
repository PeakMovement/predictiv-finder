-- Traffic analytics for the public directory.
--
-- Adds page_view events, visit level ids and source attribution to
-- directory_events, then exposes read only reporting views so the admin page
-- never has to pull raw rows and aggregate them in the browser.
--
-- Everything stored here stays anonymous: two random ids, no IP, no personal
-- data. Reads remain restricted to public.is_blog_admin().

-- 1. page_view becomes a valid event type.
ALTER TABLE public.directory_events
  DROP CONSTRAINT IF EXISTS directory_events_event_type_check;

ALTER TABLE public.directory_events
  ADD CONSTRAINT directory_events_event_type_check
  CHECK (event_type IN (
    'page_view',
    'search',
    'problem_described',
    'results_shown',
    'profile_view',
    'outbound_click'
  ));

-- 2. Visit level id and source attribution.
ALTER TABLE public.directory_events
  ADD COLUMN IF NOT EXISTS visit_id text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS referrer_host text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

CREATE INDEX IF NOT EXISTS directory_events_visit_id_idx
  ON public.directory_events (visit_id);
CREATE INDEX IF NOT EXISTS directory_events_page_path_idx
  ON public.directory_events (page_path);
-- created_at::date is not IMMUTABLE (depends on TimeZone), so the conversion
-- is pinned to UTC to make the index expression legal.
CREATE INDEX IF NOT EXISTS directory_events_day_idx
  ON public.directory_events (((created_at AT TIME ZONE 'UTC')::date));

-- 3. Reporting views (security_invoker keeps the caller's RLS in force).

CREATE OR REPLACE VIEW public.analytics_daily_traffic
WITH (security_invoker = true) AS
SELECT
  created_at::date                                              AS day,
  count(*) FILTER (WHERE event_type = 'page_view')              AS page_views,
  count(DISTINCT visit_id) FILTER (WHERE event_type = 'page_view')   AS visits,
  count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') AS visitors,
  count(*) FILTER (WHERE event_type = 'outbound_click')         AS outbound_clicks,
  count(*) FILTER (WHERE event_type IN ('search', 'problem_described')) AS searches
FROM public.directory_events
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW public.analytics_top_pages
WITH (security_invoker = true) AS
SELECT
  page_path,
  count(*)                    AS page_views,
  count(DISTINCT visit_id)    AS visits,
  max(created_at)             AS last_seen
FROM public.directory_events
WHERE event_type = 'page_view' AND page_path IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;

CREATE OR REPLACE VIEW public.analytics_sources
WITH (security_invoker = true) AS
SELECT
  coalesce(source, 'unknown')  AS source,
  referrer_host,
  utm_source,
  utm_campaign,
  count(DISTINCT visit_id)     AS visits,
  min(created_at)              AS first_seen,
  max(created_at)              AS last_seen
FROM public.directory_events
GROUP BY 1, 2, 3, 4
ORDER BY 5 DESC;

CREATE OR REPLACE VIEW public.analytics_top_searches
WITH (security_invoker = true) AS
SELECT
  event_type,
  coalesce(
    nullif(btrim(query), ''),
    nullif(concat_ws(' in ', profession, suburb), '')
  )                           AS term,
  count(*)                    AS searches,
  max(created_at)             AS last_seen
FROM public.directory_events
WHERE event_type IN ('search', 'problem_described')
GROUP BY 1, 2
HAVING coalesce(nullif(btrim(query), ''), nullif(concat_ws(' in ', profession, suburb), '')) IS NOT NULL
ORDER BY 3 DESC;

CREATE OR REPLACE VIEW public.analytics_zero_results
WITH (security_invoker = true) AS
SELECT
  coalesce(profession, 'any')  AS profession,
  coalesce(suburb, 'any')      AS suburb,
  count(*)                     AS times,
  max(created_at)              AS last_seen
FROM public.directory_events
WHERE event_type = 'results_shown' AND coalesce(result_count, 0) = 0
GROUP BY 1, 2
ORDER BY 3 DESC;

CREATE OR REPLACE VIEW public.analytics_practitioner_clicks
WITH (security_invoker = true) AS
SELECT
  p.id                                                            AS professional_id,
  coalesce(p.practice_name, p.name)                               AS practice,
  p.profession,
  p.suburb,
  count(*)                                                        AS clicks,
  count(*) FILTER (WHERE e.link_type = 'website')                 AS website_clicks,
  count(*) FILTER (WHERE e.link_type = 'phone')                   AS phone_clicks,
  count(*) FILTER (WHERE e.link_type = 'booking')                 AS booking_clicks,
  count(*) FILTER (WHERE e.created_at >= now() - interval '30 days') AS clicks_30d,
  count(DISTINCT e.visit_id)                                      AS distinct_visits,
  max(e.created_at)                                               AS last_click
FROM public.directory_events e
JOIN public.professionals p ON p.id = e.professional_id
WHERE e.event_type = 'outbound_click'
GROUP BY 1, 2, 3, 4
ORDER BY 5 DESC;

GRANT SELECT ON
  public.analytics_daily_traffic,
  public.analytics_top_pages,
  public.analytics_sources,
  public.analytics_top_searches,
  public.analytics_zero_results,
  public.analytics_practitioner_clicks
TO authenticated;