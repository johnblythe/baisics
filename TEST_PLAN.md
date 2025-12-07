# Test Plan

## 1. Landing Pages (2 min)
- [ ] `/landing-v2` - cream/terracotta
- [ ] `/landing-v2a` - coral accent
- [ ] Pick winner, note any tweaks needed

## 2. New User Flow via `/hi` (5 min)
- [x ] Fresh/incognito browser → `/hi`
- [ x] Complete onboarding chat
- [ x] Program generates successfully
- [ x] Redirects to dashboard with program

## 3. Dashboard & Program View (3 min)
- [ x] Program displays correctly
- [ ?] Week/day navigation works
- [ ?] Exercise details expand

## 4. Workout Tracking (3 min)
- [ x] Start a workout
- [ x] Log sets/reps
- [ x] Complete workout
- [ x] Progress saves

## 5. Tier 2 Features (5 min)
- [ ] Upload progress photo
- [ ] Photo comparison view
- [ ] Exercise swap (click swap on any exercise)
- [x ] Weekly check-in form

## 6. Tier 3 Features (3 min)
- [- ] Social share button works
- [- ] Template library loads
- [- ] Coach mode toggle (if applicable)

## 7. Returning User - New Program (3 min)
- [ x] `/dashboard/new-program` flow
- [ x] Creates second program
- [ x] Can switch between programs

---

## Notes
- Start with `/hi` in incognito - critical first-impression path
- Run `npx prisma migrate dev` if coach mode schema not yet migrated

## Recent Fixes (Dec 6)
- **Unified generation service wired up** - Now 1-2 AI calls instead of 6-7
- **Fixed stale userId bug** - User creation now uses local var, not async state
- **Fixed JSON parsing** - Claude Sonnet 4 returns markdown-wrapped JSON, now stripped
- **Removed redundant intake save** - Unified service handles it
