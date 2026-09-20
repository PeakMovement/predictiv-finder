-- Reverse PR #3: restore the Predictiv organisation as the blog author.
-- Consent for a named person author was withdrawn. Do not invent credentials.

alter table public.blog_posts
  alter column author_name set default 'Predictiv';

update public.blog_posts
  set author_name = 'Predictiv'
  where author_name is null
     or btrim(author_name) = ''
     or lower(btrim(author_name)) = 'justin muller';

comment on column public.blog_posts.author_name is
  'Display name for the post author. Default is Predictiv (organisation). Do not invent a clinician.';
