-- The calendar dialog inserts integrations by integration_type without a provider
-- value; the linked project's live table accepted these rows. Give provider a
-- default so inserts succeed (the app displays integration_type, not provider).
alter table public.calendar_integrations
  alter column provider set default 'calendar_integration';