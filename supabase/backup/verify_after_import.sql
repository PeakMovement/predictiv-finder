-- Run in the Cloud SQL editor after the four backup files.
-- Pass: the counts below. practitioners_view must be null.

select 'professionals' as check, count(*)::text as actual, '40' as expected
from public.professionals
union all
select 'professionals_approved', count(*)::text, '37'
from public.professionals where is_approved
union all
select 'professionals_with_user_id', count(*)::text, '0 unless those auth users were recreated first'
from public.professionals where user_id is not null
union all
select 'blog_posts_published', count(*)::text, '5'
from public.blog_posts where status = 'published' and author_name = 'Predictiv'
union all
select 'symptom_severity_rules', count(*)::text, '32'
from public.symptom_severity_rules
union all
select 'profiles', count(*)::text, '8'
from public.profiles
union all
select 'marcela_cawood', count(*)::text, '1'
from public.professionals
where slug = 'marcela-cawood-physiotherapy' and is_approved and suburb = 'Rondebosch';

select to_regclass('public.practitioners') as practitioners_view;
-- expect practitioners_view = null

select id, name, public
from storage.buckets
where id in ('avatars', 'professional-photos');
-- expect both rows, public = true
