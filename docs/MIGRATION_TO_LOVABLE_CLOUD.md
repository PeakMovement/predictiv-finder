# Migrate Predictiv Finder from linked supabase.com onto Lovable Cloud

**This run (prep only):** inventory, export checklist, in-repo cutover safety.
**Do not** delete the linked Supabase project. **Do not** cancel supabase.com billing.
**Do not** touch the Peak Movement marketing site (peakmovement.co.za). That is a different product.

Canonical app: Vite + React at the repo root, published to https://predictiv.co.za.
`web/` is a frozen Next.js experiment and is **not** production.

Official Lovable docs (as of 2026-09): there is **no one-click migration** from a connected supabase.com project to the built-in backend (Cloud), or the other way. You disconnect, enable Cloud, recreate schema, move data, redeploy functions, then prove the new backend before anyone cancels supabase.com.

- Connect / disconnect: https://docs.lovable.dev/integrations/supabase
- Cloud (Enable, region lock, FAQ): https://docs.lovable.dev/features/cloud
- Secrets: https://docs.lovable.dev/features/secrets

---

## 0. What is live today

The Lovable project is connected to **your own** supabase.com project, not Lovable Cloud.

| Item | Value |
| --- | --- |
| Project ref | `zpddlphtoeluytrejioj` |
| API URL | `https://zpddlphtoeluytrejioj.supabase.co` |
| Edge region observed | `us-east-2` |
| Dashboard | https://supabase.com/dashboard/project/zpddlphtoeluytrejioj |

The 2026-09-16 note in `.lovable/plan/full-move-onto-lovable-cloud-2026-09-16.md` is **wrong** on this point: that ref is a linked supabase.com project, which is why Justin still has a supabase.com bill. Hosting on Lovable ≠ Cloud backend.

