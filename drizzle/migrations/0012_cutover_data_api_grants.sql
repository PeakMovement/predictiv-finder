-- Data API grants for the Lovable Cloud cutover.
-- Supabase's Data API does NOT grant default privileges on schema public to
-- anon/authenticated/service_role. RLS is the actual gate; these grants
-- replicate the linked project's default privileges so the app can reach its
-- tables exactly as before.

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Indexes from the original 20250724 migration kept for parity
CREATE INDEX IF NOT EXISTS idx_user_physician_preferences_physician_name ON public.user_physician_preferences(physician_name);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at);