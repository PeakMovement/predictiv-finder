-- Columns the app's calendar integration service reads/writes that existed on the
-- linked project's live table but were never captured in a repo migration.
alter table public.calendar_integrations
  add column if not exists integration_type text,
  add column if not exists sync_enabled boolean not null default true;