`src/integrations/supabase/client.ts` used to hardcode that URL and the public anon JWT. It now reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` and falls back to the linked project so production keeps working until Cloud is enabled.

---

## 1. Exact inventory (probed 2026-09-21 with the public anon key + repo)

Counts below that say “anon-visible” are what RLS allows without a user JWT. Private tables returning 0 does **not** mean they are empty.

### 1.1 Tables (`public`)

| Table | RLS | Anon-visible rows (2026-09-21) | Who can read/write |
| --- | --- | --- | --- |
| `professionals` | on | **37** (all `is_approved=true`, all `is_claimed=false`, all `is_featured=false`, all have slugs) | Anyone can SELECT approved. Owner can SELECT/UPDATE/INSERT own row (`auth.uid() = user_id`). `is_approved` / `is_featured` are forced off for non-admin by trigger `protect_professional_moderation`. |
| `blog_posts` | on | **5 published** (drafts hidden from anon) | Anon: published only. `is_blog_admin()` (`predictivpty@gmail.com`, confirmed) can CRUD all. |
| `profiles` | on | 0 | Own row only. Created by trigger `on_auth_user_created` → `handle_new_user`. |
| `health_plans` | on | 0 | Own rows. |
| `bookings` | on | 0 | Own rows. |
| `calendar_integrations` | on | 0 | Practitioner own rows. Contains `api_credentials` JSON — treat as secret when exporting. |
| `availability_slots` | on | 0 | Owner SELECT/INSERT/UPDATE/DELETE own. Public must use the view below, not this table. |
| `user_preferences` | on | 0 | Own rows. |
| `search_history` | on | 0 | Own rows. |
| `user_physician_preferences` | on | 0 | Own rows. |
| `ai_interactions` | on | 0 | Own rows. |
| `popia_consents` | on | 0 | Authenticated own rows. Launch-mode consent is primarily `localStorage`; this table is the signed-in audit mirror. |
| `symptom_severity_rules` | on | 0 (anon denied) | Authenticated SELECT where `is_active = true`. Seed/rules must be exported with service role. |
| `symptom_checks` | on | 0 | Own rows. |
| `symptom_entries` | on | 0 | Own rows. |
| `symptom_red_flags` | on | 0 | Own rows. |

Directory mix of the 37 approved listings:

- Biokineticist 12, Physiotherapist 9, General Practitioner 9, Chiropractor 7
- Rondebosch 14, Claremont 8, Newlands 6, Pinelands 5, Wynberg 2, Plumstead 1, Kenilworth 1

Published blog slugs:

- `how-to-choose-a-physiotherapist-in-rondebosch`
- `physio-or-chiro-for-back-pain`
- `what-does-a-biokineticist-do`
- `knee-pain-in-cape-town-who-to-see`
- `seeing-a-chiropractor-in-claremont-what-to-expect`

### 1.2 Views

| View | In repo migrations? | Anon-visible (2026-09-21) | Notes |
| --- | --- | --- | --- |
| `availability_busy_blocks` | yes (`20260920180000`) | 0 | Busy/free only (no `event_title`). `security_invoker = false`. Grant SELECT to `anon, authenticated`. |
| `practitioners` | **no** | **40** (37 approved + **3 unapproved**, e.g. Samuel Stout) | Leftover. App code never queries it. Migration `20260921120000_cloud_cutover_safety.sql` **drops** it so Cloud does not copy the leak. |

Generated `src/integrations/supabase/types.ts` is stale: it still types `practitioners` and omits `blog_posts`, `availability_busy_blocks`, and `is_blog_admin`. Regenerate after Cloud is up (`npx supabase gen types typescript --project-id <cloud-ref> > src/integrations/supabase/types.ts`).

**Repo migrations not yet on the linked project** (prerender 2026-09-21): `blog_posts.author_credential`, `reviewer_name`, `reviewer_credential` (`20260920000000_blog_eeat_fields.sql`) — PostgREST returned `42703`. Apply that file on Cloud (columns stay NULL until a real consented author/reviewer exists). Do not assume a dump of live already has them.

Confirm these on the linked SQL editor during export: `20260920130000` (author revert) and `20260920180000` (moderation trigger + `availability_busy_blocks`). The busy/free view **is** queryable live; the E-E-A-T columns are not.

### 1.3 Enums, RPCs, triggers

**Enums:** `symptom_severity` (`mild|moderate|severe|critical`), `red_flag_status` (`none|monitor|urgent|emergency`).

**RPCs (live):** `is_blog_admin` (anon → `false`), `is_owner`, `score_to_severity`, `max_severity`.

**Also in migrations:** `update_updated_at_column`, `handle_new_user`, `update_symptom_check_severity`, `set_blog_posts_updated_at`, `protect_professional_moderation_columns`.

**Triggers:** `on_auth_user_created` on `auth.users`; updated_at triggers; `on_symptom_entry_change`; `blog_posts_set_updated_at`; `protect_professional_moderation` on `professionals`.

### 1.4 Storage buckets

Code expects:

- `avatars` — `ProfileService.uploadAvatar` (path `avatars/<userId>-<rand>.<ext>`)
- `professional-photos` — `ProfessionalService.uploadPhoto` (path `professional-photos/<userId>-<rand>.<ext>`)

Anon `GET /storage/v1/bucket` returned `[]`. Object-list on arbitrary names also returned `[]` with HTTP 200, so **existence cannot be confirmed with the anon key**. Assume empty or unused (public launch mode hides the portal). Recreate both buckets on Cloud via `20260921120000_cloud_cutover_safety.sql`.

### 1.5 Edge functions (all 6 are deployed on the linked project)

Confirmed live 2026-09-21 (`OPTIONS`/`GET` against `/functions/v1/<name>`).

| Function | `config.toml` `verify_jwt` | Secrets it reads | Used by |
| --- | --- | --- | --- |
| `analyze-health-concern` | false | `LOVABLE_API_KEY` | Public `/assistant` (`src/pages/AIHealthAssistant.tsx`) |
| `create-practitioner` | false (self-enforces admin JWT or invite) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, optional `PRACTITIONER_INVITE_TOKEN` | Admin/invite only. Public signup must use `supabase.auth.signUp`. |
| `blog-sitemap` | **false (now in config; was missing)** | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | `robots.txt` + prerendered `llms.txt` |
| `ai-health-assistant` | true | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Gated `useAIAssistant` (not public launch) |
| `sync-calendar-availability` | true | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Gated calendar portal |
| `symptom-severity-evaluator` | true | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Gated symptom intake |

Shared CORS allow-list (`supabase/functions/_shared/cors.ts`): `https://predictiv.co.za`, `https://www.predictiv.co.za`, localhost, `*.lovable.app`, `*.lovable.dev`.

No other functions (`process-payment`, `send-email`, Stripe, Google Places refresh) exist on the project.

### 1.6 Secrets

