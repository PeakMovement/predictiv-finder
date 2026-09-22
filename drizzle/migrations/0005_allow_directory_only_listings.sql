-- Directory-sourced listings (scraped from a practice's own public website,
-- not yet signed up to Predictiv) have no auth.users account, so user_id
-- must become nullable. is_claimed distinguishes "we compiled this listing"
-- from "this practitioner signed up and manages their own profile".
alter table public.professionals
  alter column user_id drop not null,
  add column if not exists is_claimed boolean not null default false;

comment on column public.professionals.is_claimed is 'false = directory listing compiled by Predictiv from public sources, not yet claimed/managed by the practitioner. true = practitioner signed up and owns this profile.';