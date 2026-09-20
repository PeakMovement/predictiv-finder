-- Consented display name for health blog posts: Justin Muller.
-- Name only. Do not invent credentials, titles, photos, bios, or reviewers.

alter table public.blog_posts
  alter column author_name set default 'Justin Muller';

update public.blog_posts
  set author_name = 'Justin Muller'
  where author_name is null
     or btrim(author_name) = ''
     or lower(btrim(author_name)) in ('predictiv', 'predictiv pty', 'predictiv pty ltd');

comment on column public.blog_posts.author_name is
  'Display name for the post author. Default is Justin Muller (consented). Do not invent credentials in author_credential.';