| Name | Where it lives today | Transfers? |
| --- | --- | --- |
| `SUPABASE_URL` | Auto on linked project / Cloud | **New value** on Cloud |
| `SUPABASE_ANON_KEY` | Auto | **New JWT** on Cloud |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto (Supabase dashboard → Settings → API) | **New key.** Never copy the old one into git. Cloud populates it; you cannot read it back from Lovable Secrets UI. |
| `LOVABLE_API_KEY` | Required by `analyze-health-concern`. Reserved prefix on Cloud | Cloud should inject this. If the assistant returns `ai_not_configured`, rotate in **More → Cloud → Secrets**. |
| `PRACTITIONER_INVITE_TOKEN` | Optional; not in git. `supabase/.env.example` | **Write-only.** If it was set on supabase.com Edge Function secrets, copy the value from your password manager (not from the dashboard — values are not shown again) onto Cloud Secrets. If you lost it, generate a new 16+ char token. |

Lovable Secrets are write-only. External-Supabase secrets are in the **Supabase** dashboard, not the Lovable Secrets UI.

### 1.7 Auth users / providers (live `/auth/v1/settings`)

| Setting | Live value |
| --- | --- |
| Email + password | **enabled** |
| `disable_signup` | false |
| `mailer_autoconfirm` | **false** (users must confirm email, except `create-practitioner` which sets `email_confirm: true`) |
| Google | **false** |
| GitHub | **false** |
| Phone, SAML, passkeys, anonymous | false |
| User count | **unknown without service role / dashboard** |

`src/context/AuthContext.tsx` still has Google/GitHub buttons. Those providers are **not** enabled on the live project. Do not enable them on Cloud unless Justin explicitly wants OAuth (new client IDs + Cloud redirect URLs).

**Must recreate on Cloud:** `predictivpty@gmail.com` with a confirmed email — `is_blog_admin()` is hardcoded to that address. Without it, `/admin/blog` and `create-practitioner` admin path fail.

### 1.8 Cron / Jobs

**None in repo migrations. None detectable.** A comment on `professionals.rating` says “refreshed on a schedule”; there is no `pg_cron` job and no Google Places function. After Cloud, Jobs should be empty. Do not invent a cron.

### 1.9 Hardcoded client / other refs

| Location | What to do at cutover |
| --- | --- |
| `src/integrations/supabase/env.ts` | Fallbacks still point at `zpddlphtoeluytrejioj`. After Cloud works, either set `VITE_SUPABASE_*` or replace fallbacks with the Cloud URL/anon key (anon is public). |
| `src/integrations/supabase/client.ts` | Reads `./env`. Lovable may **overwrite** this file when Cloud is enabled — that is expected. Keep `./env` as the prerender source of truth. |
| `index.html` preconnect | Rewritten at build from `VITE_SUPABASE_URL` (vite plugin). Source still names the linked host as default. |
| `public/robots.txt` | Blog sitemap line rewritten into `dist/robots.txt` at build from the active URL. |
| `supabase/config.toml` `project_id` | Update to the Cloud ref after Enable Cloud. |
| `ARCHITECTURE.md` | Update the project ref after cutover. |
| `web/.env.local.example` | Frozen Next app; not production. Update only if someone runs `web/` locally. |

---

## 2. What cannot transfer cleanly (and mitigations)

