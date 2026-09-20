# Legacy surfaces — do not mount on public routes

The Vite app on predictiv.co.za is the practitioner directory, blog, and
directional `/assistant`. The following paths are leftover from an earlier
health-plan / CSV-physician product. They are kept so nothing already in
Supabase or gated routes breaks, but they must not be re-attached to
`src/App.tsx` without an explicit product decision.

| Path | What it is |
|------|------------|
| `src/pages/Index.tsx` → `AppContent` | Multi-stage plan generator / booking wizard. **Not routed.** |
| `src/utils/planGenerator/` | Symptom → plan LP solver and mock professionals |
| `public/physicians.csv` | Synthetic SA names + Peak Movement Calendly leftovers |
| `public/treatments.csv` | Plan optimizer input |
| `src/data/mockData.ts` | Static practitioner fixtures |
| `docs/AI_HEALTH_ASSISTANT.md` | Describes the CSV flow; outdated vs production |

`PUBLIC_LAUNCH_MODE` still switches `/assistant` from `DirectionalGuidanceView`
to `PhysicianRecommendationsView` (CSV). Leave launch mode on in production.
