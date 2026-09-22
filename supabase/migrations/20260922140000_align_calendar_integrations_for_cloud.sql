-- sync-calendar-availability reads integration_type, sync_enabled,
-- api_credentials, and last_sync_at. Those columns exist on the linked
-- project (probed 2026-09-22). 20260419183806 uses CREATE TABLE IF NOT EXISTS,
-- so it did not reshape the live table, and on an empty Cloud database it
-- creates an older shape (provider NOT NULL, access_token, ...) instead.
-- The table was empty on the linked project. This migration makes a fresh
-- Cloud table usable by the function without failing on the live project,
-- where provider does not exist and the live columns already do.

ALTER TABLE public.calendar_integrations
  ADD COLUMN IF NOT EXISTS api_credentials jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integration_type text,
  ADD COLUMN IF NOT EXISTS sync_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_sync_at timestamptz;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'calendar_integrations'
      AND column_name = 'provider'
  ) THEN
    ALTER TABLE public.calendar_integrations
      ALTER COLUMN provider DROP NOT NULL;
  END IF;
END $$;