| Thing | Why | Mitigation |
| --- | --- | --- |
| One-click “move this project to Cloud” | Lovable FAQ: *migration from Supabase to Cloud is not supported*. Disconnect + Enable Cloud is a **new** backend. | Manual export → enable Cloud → apply **this repo’s** migrations → import data. |
| Password hashes / GoTrue internals | Dashboard CSV has no bcrypt hashes. Restoring `auth.users` into Cloud’s Auth schema is unsupported / unsafe. JWT secret is new, so old sessions die anyway. | Recreate `predictivpty@gmail.com` on Cloud, confirm email. Send password-reset to any other real users (list emails from the old dashboard first). Portal is gated (`PUBLIC_LAUNCH_MODE = true`) so this is small. |
| `SUPABASE_SERVICE_ROLE_KEY` | Bound to the project JWT secret. Old key dies when the old project is later paused/cancelled. | Let Cloud inject a new one. Never paste it into the Vite client or git. |
| `LOVABLE_API_KEY` | Write-only; reserved on Cloud. | Confirm Cloud created it; rotate if the assistant 500s. |
| `PRACTITIONER_INVITE_TOKEN` | Write-only on both sides. | Re-enter from the password manager, or mint a new token. |
| Auth provider client secrets (Google/GitHub) | Not enabled live. New Cloud URL would need new OAuth clients anyway. | Leave disabled unless product asks. |
| Custom SMTP / email templates | Live uses Supabase default mailer (`mailer_autoconfirm: false`). Cloud Auth emails are Lovable-managed. | After Enable Cloud, set Site URL `https://predictiv.co.za` and redirect URLs. Confirm a test signup email. |
| Database DNS / `*.supabase.co` hostname | New project ref. | Env-based client + rebuild + Publish. Update `config.toml` project_id. |
| Row-level `auth.uid()` data | New Auth UUIDs will **not** match old `user_id` / `profiles.id` unless you restore users with the same UUIDs (you will not). | Public listings have `user_id` nullable and `is_claimed=false`. Import professionals **without** depending on old Auth UUIDs. Leave private user tables empty unless there is a real user you must keep. |
| Storage objects | New buckets; old public URLs would 404 after cancel. | Buckets are empty in practice. Recreate schema only. |
| Region | Cloud region is **locked** at Enable Cloud. Live functions run in `us-east-2`. | Pick **Europe** (closer to Cape Town) unless Justin has a reason not to. Cannot change later. |
| `practitioners` view | Not in repo; leaks unapproved rows. | Dropped by cutover-safety migration. Do not restore it from a dump. |
| Stale `types.ts` | Generated before blog/moderation. | Regenerate after Cloud schema exists. |

---

## 3. Export checklist (do this **before** Disconnect, while supabase.com is still live)

Keep the linked project running. Store exports **off** Lovable (Google Drive / 1Password / disk), not only in a Cloud storage bucket.

### 3.1 Dashboard copies (human)

1. Authentication → Users: screenshot + CSV of emails, confirmation status, last sign-in. Confirm `predictivpty@gmail.com` exists and is confirmed.
2. Authentication → Providers: screenshot (email on, Google/GitHub off).
3. Authentication → URL configuration: Site URL and Redirect URLs.
4. Edge Functions: list of 6 names, `verify_jwt` flags, last deploy time.
5. Edge Functions → Secrets: **names only** (`LOVABLE_API_KEY`, `PRACTITIONER_INVITE_TOKEN`, …). Values are not shown — retrieve from the password manager.
6. Storage: list buckets and object counts.
7. Database → Roles / API: copy the **current** anon key (already in git) and note that the service role must **not** be filed in git.
8. Billing: screenshot that this is the project you later intend to cancel — still do not cancel.

### 3.2 SQL editor on the linked project (service role)

Paste and save the result sets:

```sql
-- Tables, RLS, row counts (bypasses RLS)
select n.nspname as schema, c.relname as name, c.relkind,
       c.relrowsecurity as rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'storage', 'auth')
  and c.relkind in ('r', 'v', 'm')
order by 1, 2;

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by 1, 2, 3;

select 'professionals' as t, count(*) from public.professionals
union all select 'blog_posts', count(*) from public.blog_posts
union all select 'profiles', count(*) from public.profiles
union all select 'popia_consents', count(*) from public.popia_consents
union all select 'symptom_severity_rules', count(*) from public.symptom_severity_rules
union all select 'auth.users', count(*) from auth.users;

select id, email, email_confirmed_at, created_at, last_sign_in_at, raw_app_meta_data
from auth.users
order by created_at;

select id, name, public, created_at from storage.buckets;

-- Cron: empty result or "schema cron does not exist" is success
select extname from pg_extension where extname in ('pg_cron', 'pg_net');
```

### 3.3 Data dumps (minimum to keep the public site)

From a machine logged into the Supabase CLI (`supabase login` + `supabase link --project-ref zpddlphtoeluytrejioj`):

```sh
# Schema + data for public (includes listings + blog)
supabase db dump --linked -f /tmp/predictiv-public-schema.sql
supabase db dump --linked --data-only --use-copy -f /tmp/predictiv-public-data.sql

# Table-level CSV fallback (enough for the public site)
# Table Editor → professionals / blog_posts → Export CSV
```

If CLI dump is blocked, export CSV for:

1. `professionals` (all columns, including unapproved — you need the 3 hidden rows if you still want them as drafts)
2. `blog_posts` (all statuses)
3. `symptom_severity_rules` (if any rows exist under service role)

**Do not** export `calendar_integrations.api_credentials` to a shared drive without treating it as a secret.

### 3.4 Repo is already the schema source of truth

