
# Smarter Assistant + POPIA Consent

Two tracks, shipped together so we never send health text to the LLM without consent.

## Track A — POPIA consent gate

### 1. Consent storage
New table `popia_consents` (one row per user per consent version):
- `user_id`, `consent_version` (e.g. `"2026-05-v1"`), `granted_at`, `ip_hash`, `user_agent`
- RLS: users can read/insert their own rows only; service_role full access.

### 2. Consent UI on `/assistant`
Before the input is usable, show an Editorial-Glass consent card:
- Title: "Before we begin"
- Plain-language bullets: what we collect, why, that it's processed by an AI model hosted outside SA, no training on inputs, retention, right to delete, not medical advice.
- Two checkboxes (both required):
  - "I consent to my health description being processed to generate directional guidance."
  - "I understand this is not medical advice and emergencies require calling 10177."
- Link to full `/privacy` notice.
- "I agree & continue" button → writes to `popia_consents`, unlocks input.
- Persisted: if a row exists for the current `consent_version`, skip the gate.

### 3. Privacy notice page `/privacy`
Static page (Editorial Glass) covering POPIA s18 disclosures: responsible party, purpose, recipients (Google via Lovable AI Gateway), cross-border transfer basis, retention, data-subject rights, Information Officer contact placeholder.

### 4. Footer link
Add "Privacy" link in `Landing.tsx` and `/assistant` footer.

## Track B — LLM-powered extractor

### 1. New edge function `analyze-health-concern`
- JWT-verified, CORS, Zod input validation (`message` ≤ 5000 chars).
- **Server-side guard**: refuse to call the LLM unless a current `popia_consents` row exists for the user → 403 `consent_required`.
- **Identifier stripping**: never forward `user_id`, email, or auth headers into the LLM prompt body.
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with structured tool-calling to return:
  ```
  {
    concern_summary: string,
    symptoms: string[],
    duration: string | null,
    body_region: string | null,
    severity_hint: "mild"|"moderate"|"severe"|"critical",
    red_flags: string[],
    suggested_specialty: string,   // mapped to SA specialty list
    price_range_zar: { min: number, max: number },
    next_steps: string[],
    confidence: number             // 0-1
  }
  ```
- Local red-flag detector (existing `detectComprehensiveSymptoms`) runs **first** as a safety net — if it flags critical, we short-circuit to the escalation path without waiting for the LLM.
- Logs interaction to `ai_interactions` with raw message redacted after 30 days (add a scheduled cleanup later — for now just store with a `redact_after` timestamp).
- Handles 429/402 from gateway and returns clear errors.

### 2. Client integration
- `HealthAssistantInput` / `QuickHealthInput` call the new function via `supabase.functions.invoke`.
- On `consent_required` error → re-show consent gate.
- Render the structured output in the existing Editorial Glass result card (summary + specialty + R price range + bullets + disclaimer chip).
- Show extracted symptoms/duration/region as small editable chips so users can correct ("we understood…").

### 3. Keep existing local extractors
- `analyzeUserHealth` and friends stay as the offline fallback and as the pre-LLM red-flag screen. No deletion.

## Technical details

- Table: `popia_consents (id uuid pk, user_id uuid, consent_version text, granted_at timestamptz default now(), ip_hash text, user_agent text, unique(user_id, consent_version))` with RLS + GRANTs.
- Constant: `CURRENT_CONSENT_VERSION` in `src/config/popia.ts`. Bumping it forces re-consent.
- Edge function: `supabase/functions/analyze-health-concern/index.ts`. Uses `LOVABLE_API_KEY` (will enable AI gateway if not already).
- New hook: `useConsent()` — checks Supabase for current consent row, exposes `hasConsent`, `grantConsent()`.
- New components: `ConsentGate.tsx`, `pages/Privacy.tsx`.
- Route: add `/privacy` to `App.tsx` (launch-safe, public).
- No changes to severity context or escalation overlay — they continue to work off the local detector and the LLM's `severity_hint`/`red_flags`.

## Out of scope (for this round)

- Automated PII redaction beyond not forwarding identifiers (LLM may still see names the user types — we mention this in the consent copy).
- Scheduled deletion job for old `ai_interactions` (we add the `redact_after` column now, wire the cron later).
- Practitioner directory / booking (still hidden by launch mode).
- Legal review — flagged in the notice that this is a working draft pending SA privacy counsel review.
