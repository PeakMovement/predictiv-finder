# Roadmap

## Move backend from personal Supabase to Lovable Cloud
### Decisions (confirmed 2026-09-22)
- Do NOT create predictivpty@gmail.com on the new backend (user chose not to). Note: `is_blog_admin()` checks for it, so blog admin access will need another route later.
- Restore ALL 40 practitioner listings including the three test rows (Samuel Stout, Aladdin Jacobson, unapproved "Justin").
- Six mailinator test accounts will not be recreated as sign-ins.
- [x] 1a. My own restore copy saved in supabase/backup/ (40 listings, 5 posts, 32 rules, 8 profiles, account list)
- [ ] 1b. Your own dashboard backup downloaded (belt and braces) — your click
- [ ] 2. Disconnect the external Supabase and enable Lovable Cloud — needs your click in the Cloud panel
- [ ] 3. Re-apply all tables, functions, triggers and access rules to Cloud (me)
- [ ] 4. Restore data: 40 practitioner listings, 5 blog posts, 32 severity rules, 8 profiles (me)
- [ ] 5. Re-deploy all 6 edge functions with the same settings (me)
- [ ] 6. Re-create secrets: LOVABLE_API_KEY, PRACTITIONER_INVITE_TOKEN if used (me + you for values)
- [ ] 7. Recreate sign-in accounts; admin predictivpty@gmail.com verified, others get a password reset (me)
- [ ] 8. Remove the hardcoded old project URL/key from the client and point at Cloud (me)
- [ ] 9. Smoke test: home, /practitioners/..., /blog, /assistant, /admin/blog, /join (me)
- [ ] 10. Publish to predictiv.co.za, then tell you it's safe to cancel the old account
