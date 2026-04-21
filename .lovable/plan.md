

## Fix CORS Error on Practitioner Signup

### Root Cause

The `create-practitioner` edge function is **not listed in `supabase/config.toml`**. Without an explicit entry, the Supabase platform defaults to `verify_jwt = true`, which means it rejects the browser's CORS **preflight (OPTIONS) request** before the function code ever runs — because the preflight has no auth token.

That's exactly what the error says:
> Response to preflight request doesn't pass access control check: It does not have HTTP ok status.

The function's own CORS handler is correct — it just never gets called because the platform blocks the preflight first.

This function intentionally creates new accounts (signup), so it **must be public** (no JWT required). The signup flow can't have a JWT because the user doesn't have an account yet.

---

### Fix

**File: `supabase/config.toml`**

Add an explicit entry disabling JWT verification for the signup function:

```toml
[functions.create-practitioner]
verify_jwt = false
```

That's the only change required. Edge functions auto-deploy, and the new config takes effect immediately on the next deploy.

---

### Why This Is Safe

- The function uses the **service role key** internally to create the auth user — it does not trust any client-supplied auth.
- It only accepts `{ email, password }` and creates a confirmed user. This is the standard pattern for a public signup endpoint (equivalent to `supabase.auth.signUp`, which is also unauthenticated).
- Input validation can be tightened later if desired (e.g. password strength, email format, rate limiting), but that's separate from the CORS fix.

---

### What Will NOT Be Changed

- The function code (`supabase/functions/create-practitioner/index.ts`) — its CORS headers are already correct.
- The client call in `src/pages/PractitionerPortal.tsx` — it's already sending the right headers.
- Any other functions, RLS policies, or signup logic.

---

### Expected Result After Deploy

- Browser sends `OPTIONS /functions/v1/create-practitioner` → platform returns 200 with CORS headers.
- Browser sends `POST /functions/v1/create-practitioner` → function creates the user, returns `{ userId }`.
- The signup form on `predictiv-medic-finder.netlify.app` completes successfully.

