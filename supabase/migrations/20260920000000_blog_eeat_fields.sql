-- Optional E-E-A-T fields for health blog posts.
-- Leave them NULL until Justin names a real author/reviewer with consent.
-- Do not invent clinician names or credentials.

alter table public.blog_posts
  add column if not exists author_credential text,
  add column if not exists reviewer_name text,
  add column if not exists reviewer_credential text;

comment on column public.blog_posts.author_credential is
  'Optional credential for a named human author (e.g. HPCSA-registered physiotherapist). Leave null when the author is Predictiv.';
comment on column public.blog_posts.reviewer_name is
  'Optional named clinician who reviewed the post. Fill only with a real person who has consented. Never invent a name.';
comment on column public.blog_posts.reviewer_credential is
  'Optional credential for reviewer_name. Leave null unless a real reviewer is named.';
