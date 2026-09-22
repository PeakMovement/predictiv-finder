-- P0 from the Predictiv Finder audit:
-- 1. Practitioners must not self-set is_approved / is_featured.
-- 2. Public availability reads must not include calendar event titles.

-- ---------------------------------------------------------------------------
-- Moderation columns: only service_role, JWT-less backend jobs, or
-- is_blog_admin() may change is_approved / is_featured.
-- ---------------------------------------------------------------------------
create or replace function public.protect_professional_moderation_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
begin
  -- Migrations, SQL editor, and the service role have no end-user JWT or
  -- are explicitly service_role. Let those through so seeds and dashboard
  -- edits still work.
  jwt_role := coalesce(auth.role(), '');
  if auth.jwt() is null or jwt_role = 'service_role' then
    return new;
  end if;

  if public.is_blog_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_approved := false;
    new.is_featured := false;
  elsif tg_op = 'UPDATE' then
    new.is_approved := old.is_approved;
    new.is_featured := old.is_featured;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_professional_moderation on public.professionals;
create trigger protect_professional_moderation
before insert or update on public.professionals
for each row
execute function public.protect_professional_moderation_columns();

-- ---------------------------------------------------------------------------
-- Availability: owners keep full rows (including event_title). Everyone else
-- reads a busy/free view with no titles or external event ids.
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can view availability slots" on public.availability_slots;

drop policy if exists "Practitioners can view own slots" on public.availability_slots;
create policy "Practitioners can view own slots"
on public.availability_slots
for select
using (auth.uid() = practitioner_id);

create or replace view public.availability_busy_blocks
as
select
  id,
  practitioner_id,
  start_time,
  end_time,
  is_available
from public.availability_slots;

-- security_invoker = false: run as the view owner so RLS on the base table
-- does not hide busy/free blocks from anon. The view omits event titles.
alter view public.availability_busy_blocks set (security_invoker = false);

comment on view public.availability_busy_blocks is
  'Public busy/free calendar blocks. Does not expose event_title or external_event_id.';

revoke all on public.availability_busy_blocks from public;
grant select on public.availability_busy_blocks to anon, authenticated;