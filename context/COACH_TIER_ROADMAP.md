# Coach Tier Roadmap

## Priority Order
1. ~~#206 - Assignment UI~~ ✅
2. ~~#207 - Program Import Tool~~ ✅
3. ~~#204 - Stripe Coach Tier Config~~ ✅
4. ~~#200 - Subscription + Limits~~ ✅
5. ~~#201 - Analytics + Onboarding~~ ✅

## Completed
- [x] #158 - Coach Tier: B2B2C Model (core infra)
- [x] #190 - Manual Program Builder v2
- [x] #198 - Public invite links
- [x] #199 - Check-ins + Activity Alerts
- [x] #209 - Share page v2a redesign (PR #211)
- [x] #210 - Coach dashboard polish + settings + branding (PR #211)
- [x] #206 - Coach Assignment UI (2026-01-05)
- [x] #207 - Program Import Tool (2026-01-05)
- [x] #204 - Stripe Coach Tier Config (2026-01-06)
- [x] #200 - Subscription + Limits (2026-01-06)
- [x] #201 - Analytics + Onboarding (2026-01-06)

## Up Next

### #204 - Stripe Coach Tier Config

**Existing Infrastructure:**
- `src/app/api/webhooks/stripe/route.ts` - webhook handler exists
- `prisma/schema.prisma` - Subscription model with status enum
- User model has `isCoach: Boolean` field
- Stripe SDK configured with env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**TODO:**
1. Create Stripe products in dashboard:
   - Coach Free (0 clients? or 3 clients)
   - Coach Pro ($X/mo, unlimited clients)
2. Add `stripePriceId` constants or env vars for coach tiers
3. Update webhook to recognize coach tier price IDs
4. Add `subscriptionTier` field to Subscription model (optional - can use priceId)
5. Create checkout session API for coach upgrade
6. Add billing portal link for coaches

**Key Files:**
- `src/app/api/webhooks/stripe/route.ts`
- `prisma/schema.prisma` (Subscription model)
- `src/app/api/user/route.ts` (returns isCoach)

### #200 - Coach Subscription + Limits (depends on #204)
- Enforce client limits by tier (free: 3?, pro: unlimited)
- Show upgrade prompt when hitting limits
- Billing portal integration for subscription management

### #201 - Analytics + Onboarding
- Coach analytics dashboard (client progress, engagement metrics)
- First-time coach onboarding flow (welcome wizard)

## Tech Debt (#192)
- Nutrition modal placeholders should match prescribed macros
- Unsanitized exercise name in coaching query
- Overly broad catch blocks in program creation

## Test Coverage
- `tests/unit/import-preview.test.ts` - 38 tests (import + bulk)
- `tests/unit/program-assign-modal.test.ts` - 13 tests
- `tests/unit/coach-settings.test.ts` - 32 tests
- `tests/unit/coach-dashboard.test.ts` - 17 tests
- `tests/unit/client-coach-branding.test.ts` - 21 tests

---
*Last updated: 2026-01-05*