Apply **repo migrations in order**, not a blind `pg_restore` of the live database. Live has at least one object (the `practitioners` view) you must not copy.

Migration order (existing + new):

1. `20251115124455_*` professionals
2. `20251214*` interactions, severity, RLS hardening
3. `20260419*` initial idempotent schema + portal fields
4. `20260421*` / `20260527*` extra professional columns, `popia_consents`
5. `20250724*` preferences/history (may overlap 20260419)
6. `20260916*` directory fields + nullable `user_id`
7. `20260917*` / `20260920*` blog + E-E-A-T + author revert + moderation lock
8. `20260921120000_cloud_cutover_safety.sql` drop leaky view + storage buckets

Some early migrations overlap (Lovable + later idempotent rebuild). On a **blank** Cloud database, run them in timestamp order. If a statement errors because an object exists, that is expected — continue. Prefer Lovable “apply these migrations” in chat after Enable Cloud, with this file attached.

---

## 4. Cutover playbook (Justin / Web Geek)

Do not cancel supabase.com until every item in §6 is green.

### Phase A — freeze and export (old backend stays live)

1. Pause non-essential blog/directory edits for the window.
2. Complete §3 exports. Confirm 37 approved professionals and 5 published posts in the files.
3. Merge this PR to `main` and pull it into the Lovable project **before** Enable Cloud so `verify_jwt` for `blog-sitemap` and env-based URL are in the tree Lovable deploys.

### Phase B — Enable Cloud (new empty backend)

Lovable: each project has **one** backend. Disconnect does **not** delete supabase.com data.

1. In the Predictiv Finder Lovable project (not Peak Movement): **More → Cloud**.
2. Screenshot the connected Supabase project name (`zpddlphtoeluytrejioj`).
3. **Disconnect**, confirm. Code is unchanged; old API keeps serving predictiv.co.za until you Publish a build that points at Cloud.
4. Click **Enable Cloud** (shown next to “Already have a Supabase project? Connect it here”).
5. Region: **Europe** unless Justin prefers otherwise. **This cannot be changed later.**
6. If Enable Cloud is missing / greyed out (“not supported”): create a **new** Lovable project in the same workspace, import this GitHub repo, Enable Cloud there, then move the custom domain after smoke tests. Do not remix as a substitute — remix stays on whatever backend the source uses.

If Lovable rewrites `src/integrations/supabase/client.ts` with a new URL and anon key, that is success. Put the same values in `.env` / `.env.local` as:

```
VITE_SUPABASE_URL=https://<NEW_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new anon jwt>
```

Do not gitignore-remove `.env` if Lovable needs committed `VITE_*` for Publish. This repo gitignores `.env` today; the fallbacks in `env.ts` keep CI green until you update those fallbacks or add GitHub Actions env.

### Phase C — schema, functions, secrets on Cloud

1. Prompt Lovable (main version, not a draft): *Apply every SQL file under supabase/migrations in timestamp order to this Cloud database. Do not recreate a public.practitioners view. Then deploy all six edge functions using supabase/config.toml verify_jwt flags.*
2. Confirm tables in **More → Cloud → Database** match §1.1 (minus `practitioners`).
3. Confirm `is_blog_admin`, `protect_professional_moderation`, `availability_busy_blocks`.
4. **Edge functions:** all 6 listed; `blog-sitemap` and `analyze-health-concern` and `create-practitioner` must be JWT-off.
5. **Secrets:** Cloud should already have `SUPABASE_*` and `LOVABLE_API_KEY`. Add `PRACTITIONER_INVITE_TOKEN` only if you still use invite signup.
6. **Users:** create `predictivpty@gmail.com`, confirm email, set a new password in 1Password. Site URL `https://predictiv.co.za`. Redirect URLs: `https://predictiv.co.za/**`, `https://www.predictiv.co.za/**`, `https://*.lovable.app/**`.
7. **Storage:** `avatars` and `professional-photos` public-read (migration should have created them).
8. **Jobs:** empty.

### Phase D — import public data

1. Import `professionals` (CSV or SQL). Keep `user_id` null, `is_claimed` false, `is_approved` true for the 37 live cards. Use the SQL editor / service role so the moderation trigger does not force `is_approved=false`.
2. Import `blog_posts` (all 5 published; restore drafts if the CSV has them). `author_name` must stay `Predictiv` — do not put Justin Muller back.
3. Import `symptom_severity_rules` if the export had rows.
4. Skip private user tables unless Justin names a user that must survive (then recreate the Auth user first, then insert rows with the **new** UUID).

