# Predictiv Finder

Public practitioner directory and directional “who to see” assistant for Cape
Town (Rondebosch / Southern Suburbs first). **Not medical advice.** Bookings
happen on the practice’s own website.

**Live site:** https://predictiv.co.za  
**Canonical app:** Vite + React at the repo root. See [ARCHITECTURE.md](./ARCHITECTURE.md).

The `web/` Next.js app is **frozen** and is not deployed to predictiv.co.za.

Peak Movement marketing (peakmovement.co.za) is a different product and is
not this repository.

## Stack

- Vite 5, React 18, React Router, Tailwind, shadcn/ui
- Supabase (Postgres + Auth + Edge Functions)
- Public assistant: `analyze-health-concern` → Lovable AI Gateway / Gemini

## Run locally

```sh
npm install          # uses package-lock.json (CI does too)
cp .env.example .env.local   # optional; see comments in that file
npm run dev          # http://localhost:8080
```

```sh
npm run build
npm run test:seo     # requires dist/ from the Vite build; hits live anon Supabase during prerender
npm run lint
```

## Environment

Client env vars are listed in `.env.example`. The public **anon** URL and key
default to the linked supabase.com project in
`src/integrations/supabase/env.ts` and can be overridden with
`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (needed for Lovable
Cloud cutover). Never put the **service role** key in the client.

Edge function secrets (already on the linked project, not in git):

- `SUPABASE_SERVICE_ROLE_KEY` — used only by admin paths such as `create-practitioner`
- `LOVABLE_API_KEY` — AI gateway
- `PRACTITIONER_INVITE_TOKEN` — optional; if set (16+ chars), allows
  `create-practitioner` with a matching `invite_token` in the JSON body

Apply new SQL with the usual Supabase workflow (`supabase db push` / dashboard).
Migration `20260920180000_lock_moderation_and_availability.sql` must be applied
for moderation triggers and the busy/free availability view.
Migration `20260921120000_cloud_cutover_safety.sql` drops the leftover
`practitioners` view (it leaked unapproved rows) and ensures storage buckets.

Moving off supabase.com onto Lovable Cloud is a **manual** cutover. Follow
[docs/MIGRATION_TO_LOVABLE_CLOUD.md](./docs/MIGRATION_TO_LOVABLE_CLOUD.md).
Do not delete the linked project or cancel supabase.com until that playbook’s
success criteria are green. Peak Movement marketing is out of scope.

## Publish

Production is published from Lovable Cloud (root Vite app). GitHub Actions
runs lint, build, and SEO selftests on pull requests; it does not deploy.

## Practitioner listings

Unclaimed cards were compiled from public practice websites. To list, claim,
update, or remove a listing, use https://predictiv.co.za/join
(`predictivpty@gmail.com`).
