# Public Launch Prep — Brand Sync + Feature Isolation + Directional Output

Goal: get the public site ready for early users while keeping all backend infrastructure intact. End users see one experience: describe a concern → get a directional summary (price range, loose treatment plan, suggested specialty). Booking, auth, directory, and practitioner signup stay in the codebase but become unreachable from the public UI.

---

## 1. Brand & color scheme sync

**Source of truth:** existing dark mode + blue primary already defined in `src/index.css` (`--primary: 210 90% 56%` in dark, `210 90% 50%` in light). Memory currently says purple `#8B5CF6` — that is overridden by your explicit choice today and will be updated.

Changes:
- **`src/components/Header.tsx`** — replace hard-coded `from-system-blue to-system-purple` gradient and `dark:hover:text-system-teal` with semantic tokens (`text-foreground`, `hover:text-primary`, `from-primary to-primary/70`). Remove "Professional Login" button and dashboard link from the public header (see §2).
- **`tailwind.config.ts`** — keep `system.*` colors for legacy components but stop using them in shared chrome. The `--primary` CSS var already wires correctly.
- **`PhysicianRecommendationsView.tsx` and `PhysicianCard.tsx`** — swap `health-purple`, `text-gray-900`, `text-gray-600` etc. for `text-primary`, `text-foreground`, `text-muted-foreground` so dark mode reads correctly. (Even though this view will be hidden, we leave it themed so it's launch-ready later.)
- **`AIHealthAssistant`, `ProductionHealthAssistant`, `HomeHero`, footer** — audit for any remaining `system-purple`, `health-purple`, raw hex, or `text-white/black` and replace with tokens.
- **`src/App.css`** — already neutral; no change.
- **Memory update:** rewrite `mem://design/predictiv-final-theme-system` and the Core memory line to: "Dark mode, blue primary (`--primary` HSL `210 90% 56%`). No purple accent."

---

## 2. Feature isolation (hidden from public, kept in code)

We do **not** delete any code, services, edge functions, or DB tables. We only make these unreachable from the public navigation and gate the routes behind a single `PUBLIC_LAUNCH_MODE` flag in `src/config/launchMode.ts` (new file, exports `const PUBLIC_LAUNCH_MODE = true`).

Hidden surfaces:
| Surface | How it's hidden |
|---|---|
| Book a Professional CTAs | `BookingDialog`, "Book" buttons in `PhysicianCard`, plan details, dashboard — wrapped in `{!PUBLIC_LAUNCH_MODE && ...}` |
| Practitioner directory | `/professionals` and `/services` routes redirect to `/` when flag is on. Nav links removed from header. |
| User auth / dashboard | `LoginModal`, `UserProfileMenu`, "Professional Login" button removed from header. `/professional-dashboard`, `/pro-login` redirect to `/`. AI assistant runs anonymously (no `supabase.auth.getSession()` gate — see §3). |
| Practitioner signup portal | `/join/predictiv-practitioners` redirects to `/` when flag is on. URL preserved in code; you can still reach it by temporarily flipping the flag locally. |
| `/explore` (old Index) | Redirect to `/`. |
| Dev `/test/*` | Unchanged (already isolated). |

Header becomes: logo + theme toggle only. No nav links, no auth buttons.

---

## 3. Reshape assistant output → directional, non-advisory

Phase-1 user flow on `/`:
1. User types concern (existing `ProductionHealthAssistant` input — unchanged).
2. Submit triggers a new `DirectionalGuidanceView` instead of `PhysicianRecommendationsView`.
3. Result card shows:
   - **Concern summary** (1–2 line restatement)
   - **Estimated price range in Rand** (e.g. "R450 – R1,200 per session") — computed from existing treatment/practitioner data
   - **Loose proposed plan** (3–5 step bullet list, plain-language, no dosages, no diagnoses)
   - **Suggested specialty** (e.g. "Consider consulting a Physiotherapist") — uses existing `categoryMatchPractitionersToNeeds` / specialty-mapping logic but stops short of naming a person
   - **Persistent disclaimer banner** at the top of the result: "This is directional guidance only and not medical advice. For diagnosis or treatment, please consult a qualified healthcare professional." Styled as `bg-accent border-accent-foreground/20`, always visible above results.

Critically we **keep**:
- `physician-recommendation-service.ts` matching algorithm
- `aiPlanGenerator` and category matcher
- Specialty mapping rules
- Severity context, escalation overlay (red-flag escalation still triggers for critical symptoms — that's a safety feature, not a "find pro" feature)

We only **stop rendering** the practitioner cards and booking CTAs. The matched specialty string is surfaced; matched practitioner objects are computed but not displayed.

Anonymous use: the AI assistant currently requires a session in `useAIAssistant`. Add a guest path that calls the edge function with the anon key (no `auth.getSession()` requirement). Edge function `ai-health-assistant` may need its `verify_jwt` flag set to `false` in `supabase/config.toml` — confirm before flipping.

---

## 4. Files touched (summary)

New:
- `src/config/launchMode.ts`
- `src/components/directional-guidance/DirectionalGuidanceView.tsx`
- `src/components/directional-guidance/DisclaimerBanner.tsx`
- `src/services/price-estimate-service.ts` (wraps existing practitioner cost data → range)

Modified:
- `src/App.tsx` — route guards/redirects driven by `PUBLIC_LAUNCH_MODE`
- `src/components/Header.tsx` — strip nav + auth, theme tokens
- `src/pages/AIHealthAssistant.tsx` — render `DirectionalGuidanceView` instead of `PhysicianRecommendationsView`
- `src/hooks/useAIAssistant.ts` — allow anonymous calls
- `supabase/config.toml` — `verify_jwt = false` for `ai-health-assistant` (only if confirmed)
- Theme cleanup pass across header, hero, results components

Memory:
- Update Core: theme = dark + blue (not purple). Add note: "Public launch mode — booking/auth/directory/practitioner-signup hidden behind `PUBLIC_LAUNCH_MODE` flag. Do not remove the underlying code."

Untouched:
- DB schema, RLS, edge functions (other than the one config flip), practitioner data, matching algorithms, severity/escalation logic.

---

## 5. Out of scope (explicitly)

- No new AI features, no diagnostic language, no symptom intake redesign
- No removal of any table, function, or service
- No payments, no email, no SMS
- No light-mode rework (dark stays default; light tokens stay as-is)
- No redesign of the assistant input UI itself
