# Backup of the external Supabase project (ref zpddlphtoeluytrejioj)

Captured 2026-09-21, before moving the backend to Lovable Cloud.

| File | Rows |
| --- | --- |
| `professionals.sql` | 40 directory listings (approved/claimed flags preserved) |
| `blog_posts.sql` | 5 posts with full content and slugs |
| `symptom_severity_rules.sql` | 32 rules |
| `profiles.sql` | 8 profiles |
| `auth_users.txt` | 8 sign-in accounts (reference only) |

Restore order after the schema migrations are applied:
`symptom_severity_rules.sql` -> `profiles.sql` -> `professionals.sql` -> `blog_posts.sql`

All other public tables were empty at capture time (bookings, health_plans,
popia_consents, search_history, ai_interactions, calendar_integrations,
availability_slots, symptom_checks, symptom_entries, symptom_red_flags,
user_preferences, user_physician_preferences).

Passwords cannot be exported. Accounts must be recreated and each user sent a
password reset. Note: `predictivpty@gmail.com` (the blog admin address used by
`is_blog_admin()`) did not exist as a sign-in account in the old project.
