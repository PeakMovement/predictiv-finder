alter table public.calendar_integrations
  add column if not exists api_credentials jsonb;