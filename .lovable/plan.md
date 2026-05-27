
## Goal
Swap the primary landing page so visitors first see the marketing/HomeHero page (currently at `/explore`) instead of the AI Health Assistant. The assistant moves to `/assistant`.

## Changes

### 1. Routing (`src/App.tsx`)
- `/` → `Index` (the HomeHero page).
- `/assistant` → `AIHealthAssistant`.
- `/explore` → redirect to `/` (was the HomeHero route).
- Keep all other `gate()`-protected routes unchanged (still redirected to `/` in launch mode).
- Update the `Hidden` redirect target so launch-mode gated routes still send users to `/` (now the landing).

### 2. HomeHero CTAs (`src/components/homepage/HomeHero.tsx` and `src/components/AppContent.tsx` if it wires nav)
- "Predictiv" / AI button → navigate to `/assistant` instead of internal stage switch.
- In `PUBLIC_LAUNCH_MODE`, hide the launch-gated CTAs/cards that link to `/professionals`, `/success-stories`, "Browse Categories", dashboard, and stats block — leaving a clean landing with a single primary CTA: "Start with Predictiv" → `/assistant`.
- Replace remaining `text-health-purple` / `bg-health-purple` classes with semantic tokens (`text-primary`, `bg-primary`) to comply with the brand memory.

### 3. Header (`src/components/Header.tsx`)
- Logo link target stays `/` (now landing). No nav changes needed; launch mode already hides links.

### 4. `index.html`
- Update `<title>` and meta description to reflect the landing page (marketing-first) rather than the assistant.

### 5. Memory update
- Update `mem://index.md` Core routing rule: `/` = landing (HomeHero, launch-safe), `/assistant` = directional assistant, gated routes still redirect to `/`.
- Update `mem://navigation/default-landing-page` and `mem://features/public-launch-mode` to reflect the new entry point.

## Out of scope
- No backend, edge function, DB, or assistant-logic changes.
- No redesign of HomeHero beyond removing hidden-feature CTAs and swapping purple → primary tokens.
- Disclaimer banner, severity logic, and price/specialty output on `/assistant` remain exactly as-is.

## Acceptance
- Visiting `/` shows the HomeHero landing with one prominent CTA to the assistant.
- Visiting `/assistant` shows the current Directional Guidance experience unchanged.
- `/explore` and other gated routes redirect to `/`.
- No purple/legacy tokens left in HomeHero.
