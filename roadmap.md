# Roadmap

## Move backend from personal Supabase to Lovable Cloud
- [ ] 1. Back up everything from the current project (SQL dump + data export) — needs your click in the Supabase dashboard
- [ ] 2. Disconnect the external Supabase and enable Lovable Cloud — needs your click in the Cloud panel
- [ ] 3. Re-apply all tables, functions, triggers and access rules to Cloud (me)
- [ ] 4. Restore data: 40 practitioner listings, 5 blog posts, 32 severity rules, 8 profiles (me)
- [ ] 5. Re-deploy all 6 edge functions with the same settings (me)
- [ ] 6. Re-create secrets: LOVABLE_API_KEY, PRACTITIONER_INVITE_TOKEN if used (me + you for values)
- [ ] 7. Recreate sign-in accounts; admin predictivpty@gmail.com verified, others get a password reset (me)
- [ ] 8. Remove the hardcoded old project URL/key from the client and point at Cloud (me)
- [ ] 9. Smoke test: home, /practitioners/..., /blog, /assistant, /admin/blog, /join (me)
- [ ] 10. Publish to predictiv.co.za, then tell you it's safe to cancel the old account
