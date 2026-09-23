# Lovable Cloud cutover — Justin handoff

Final pre-disconnect prep for **Predictiv Finder** (https://predictiv.co.za).

Do **not** cancel or pause the linked Supabase project. Do **not** touch Peak Movement (peakmovement.co.za). That is a different product. Do **not** merge Old Predictiv.

Lovable has no in-place move from a connected supabase.com project onto Cloud. The path is Disconnect, then Enable Cloud, then rebuild. Disconnect does **not** delete `zpddlphtoeluytrejioj`. The published site keeps calling that project until you Publish a build that points at Cloud.

Official docs: [Connect / disconnect](https://docs.lovable.dev/integrations/supabase), [Cloud](https://docs.lovable.dev/features/cloud), [Secrets](https://docs.lovable.dev/features/secrets).

---

## 1. Two clicks, then the empty window

In the **Predictiv Finder** Lovable project (not Peak Movement):

1. Open **More → Cloud**. Screenshot the connected project `zpddlphtoeluytrejioj` (https://supabase.com/dashboard/project/zpddlphtoeluytrejioj).
2. Click **Disconnect**. Confirm. Code on GitHub does not change. https://predictiv.co.za keeps serving the old backend.
3. Click **Enable Cloud** (the control next to “Already have a Supabase project? Connect it here”).
4. Region: **Europe**. This is locked afterwards. Live functions today run in `us-east-2`; Europe is closer to Cape Town.
5. If Enable Cloud stays disabled while a project is connected, you are still linked. Disconnect first. If Enable Cloud is missing after disconnect, create a new Lovable project in the same workspace, import this GitHub repo, and Enable Cloud there. Do not remix. Remix keeps the source project’s backend.

**What the empty backend looks like.** Cloud has no rows, no auth users, and no edge functions until the steps below. Lovable’s preview against Cloud will show an empty directory and no blog posts. That is expected. Do **not** Publish yet. Publishing early points predictiv.co.za at the empty database and the public finder goes blank until import finishes. The old project is still there as rollback.

If Lovable rewrites `src/integrations/supabase/client.ts` with the new URL and anon key, that is success. Put the same values in the Lovable env as:

```
VITE_SUPABASE_URL=https://<NEW_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new anon jwt>
```

`src/integrations/supabase/env.ts` still falls back to `zpddlphtoeluytrejioj` when those vars are unset, so a build without the new env keeps talking to the old project. Set the env **before** Publish.

---

## 2. Schema, then import, then functions

Prompt Lovable on the main project (not a draft):

> Apply every SQL file under supabase/migrations in filename order to this Cloud database. Do not recreate a public.practitioners view. Then deploy all six edge functions using the verify_jwt flags in supabase/config.toml.

Filename order matters. `20250101000000_cloud_bootstrap_helpers.sql` has to run before the July 2025 triggers, or a blank database fails on `update_updated_at_column()`. If any migration errors, stop. Do not start the import.

Then, in **More → Cloud → SQL**, run these files from `supabase/backup/` in order:

1. `symptom_severity_rules.sql` — replaces the 32 seeded rules so the table stays at 32, not 64
2. `profiles.sql` — 8 shell profiles
3. `professionals.sql` — 40 listings (37 public). Missing auth users are stored with `user_id` null so the directory still loads
4. `blog_posts.sql` — 5 posts, author **Predictiv**
5. `verify_after_import.sql` — counts in the next section

Do **not** run `supabase/seed/20260916_rondebosch_directory_listings.sql`. Those practices are already in the professionals backup. A second run collides on slug.

### Edge functions (all six)

| Function | `verify_jwt` | Used by |
| --- | --- | --- |
| `analyze-health-concern` | false | Public `/assistant` |
| `create-practitioner` | false (function checks admin JWT or invite token) | Admin / invite only |
| `blog-sitemap` | false | `robots.txt` |
| `ai-health-assistant` | true | Gated portal |
| `sync-calendar-availability` | true | Gated calendar |
| `symptom-severity-evaluator` | true | Gated symptom intake |

`config.toml` already sets `blog-sitemap` to `verify_jwt = false`. A Cloud redeploy that ignored the file would lock Google’s sitemap behind a JWT.

### Secrets

Cloud should inject `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `LOVABLE_API_KEY`. Do not paste the old service-role key into git or into the Vite app. If `/assistant` returns `ai_not_configured`, rotate `LOVABLE_API_KEY` under **More → Cloud → Secrets**.

`PRACTITIONER_INVITE_TOKEN` is optional and write-only. Copy it from the password manager if invite signup is still used. If it was lost, mint a new 16+ character token. Leave it unset to allow only the blog admin.

### Blog admin (required)

`is_blog_admin()` is hardcoded to a **confirmed** `predictivpty@gmail.com`. That address was **not** among the 8 auth users on the old project. Create it on Cloud:

1. Cloud → Authentication → Users → Add user.
2. Email `predictivpty@gmail.com`. Turn on auto-confirm. Set a new password and store it in 1Password.
3. Site URL `https://predictiv.co.za`. Redirect URLs: `https://predictiv.co.za/**`, `https://www.predictiv.co.za/**`, `https://*.lovable.app/**`.

The other eight accounts are in `supabase/backup/auth_users.txt`. Six are mailinator test users. `justin15muller@gmail.com` was unconfirmed. `peakmvement@gmail.com` (typo) was confirmed and owned an unapproved “Justin ” listing. Passwords cannot be copied. Recreate one of these only if that login is still needed, and use the **same uuid** from `auth_users.txt` if the profile row should match. New signups get new uuids; that is fine for the public directory, because approved listings have `user_id` null.

Leave Google and GitHub login **off**. They are off on the live project. The buttons in the app do nothing until OAuth is configured on purpose.

### After import, before Publish

1. Update `supabase/config.toml` `project_id` to the new Cloud ref (follow-up commit is fine).
2. Publish from Lovable only after `verify_after_import.sql` matches.
3. Confirm `https://predictiv.co.za/robots.txt` lists the **new** `/functions/v1/blog-sitemap` host, not `zpddlphtoeluytrejioj`.

---

## 3. Pass line (then keep the old project)

`verify_after_import.sql` should show:

| Check | Expected |
| --- | --- |
| professionals | 40 |
| professionals approved | 37 |
| professionals with user_id | 0 (or 3 if those auth users were recreated first) |
| published blog posts by Predictiv | 5 |
| symptom_severity_rules | 32 |
| profiles | 8 |
| Marcela Cawood slug | 1 |
| `public.practitioners` | absent |
| buckets `avatars`, `professional-photos` | both public |

Then, on the Cloud URL before production, and on https://predictiv.co.za after Publish:

1. Approved professionals API returns 37. Unapproved names (Samuel Stout, Aladdin Jacobson, Justin) are not in that list.
2. `GET /rest/v1/practitioners` is missing.
3. Five blog slugs load. `/blog/what-does-a-biokineticist-do` is the post, author Predictiv, not the homepage shell.
4. `/practitioners/physiotherapists/rondebosch` shows Marcela Cawood in the HTML.
5. `GET /functions/v1/blog-sitemap` returns XML with no user JWT.
6. `/assistant` gets past the consent gate and returns guidance (not `ai_not_configured`).
7. `/admin/blog` signs in as `predictivpty@gmail.com`.
8. `POST /functions/v1/create-practitioner` without a token returns 403 `admin_or_invite_required`.
9. `/join` still names `predictivpty@gmail.com`.

**Rollback:** leave DNS on Lovable hosting. Leave `zpddlphtoeluytrejioj` running. To go back, unset the new `VITE_SUPABASE_*` values so `env.ts` falls back to the old project, and Publish again.

Cancel supabase.com only after this list has stayed green. That cancel is a later decision, not part of these clicks.

---

## 4. What is already in the repo

Live probe 2026-09-22 with the public anon key. Private tables returning 0 to anon were empty when the backup was taken with a role that bypasses RLS (see `supabase/backup/README.md`).

| Carry | Backup | Live anon on 2026-09-22 |
| --- | --- | --- |
| `professionals` | 40 (37 approved, 0 claimed) | 37 approved. Mix: Biokineticist 12, Physiotherapist 9, GP 9, Chiropractor 7. Rondebosch 14, Claremont 8, Newlands 6, Pinelands 5, Wynberg 2, Plumstead 1, Kenilworth 1. |
| `blog_posts` | 5 published | Same 5 slugs, author Predictiv. E-E-A-T columns are **not** on the live table yet (`42703`). Migration `20260920000000` adds them as NULL on Cloud. |
| `symptom_severity_rules` | 32 | Hidden from anon. Migrations also seed these 32; the backup file replaces them. |
| `profiles` | 8 | Hidden from anon. All `full_name` null. |
| Auth users | 8 in `auth_users.txt` | Email/password on, autoconfirm off, Google/GitHub off. |
| Other public tables | empty | No rows to import. |
| Storage | empty | Recreated by `20260921120000_cloud_cutover_safety.sql`. |
| Edge functions | source in `supabase/functions/` | All 6 still respond on the linked project. |

Published slugs:

- `how-to-choose-a-physiotherapist-in-rondebosch`
- `physio-or-chiro-for-back-pain`
- `what-does-a-biokineticist-do`
- `knee-pain-in-cape-town-who-to-see`
- `seeing-a-chiropractor-in-claremont-what-to-expect`

The `practitioners` view is **not** in the app. On 2026-09-22 it still leaked the 3 unapproved rows to anon. `20260921120000_cloud_cutover_safety.sql` drops it. Do not restore it from a dump.

`src/integrations/supabase/types.ts` is stale (it still types `practitioners` and omits E-E-A-T columns). Regenerate after Cloud is up. Do not block cutover on that.

---

## 5. Gaps Justin is accepting

| Gap | Why it is acceptable |
| --- | --- |
| Password hashes | Not exportable. Old sessions die with the new JWT secret anyway. Public listings do not need those logins. |
| `predictivpty@gmail.com` missing | Create it in section 2. The old project never had this admin. |
| 3 unapproved rows lose `user_id` unless those auth users are recreated first | They are test data (two mailinator signups and the `peakmvement@gmail.com` “Justin ” row). They stay `is_approved = false`. |
| 8 profiles have no name or avatar | The file is the whole row. RLS hides them until a matching auth user exists. |
| Empty portal tables | Nothing to import. |
| `bookings` column drift | Live has `practitioner_name` / `service_type` and no `practitioner_id`. Migrations create `practitioner_id`. The table was empty and the public site does not take bookings. Gated portal only. |
| `user_preferences.preferred_professions` | In `types.ts`, not on the live table. Table was empty. |
| Calendar shape | Fixed for Cloud by `20260922140000_align_calendar_integrations_for_cloud.sql` so `sync-calendar-availability` can read `sync_enabled` and `api_credentials`. Table was empty. |
| Region lock | Pick Europe at Enable Cloud. It cannot be changed later. |
| Custom SMTP | Cloud sends Auth mail itself. Confirm one test email after the admin user is created. |

No cron jobs were in the repo or detectable on the linked project. Do not add one during cutover.

---

## 6. What changed in this prep

- Migrations can apply on an **empty** Cloud database: bootstrap `update_updated_at_column()` before the earliest triggers, and skip policies whose tables are created later.
- `handle_new_user` ignores a profile row that was imported first.
- Calendar columns the sync function reads are added when Cloud creates the older table shape.
- `professionals.sql` no longer fails the entire directory import when three old `user_id`s are missing.
- `symptom_severity_rules.sql` replaces seeded rules instead of duplicating them.
- This handoff matches the backup and the 2026-09-22 live probe, including the missing blog-admin user.

Nothing here deletes the linked project, cancels billing, or edits Peak Movement.
