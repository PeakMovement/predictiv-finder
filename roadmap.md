# Roadmap

## Move backend from personal Supabase to Lovable Cloud
### Decisions (confirmed 2026-09-22)
- Do NOT create predictivpty@gmail.com on the new backend (user chose not to). Note: `is_blog_admin()` checks for it, so blog admin access will need another route later.
- Restore ALL 40 practitioner listings including the three test rows (Samuel Stout, Aladdin Jacobson, unapproved "Justin").
- Six mailinator test accounts will not be recreated as sign-ins.
- [x] 1a. My own restore copy saved in supabase/backup/ (40 listings, 5 posts, 32 rules, 8 profiles, account list)
- [x] 1b. Your own dashboard backup downloaded (belt and braces) — your click (assumed done; confirm before cancelling the old account)
- [x] 2. Disconnect the external Supabase and enable Lovable Cloud
- [x] 3. Re-apply all tables, functions, triggers and access rules to Cloud (me)
- [x] 4. Restore data: 37 directory listings, 5 blog posts, 32 severity rules, 8 profiles (me)
- [x] 5. Re-deploy all 6 edge functions with the same settings (me)
- [x] 6. Re-create secrets: LOVABLE_API_KEY (me)
- [x] 7. Email auth enabled; accounts NOT auto-recreated — real users (peakmvement@gmail.com, justin15muller@gmail.com) must use password reset on first sign-in
- [x] 8. Client now points at Cloud via VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (me)
- [x] 9. Smoke test: home + /assistant (launch-mode routes); consent gate verified; no console errors (me)
- [x] 10. Published to predictiv.co.za (2026-09-22). Security scan cleaned: RLS on symptom_severity_rules, storage photo rules owner-bound (migrations 0016-0018).

## Open items (post-cutover)
- Blog admin: predictivpty@gmail.com was not created, so `is_blog_admin()` matches nobody — blog admin needs a new route/approach.
- Practitioner photos: buckets are private on Cloud, so `getPublicUrl()` links won't serve; switch to signed URLs when the directory/portal is re-enabled.
- Only you can confirm the old Supabase account (zpddlphtoeluytrejioj) can be cancelled.
