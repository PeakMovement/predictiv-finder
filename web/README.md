# Predictiv Web (public directory + SEO site)

Next.js App Router rebuild of the public-facing side of Predictiv: the
"Find a Practitioner" and "Name Your Problem" flows, programmatic local SEO
pages, and the blog. This lives alongside the existing Vite app (the AI
health assistant chat experience, `../src`) rather than replacing it, so
nothing already live breaks.

## Why this is a separate app from `../src`

The existing app is a client-only Vite SPA (`PUBLIC_LAUNCH_MODE` in
`../src/config/launchMode.ts` currently hides everything except the landing
page and chat assistant). Ranking dozens of location/profession pages needs
fast, crawlable, unique HTML per URL and JSON-LD at first paint, which a
pure client-rendered SPA can't reliably give you. This app statically
generates the SEO-critical pages instead.

## Setup

```
cp .env.local.example .env.local   # fill in the anon key
npm install
npm run dev
```

## What's real vs what needs you

- Schema migration `../supabase/migrations/20260916000000_add_directory_fields.sql`
  has been applied to the live `Predictiv. Finder` project (latitude,
  longitude, rating, review_count, is_featured, slug, suburb on
  `professionals`).
- The directory and symptom flows both read live from `professionals` via
  Supabase (`is_approved = true` only). Right now that table has 4 rows and
  none are in Rondebosch, so `/practitioners/rondebosch/*` will render but
  show the "we're onboarding" empty state until real practitioners are
  added with `suburb = 'Rondebosch'`, a `slug`, and lat/lng set.
- `rating` / `review_count` are cached columns, not live-fetched. Wiring
  them to the Google Places API on a schedule is not done yet (needs a
  `GOOGLE_PLACES_API_KEY` and a small cron/edge function).
- One seed blog post targets "physiotherapist Rondebosch" long-tail intent.
  Add more posts in `lib/posts.ts`.
- `/join` (practitioner sign-up CTA linked from empty listing pages) is not
  built yet in this app; it exists in the old app at
  `../src/pages/PractitionerPortal.tsx` behind `PUBLIC_LAUNCH_MODE`.
