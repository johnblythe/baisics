# Coach Tier Roadmap

## Priority Order
1. ~~#206 - Assignment UI~~ ✅
2. #207 - Program Import Tool (partial)
3. #204 - Stripe Coach Tier Config
4. #200 - Subscription + Limits
5. #201 - Analytics + Onboarding Polish

## Completed
- [x] #158 - Coach Tier: B2B2C Model (core infra)
- [x] #190 - Manual Program Builder v2
- [x] #198 - Public invite links
- [x] #199 - Check-ins + Activity Alerts
- [x] #209 - Share page v2a redesign (PR #211)
- [x] #210 - Coach dashboard polish + settings + branding (PR #211)
- [x] #206 - Coach Assignment UI (2026-01-05)

## In Progress / Partial

### #207 - Program Import Tool
**Done:**
- Basic import flow exists
- AI parsing for PDF/docs
- [x] Polish preview/edit UI (editable exercises, sets, reps, rest)
- [x] Add/delete/reorder exercises
- [x] Public landing page (`/tools/import-program` → `/import`)

**TODO:**
- [ ] Bulk import for coaches

## Not Started

### #204 - Stripe Coach Tier Config
- Configure Stripe products/prices for coach subscription
- Webhook handling for subscription events

### #200 - Coach Subscription + Limits
- Enforce client limits by tier
- Upgrade prompts when hitting limits
- Billing portal integration

### #201 - Analytics + Onboarding
- Coach analytics dashboard (client progress, engagement)
- First-time coach onboarding flow

## Tech Debt (#192)
- Nutrition modal placeholders should match prescribed macros
- Unsanitized exercise name in coaching query
- Overly broad catch blocks in program creation

---
*Last updated: 2026-01-05*
