# Move the backend onto Lovable Cloud

## What I confirmed

Your screenshot settles it: this project is connected to your own Supabase account (project `zpddlphtoeluytrejioj`), not to built-in Lovable Cloud. Today's contents:

- 40 practitioner listings, 5 blog posts, 32 severity rules, 8 profiles, 8 sign-in accounts
- 18 tables, 10 database functions, 11 triggers, all access rules
- 6 edge functions, no file storage buckets in use
- The old project address and public key are hardcoded in three files

## Two things I cannot do myself (you click, I do the rest)

1. **Switching the backend.** Only you can press Disconnect and turn on Lovable Cloud in the Cloud panel. Lovable gives a project one backend at a time, so there's no way to build the new one alongside the old one and swap.
2. **A raw database dump.** I have no direct database login here, so the belt-and-braces backup must come from your Supabase dashboard. I will separately capture every row through the app connection and commit it to the project as restore files, so I can rebuild the data even if the dump is never needed.

Also, saved passwords cannot move across. Accounts and emails can, passwords cannot — so everyone signs in once via a password reset. I'll confirm the admin account (predictivpty@gmail.com) works before we go live.

## Order of work

**Step 1 — backup (before anything changes)**
- Me: export every table's rows into `supabase/backup/` restore files, committed to the project.
- You: in the Supabase dashboard, Database → Backups (or Settings → Export) and download a copy. Tell me when it's saved.

**Step 2 — switch (your click)**
- Cloud panel → Disconnect, then enable Lovable Cloud. Nothing is deleted on your Supabase side; the app just stops pointing at it.

**Step 3 — rebuild (me, in one pass)**
- Apply the full schema: all 18 tables, the practitioners view, `availability_busy_blocks`, the moderation lock trigger, `is_blog_admin()` for predictivpty@gmail.com, and every access rule exactly as today (nothing left open).
- Restore all data from Step 1: directory listings keep their approved/unclaimed flags, blog posts keep their content and slugs, severity rules intact. Nothing invented.
- Re-deploy all 6 edge functions with today's settings: `analyze-health-concern` (public, origin allow-list + rate limit), `create-practitioner` (admin or invite token only), `ai-health-assistant`, `sync-calendar-availability`, `symptom-severity-evaluator`, `blog-sitemap`.
- Remove the hardcoded old project address/key from `src/integrations/supabase/client.ts`, `supabase/config.toml` and `vite-plugins/seo-prerender.ts`, replacing them with the Cloud values.
- Recreate the sign-in accounts and set the admin's redirect addresses for predictiv.co.za and the Lovable preview.

**Step 4 — secrets**
- `LOVABLE_API_KEY` comes with Cloud. If `PRACTITIONER_INVITE_TOKEN` or any calendar keys are in use, I'll ask you for them through the secure secret form — never in chat.

**Step 5 — verify, then publish**
- Smoke test: home page, `/practitioners/physiotherapists/rondebosch`, `/blog`, `/assistant` (consent gate → AI answer), `/admin/blog` sign-in, `/join`, and a check that `create-practitioner` still rejects anonymous calls.
- Only once all of that passes do I publish to predictiv.co.za and write you cutover notes: what moved, what needed rebuilding, and the password-reset steps.
- Your old Supabase project stays untouched the whole time. I'll tell you when it's safe to cancel it.

## Where the risk sits

Between Step 2 and the end of Step 3 the live site has an empty backend. That window is short (one work pass), but if you'd rather avoid any public gap, say so and I'll put a short "back in a moment" notice on the live site for the duration.

The frozen Next.js app under `web/` is left alone, and no Peak Movement site is touched.
