
## Goal
Implement the chosen "Editorial Glass" direction at `/` and make every reachable page (`/` and `/assistant`, plus the 404) share the same visual language: deep dark background, single blue primary `hsl(210 90% 56%)`, soft radial blue glow, glassmorphic cards (`bg-card/50 border-border backdrop-blur-md rounded-2xl`), Plus Jakarta Sans display + Inter body, disclaimer chip styling.

## Changes

### 1. New `src/pages/Landing.tsx`
Build the selected prototype using semantic tokens (no hard-coded HSL):
- Disclaimer chip (`bg-primary/10 border border-primary/20`, pulsing dot)
- Hero: "Navigate Your Health / With Certainty." — `text-foreground` + `text-primary` accent
- Expanded warm subhead (3–4 sentences covering plain-language summary, Rand pricing, and which specialist to see)
- 3-card glass trio: The Summary / SA Pricing / The Expert
- Primary CTA → `/assistant` with blue glow on hover
- Trust line: "Purpose-built for South Africa · Localized Guidance"
- Radial primary glow behind hero (`bg-primary/10 blur-[120px]`)

### 2. Route `/` to `Landing` (`src/App.tsx`)
Replace `<Route path="/" element={<Index />} />` with `<Route path="/" element={<Landing />} />`. `Index`/`AppContent` stay in the codebase (launch-mode hidden) but no longer render their teal→purple gradient on `/`.

### 3. Align `/assistant` (`src/pages/AIHealthAssistant.tsx`)
- Wrap content in the same dark background (`bg-background`) and add the radial glow accent behind the page header so it visually matches the landing.
- Reuse the disclaimer chip styling at the top of the assistant view (the existing `DisclaimerBanner` already covers content; we'll restyle it to match the chip — uppercase tracked label, primary/10 background, pulsing dot).

### 4. Align `DisclaimerBanner` (`src/components/directional-guidance/DisclaimerBanner.tsx`)
Restyle to the chip pattern from the prototype so it reads as the same system element on both pages.

### 5. Align `NotFound` (`src/pages/NotFound.tsx`)
Same dark surface, same hero treatment, link back to `/` styled like the primary CTA.

### 6. Typography (`src/index.css`)
Add `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');` and set headings (`h1, h2, h3`) to Plus Jakarta Sans via a base layer rule; body stays Inter.

### 7. Memory
Append a memory file `mem://design/editorial-glass-system` capturing the locked design system (Plus Jakarta headings, radial primary glow, glass card pattern, chip pattern) and reference it from the index.

## Out of scope
- No new copy beyond hero/cards/disclaimer/trust line.
- No changes to gated routes (still redirect to `/`).
- No backend, RLS, or edge-function changes.
- No changes to the assistant's underlying logic — just surface styling.

## Acceptance
- `/` renders the Editorial Glass landing, no teal or purple anywhere.
- `/assistant` shares the same background, glow, chip pattern, card styling, and typography as `/`.
- `NotFound` matches the system.
- Light mode still works (tokens, not raw HSL).
