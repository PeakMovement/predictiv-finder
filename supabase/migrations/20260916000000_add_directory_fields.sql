-- Adds fields required for the public "Find a Practitioner" / "Name Your Problem"
-- directory: geolocation ranking, cached review data, monetized featured flag,
-- and a clean slug for SEO-friendly profile URLs.
-- Additive only (all nullable / defaulted) -- safe to run against the live table.
-- NOT applied automatically. Apply with: supabase db push (or via Supabase MCP
-- apply_migration) once Justin has reviewed it.

alter table public.professionals
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists rating numeric,
  add column if not exists review_count integer default 0,
  add column if not exists is_featured boolean not null default false,
  add column if not exists slug text,
  add column if not exists suburb text;

create unique index if not exists professionals_slug_key on public.professionals (slug) where slug is not null;
create index if not exists professionals_suburb_idx on public.professionals (suburb);
create index if not exists professionals_lat_lng_idx on public.professionals (latitude, longitude);

comment on column public.professionals.latitude is 'Cached geocoded latitude for distance-based ranking on the public directory.';
comment on column public.professionals.longitude is 'Cached geocoded longitude for distance-based ranking on the public directory.';
comment on column public.professionals.rating is 'Cached Google Places rating, refreshed on a schedule. Do not hand-edit.';
comment on column public.professionals.review_count is 'Cached Google Places review count, refreshed on a schedule.';
comment on column public.professionals.is_featured is 'Manually controlled paid placement flag for monetization.';
comment on column public.professionals.slug is 'URL slug for /practitioner/[slug] profile pages.';
comment on column public.professionals.suburb is 'Normalized suburb name (e.g. "Rondebosch") used for /practitioners/[suburb]/[profession] pages, distinct from the free-text location field.';
