# Predictiv Finder — architecture

Canonical public site: **Vite + React SPA** at the repo root, published to
**https://predictiv.co.za** (currently via Lovable Cloud).

`web/` is a **frozen** Next.js App Router experiment. It is **not** deployed
to predictiv.co.za and must not be pointed at that domain in this repo. Keep
it for reference; do not add overlapping production routes there.

## What is live

- Directory: `/practitioners/:profession/:suburb`
- Assistant: `/assistant` → edge function `analyze-health-concern` (Gemini via Lovable AI Gateway)
- Blog CMS: Supabase `blog_posts` + `/admin/blog`
- Join/claim contact: `/join` (email; self-serve portal remains gated)

## Backend

- Supabase project `zpddlphtoeluytrejioj`
- Public listings: `professionals` where `is_approved = true`
- `is_approved` / `is_featured` can only be changed by service_role, JWT-less
  dashboard/SQL, or `is_blog_admin()` (trigger
  `protect_professional_moderation`)
- Public calendar busy/free: view `availability_busy_blocks` (no event titles)
- `create-practitioner` is **admin JWT or `PRACTITIONER_INVITE_TOKEN` only**.
  Public signup, if re-enabled, must use `supabase.auth.signUp`

## Rate limits (analyze-health-concern)

The function applies a **per-isolate** sliding window (8 req/min/IP, 60/min
global) and an origin allow-list. Isolates do not share memory, so this is
not a global WAF. Add a gateway/CDN quota before scaling ads to the assistant.

## Lockfiles

CI and documented local install use **npm** + root `package-lock.json`.
`bun.lock` / `bun.lockb` are leftover Lovable artifacts; do not treat them as
the source of truth for GitHub Actions. Lovable’s own publish flow may still
read bun locally — do not delete those files in a drive-by cleanup.
