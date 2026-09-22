-- Reverse PR #3: restore the Predictiv organisation as the blog author.
-- Consent for a named person author was withdrawn. Do not invent credentials.

alter table public.blog_posts
  alter column author_name set default 'Predictiv';

comment on column public.blog_posts.author_name is
  'Display name for the post author. Default is Predictiv (organisation). Do not invent a clinician.';

-- Data fix applied via query tool at cutover: rows with null/blank/justin muller author_name set to 'Predictiv'.