### Phase E — point the app at Cloud without going dark

Old backend still serves production until Publish.

1. Set `VITE_SUPABASE_*` to Cloud (or accept Lovable’s rewritten `client.ts`).
2. Update `supabase/config.toml` `project_id` to the Cloud ref (can be a follow-up commit).
3. Local: `npm run build && npm run test:seo` — prerender must still list Marcela Cawood / Rondebosch and the 5 blog slugs, now from Cloud.
4. Lovable **Publish** (or a preview URL first).
5. Update `dist` robots.txt is automatic on build; confirm `https://predictiv.co.za/robots.txt` lists the **new** `/functions/v1/blog-sitemap` after publish.
6. Custom domain stays on Lovable hosting. Do not retarget DNS at supabase.com.

### Phase F — keep supabase.com until §6 is green

1. Do not pause, delete, or cancel the linked project.
2. After 48–72 hours of green smoke tests, *then* a later run can pause billing. That is out of scope for this preparation.

---

## 5. Smoke tests (cutover day)

Run against the **preview/Cloud** URL first, then production after Publish.

| # | Check | Pass |
| --- | --- | --- |
| 1 | `GET {CLOUD}/rest/v1/professionals?is_approved=eq.true` with new anon key | 37 rows, no unapproved names |
| 2 | `GET {CLOUD}/rest/v1/practitioners` | 404 / missing (view dropped) |
| 3 | `GET {CLOUD}/rest/v1/blog_posts?status=eq.published` | 5 slugs |
| 4 | `GET {CLOUD}/functions/v1/blog-sitemap` (no user JWT) | XML with those 5 posts |
| 5 | `GET https://predictiv.co.za/robots.txt` after publish | Sitemap line uses **Cloud** host, not `zpddlphtoeluytrejioj` |
| 6 | `/practitioners/physiotherapists/rondebosch` | Marcela Cawood (or Kinnell) in HTML |
| 7 | `/blog/what-does-a-biokineticist-do` | Unique title, not homepage shell, author Predictiv |
| 8 | `/assistant` | Consent gate → Gemini analysis via Cloud function (not `ai_not_configured`) |
| 9 | `/join` | Contact copy still names `predictivpty@gmail.com` |
| 10 | `/admin/blog` | Sign in as `predictivpty@gmail.com`, open a draft |
| 11 | `POST {CLOUD}/functions/v1/create-practitioner` without token | 403 `admin_or_invite_required` |
| 12 | Unapproved professional not visible to anon | 3 formerly leaked names stay hidden |
| 13 | Google Search Console | Fetch robots.txt + one blog URL after publish |

---

## 6. Success criteria (when Cloud is actually done)

All of these must be true **before** anyone cancels supabase.com:

1. Production JS and prerender both talk to a host that is **not** `zpddlphtoeluytrejioj.supabase.co`.
2. 37 approved listings and 5 published posts match the export (spot-check slugs + suburbs).
3. All 6 edge functions deployed on Cloud with the `verify_jwt` flags in `supabase/config.toml`.
4. Assistant returns structured guidance (Gemini via `LOVABLE_API_KEY`).
5. `blog-sitemap` is public XML and listed in `robots.txt`.
6. `predictivpty@gmail.com` can sign in on Cloud and pass `is_blog_admin()`.
7. Anon cannot read unapproved professionals or private tables.
8. Custom domain https://predictiv.co.za still served by Lovable hosting.
9. Linked supabase.com project still exists (rollback: unset `VITE_SUPABASE_*` / restore fallbacks and Publish).

Rollback window: keep DNS and the old project. Republish with the fallback URL in `env.ts` if Cloud misbehaves.

---

## 7. In-repo changes shipped with this preparation

- `src/integrations/supabase/env.ts` — env-based URL/anon key with linked-project fallbacks
- `src/integrations/supabase/client.ts` — uses `env.ts`
- Vite preconnect + prerender + `robots.txt` follow the active URL
- `supabase/config.toml` — `blog-sitemap` `verify_jwt = false` (prevents a Cloud redeploy from locking the sitemap)
- `supabase/migrations/20260921120000_cloud_cutover_safety.sql` — drop leaky `practitioners` view; ensure storage buckets
- This playbook

Nothing in this PR deletes the linked project, rotations of service role, or Peak Movement.
