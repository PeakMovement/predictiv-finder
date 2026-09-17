-- Blog posts for predictiv.co.za, written in the /admin/blog editor.
-- Public can read published posts; only the Predictiv admin account can write.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  meta_title text,
  meta_description text,
  target_keyword text,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  author_name text default 'Predictiv',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);

create or replace function public.is_blog_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in ('predictivpty@gmail.com')
      and u.email_confirmed_at is not null
  );
$$;

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
create policy "Anyone can read published blog posts"
  on public.blog_posts for select
  using (status = 'published');

drop policy if exists "Blog admin can read all posts" on public.blog_posts;
create policy "Blog admin can read all posts"
  on public.blog_posts for select to authenticated
  using (public.is_blog_admin());

drop policy if exists "Blog admin can create posts" on public.blog_posts;
create policy "Blog admin can create posts"
  on public.blog_posts for insert to authenticated
  with check (public.is_blog_admin());

drop policy if exists "Blog admin can edit posts" on public.blog_posts;
create policy "Blog admin can edit posts"
  on public.blog_posts for update to authenticated
  using (public.is_blog_admin())
  with check (public.is_blog_admin());

drop policy if exists "Blog admin can delete posts" on public.blog_posts;
create policy "Blog admin can delete posts"
  on public.blog_posts for delete to authenticated
  using (public.is_blog_admin());
