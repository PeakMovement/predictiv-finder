# Backup of the external Supabase project (ref zpddlphtoeluytrejioj)

Captured 2026-09-21. Re-checked against the live anon API on 2026-09-22:
37 approved professionals and the same 5 published blog slugs. The linked
project is still the production backend until Justin Publishes a Cloud build.

| File | Rows | Cloud note |
| --- | --- | --- |
| `symptom_severity_rules.sql` | 32 rules | Deletes the 32 rows the migrations already seed, then inserts this snapshot. Do not skip the delete or the table becomes 64. |
| `profiles.sql` | 8 profiles | No names or avatars. `predictivpty@gmail.com` is not one of them. |
| `professionals.sql` | 40 listings | 37 approved with `user_id` null, plus 3 unapproved test rows. Missing auth users are stored as null so the public 37 still load. |
| `blog_posts.sql` | 5 posts | All published, author Predictiv. E-E-A-T columns stay null. |
| `auth_users.txt` | 8 accounts | Reference only. Passwords cannot be exported. |
| `verify_after_import.sql` | — | Counts Justin should see after import. |

## Restore order

Apply **every** file in `supabase/migrations` in filename order first. Then, in the Cloud SQL editor:

1. `symptom_severity_rules.sql`
2. `profiles.sql`
3. `professionals.sql`
4. `blog_posts.sql`
5. `verify_after_import.sql`

Do **not** run `supabase/seed/20260916_rondebosch_directory_listings.sql`. Those practices are already in `professionals.sql`.

## Tables that were empty

No import file, because there was nothing to carry (probed 2026-09-21, still empty to anon on 2026-09-22):

`bookings`, `health_plans`, `popia_consents`, `search_history`, `ai_interactions`, `calendar_integrations`, `availability_slots`, `symptom_checks`, `symptom_entries`, `symptom_red_flags`, `user_preferences`, `user_physician_preferences`.

Storage buckets were empty. Migration `20260921120000_cloud_cutover_safety.sql` recreates `avatars` and `professional-photos`.

## Auth

`predictivpty@gmail.com` was **not** a sign-in account. Blog admin has to be created on Cloud with a confirmed email. The eight exported accounts are mostly mailinator test users, plus `justin15muller@gmail.com` (unconfirmed) and `peakmvement@gmail.com` (confirmed typo). Recreate those only if someone still needs the login. See `docs/MIGRATION_TO_LOVABLE_CLOUD.md`.
