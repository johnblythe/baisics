# E2E Testing PRD: Critical User Flows

## Overview
Comprehensive Playwright E2E test suite to prevent regression on critical user experiences. Tests use seeded personas + debug states for consistent, reproducible scenarios.

---

## Test Infrastructure Setup

### Prerequisites
- [ ] Playwright installed and configured
- [ ] Test database seeding script (personas)
- [ ] Debug state URL parameter support (already exists)
- [ ] Test user authentication helper (magic link bypass for tests)

### Test Organization
```
tests/
├── e2e/
│   ├── auth/
│   │   ├── signup.spec.ts
│   │   ├── signin.spec.ts
│   │   └── signout.spec.ts
│   ├── onboarding/
│   │   ├── ai-program-generation.spec.ts
│   │   ├── claim-offer.spec.ts
│   │   └── empty-state.spec.ts
│   ├── program/
│   │   ├── import-text.spec.ts
│   │   ├── import-file.spec.ts
│   │   ├── manual-create.spec.ts
│   │   ├── program-switching.spec.ts
│   │   └── program-completion.spec.ts
│   ├── workout/
│   │   ├── start-workout.spec.ts
│   │   ├── log-exercise.spec.ts
│   │   ├── complete-workout.spec.ts
│   │   ├── exercise-swap.spec.ts
│   │   └── rest-timer.spec.ts
│   ├── dashboard/
│   │   ├── main-dashboard.spec.ts
│   │   ├── rest-day.spec.ts
│   │   ├── recovery-screens.spec.ts
│   │   ├── milestones.spec.ts
│   │   └── week2-checkin.spec.ts
│   ├── settings/
│   │   └── user-settings.spec.ts
│   ├── payment/
│   │   ├── upgrade-flow.spec.ts
│   │   └── free-tier-limits.spec.ts
│   └── coach/
│       ├── coach-signup.spec.ts
│       ├── client-invite.spec.ts
│       └── bulk-import.spec.ts
└── fixtures/
    ├── personas.ts
    └── auth.ts
```

---

## FLOW 1: Authentication

### 1.1 Magic Link Signup (New User)
**Persona:** None (new user)
**Entry:** `/auth/signin`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/auth/signin` | Sign-in form displayed |
| 2 | Enter new email `test-{uuid}@test.baisics.app` | Email field accepts input |
| 3 | Click "Continue with Email" | Loading state, then verify page |
| 4 | (Dev) Extract magic link from verify page | Link displayed for dev env |
| 5 | Navigate to magic link | User authenticated |
| 6 | Verify redirect to `/hi` (no programs) | Onboarding page shown |

**Edge Cases:**
- Invalid email format → error message
- Empty email → validation error

### 1.2 Magic Link Sign In (Returning User)
**Persona:** `marcus@test.baisics.app` (has programs)
**Entry:** `/auth/signin`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/auth/signin` | Sign-in form displayed |
| 2 | Enter `marcus@test.baisics.app` | Email accepted |
| 3 | Complete magic link flow | User authenticated |
| 4 | Verify redirect to `/dashboard` | Dashboard with program shown |

### 1.3 Sign Out
**Persona:** Any authenticated
**Entry:** Settings or header menu

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click sign out button | Session destroyed |
| 2 | Verify redirect to landing page | Landing page shown |
| 3 | Navigate to `/dashboard` | Redirects to `/auth/signin` |

### 1.4 Protected Route Access
**Persona:** None (unauthenticated)

| Route | Expected |
|-------|----------|
| `/dashboard` | Redirect to `/auth/signin?callbackUrl=/dashboard` |
| `/workout/123` | Redirect to `/auth/signin` |
| `/check-in` | Redirect to `/auth/signin` |
| `/settings` | Redirect to `/auth/signin` |

---

## FLOW 2: Onboarding

### 2.1 AI Program Generation (First-Time User)
**Persona:** `alex@test.baisics.app` (fresh, 0 workouts)
**Debug State:** `first_workout`
**Entry:** `/hi`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as alex | Redirects to `/hi` |
| 2 | Start conversational intake | Questions appear one by one |
| 3 | Answer: goals, experience, equipment, schedule | Each answer processed |
| 4 | Submit final response | Loading state, AI processes |
| 5 | Preview generated program | Program name, workout count shown |
| 6 | Confirm/save program | Redirects to `/dashboard/{programId}` |
| 7 | Verify program exists | Dashboard shows program details |

**Edge Cases:**
- AI timeout → retry option
- Empty responses → validation prompt
- API error → user-friendly error message

### 2.2 Claim Offer Flow
**Persona:** `alex@test.baisics.app`
**Entry:** `/dashboard?claim={validToken}`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate with claim token | Token validated |
| 2 | Wait for auto-assignment | Template matched and cloned |
| 3 | Verify welcome banner | "Welcome! Your program is ready" |
| 4 | Verify program exists | Dashboard shows assigned program |

**Edge Cases:**
- Expired token → error message, redirect to `/hi`
- Already-used token → error message
- Free user with program → upgrade prompt

### 2.3 Empty State Dashboard
**Persona:** New user (no programs)
**Entry:** `/dashboard`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login (no programs) | Empty state UI shown |
| 2 | Verify 3 CTAs visible | "Create with AI", "Browse Templates", "Import your own" |
| 3 | Click "Create with AI" | Navigates to `/hi` |
| 4 | Go back, click "Browse Templates" | Navigates to `/templates` |
| 5 | Go back, click "Import your own" | Navigates to `/create` |

---

## FLOW 3: Program Creation

### 3.1 Import from Text
**Persona:** `jordan@test.baisics.app`
**Entry:** `/create`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/create` | Import page shown |
| 2 | Select "Text" input mode | Text area visible |
| 3 | Paste workout text | Text accepted |
| 4 | Click "Parse" | Loading state, AI processes |
| 5 | Preview parsed program | Exercises listed with sets/reps |
| 6 | Edit exercise if needed | Edits saved |
| 7 | Click "Save Program" | Program saved |
| 8 | Verify redirect to dashboard | New program active |

**Test Input:**
```
Week 1 - Day 1: Push
Bench Press - 4x8
Overhead Press - 3x10
Tricep Dips - 3x12
```

### 3.2 Import from File (PDF/DOCX)
**Persona:** `jordan@test.baisics.app`
**Entry:** `/create`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Select "File" upload mode | File dropzone visible |
| 2 | Upload test PDF/DOCX | File accepted, uploading state |
| 3 | Wait for processing | Processing state, then preview |
| 4 | Preview extracted program | Workouts/exercises shown |
| 5 | Save program | Redirects to dashboard |

**Edge Cases:**
- Parsing error (status 422) → "Could not parse" error
- Empty file → error message
- Large file → graceful handling

### 3.3 Manual Program Builder
**Persona:** `marcus@test.baisics.app` (paid)
**Entry:** `/program/create`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/program/create` | Builder interface shown |
| 2 | Add program name | Name saved |
| 3 | Add workout (Day 1) | Workout created |
| 4 | Add exercises | Exercises listed |
| 5 | Configure sets/reps | Values saved |
| 6 | Save program | Redirects to program |

### 3.4 Program Switching
**Persona:** `maya@test.baisics.app` (2 programs)
**Entry:** Dashboard

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as maya | Dashboard shows current program |
| 2 | Open program selector | Dropdown shows 2 programs |
| 3 | Select other program | Dashboard updates |
| 4 | Verify URL changes | `/dashboard/{newProgramId}` |

---

## FLOW 4: Workout Execution

### 4.1 Start Workout
**Persona:** `marcus@test.baisics.app`
**Entry:** `/workout/{id}`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to workout page | Workout details loaded |
| 2 | Verify exercises listed | All exercises visible |
| 3 | Verify exercise history | PR, last session shown |
| 4 | Click "Start Workout" | Workout mode activated |
| 5 | Verify first exercise active | BigSetInputCard ready |

### 4.2 Log Exercise Sets
**Persona:** `marcus@test.baisics.app` (meticulous)
**Entry:** Active workout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click Set 1 | BigSetInputCard opens |
| 2 | Enter weight (185 lbs) | Weight accepted |
| 3 | Enter reps (8) | Reps accepted |
| 4 | Add note (optional) | Note saved |
| 5 | Mark set complete | Set logged, card updates |
| 6 | Verify rest timer starts | Timer counting down |
| 7 | Complete all sets | Exercise marked done |
| 8 | Navigate to next exercise | Next exercise active |

### 4.3 Skip/Minimal Logging
**Persona:** `chris@test.baisics.app` (skipper)
**Entry:** Active workout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start workout | Workout active |
| 2 | Skip accessory exercise | Exercise skipped |
| 3 | Log only compounds | Partial workout logged |
| 4 | Complete workout | Workout saved with partial data |

### 4.4 Exercise Swap
**Persona:** `kim@test.baisics.app` (injury, swaps OHP)
**Entry:** Active workout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Find Overhead Press exercise | Exercise listed |
| 2 | Click swap button | ExerciseSwapModal opens |
| 3 | Search "incline press" | Results shown |
| 4 | Select substitute | Exercise swapped |
| 5 | Verify swap persists | New exercise in workout |

### 4.5 Complete Workout
**Persona:** `marcus@test.baisics.app`
**Entry:** Active workout (all sets logged)

| Step | Action | Expected |
|------|--------|----------|
| 1 | All exercises logged | Progress at 100% |
| 2 | Click "Finish Workout" | Completion API called |
| 3 | Verify success response | Stats shown |
| 4 | Check streak updated | Streak incremented |
| 5 | Redirect to dashboard | Dashboard updated |

### 4.6 First Workout Celebration
**Persona:** `alex@test.baisics.app`
**Debug State:** `first_workout_complete`
**Entry:** Complete first workout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete workout | API returns firstWorkout flag |
| 2 | Celebration modal appears | Confetti, message |
| 3 | Dismiss modal | Dashboard shown |

### 4.7 Rest Timer
**Persona:** `marcus@test.baisics.app`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete a set | Rest timer auto-starts |
| 2 | Timer counts down | Visual countdown |
| 3 | Timer completes | Notification/sound |
| 4 | Can dismiss early | Timer stops |

---

## FLOW 5: Dashboard States

### 5.1 Main Dashboard
**Persona:** `marcus@test.baisics.app` (cruising)
**Entry:** `/dashboard/{programId}`

| Component | Verification |
|-----------|-------------|
| Program header | Name, start date visible |
| Workout selector | Can select workout |
| Day indicators | Completion rings accurate |
| Stats section | Workout count, streak shown |
| Activity feed | Recent workouts listed |
| Charts | Weight/progress charts render |

### 5.2 Rest Day Dashboard
**Persona:** `priya@test.baisics.app`
**Debug State:** `rest_day`
**Entry:** `/dashboard?debug_state=rest_day`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set debug state | Rest day UI shown |
| 2 | Verify rest messaging | "Rest day" message |
| 3 | Verify no workout CTA | No "Start Workout" button |

### 5.3 Recovery Screen (1-Day Miss)
**Persona:** `sarah@test.baisics.app` (sporadic)
**Debug State:** `missed_1_day`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set debug state | Recovery UI variant 1 |
| 2 | Verify gentle messaging | "Welcome back" tone |
| 3 | Resume CTA visible | "Get back on track" button |

### 5.4 Recovery Screen (3-Day Miss)
**Persona:** `taylor@test.baisics.app` (lapsed)
**Debug State:** `missed_3_days`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set debug state | Recovery UI variant 2 |
| 2 | Verify supportive messaging | "We've all been there" |
| 3 | Scaled re-entry option | Lighter workout suggested |

### 5.5 Recovery Screen (7+ Days)
**Persona:** `taylor@test.baisics.app`
**Debug State:** `missed_7_days`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set debug state | Extended absence UI |
| 2 | Verify no-judgment tone | "Life happens" messaging |
| 3 | Reset/restart options | Can reset program or continue |

### 5.6 Week 2 Check-In
**Persona:** `jordan@test.baisics.app` (week2)
**Debug State:** `week_2_checkin`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set debug state | Modal auto-triggers |
| 2 | Check-in form visible | Feedback questions |
| 3 | Submit feedback | Modal closes, data saved |

### 5.7 Milestones
**Persona:** `derek@test.baisics.app` (veteran)
**Debug States:** `milestone_10`, `milestone_25`, `milestone_50`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set milestone debug state | Milestone celebration shown |
| 2 | Verify badge/achievement | Visual milestone indicator |
| 3 | Share option available | Can share achievement |

### 5.8 Program Completion
**Persona:** `derek@test.baisics.app`
**Debug State:** `program_complete`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set debug state | Completion celebration |
| 2 | Stats displayed | Total volume, workouts, etc. |
| 3 | Next steps shown | Clone program, browse templates |

---

## FLOW 6: Settings

### 6.1 User Settings
**Persona:** `marcus@test.baisics.app`
**Entry:** `/settings`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to settings | Settings page loads |
| 2 | Verify email displayed | Correct email shown |
| 3 | Verify subscription status | "Premium" badge |
| 4 | Toggle email reminders | Setting saved |
| 5 | Toggle weekly summary | Setting saved |
| 6 | Change summary day | Day selection saves |
| 7 | Reload page | Settings persisted |

---

## FLOW 7: Payment & Tiers

### 7.1 Free Tier Restrictions
**Persona:** `sarah@test.baisics.app` (free)
**Entry:** Dashboard

| Step | Action | Expected |
|------|--------|----------|
| 1 | Verify free badge | "Free" tier shown |
| 2 | Try to create 2nd program | Upgrade prompt shown |
| 3 | Verify 🔒 on premium features | Visual lock indicators |
| 4 | Upgrade CTA visible | "Upgrade" button present |

### 7.2 Upgrade Flow (Stripe)
**Persona:** `sarah@test.baisics.app`
**Entry:** Upgrade button

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click upgrade | Checkout session created |
| 2 | Redirect to Stripe | Stripe hosted page |
| 3 | (Test mode) Complete payment | Success callback |
| 4 | Redirect to `/purchase/success` | Session validated |
| 5 | Verify premium status | User isPremium=true |
| 6 | Dashboard shows premium | Premium badge, features unlocked |

### 7.3 Billing Portal
**Persona:** `marcus@test.baisics.app` (paid)
**Entry:** Settings

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Manage Billing" | Portal session created |
| 2 | Redirect to Stripe portal | Can manage subscription |
| 3 | Return to app | Back to settings |

---

## FLOW 8: Coach Features

### 8.1 Coach Signup
**Entry:** `/coaches/signup`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Fill name, email | Fields accepted |
| 2 | Select coach type | Type saved |
| 3 | Submit form | Magic link sent |
| 4 | Complete auth | User created with isCoach=true |
| 5 | Redirect to coach dashboard | Coach UI shown |
| 6 | Onboarding modal shown | coachOnboardedAt=null |

### 8.2 Client Invitation
**Persona:** Coach user
**Entry:** Coach dashboard

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Invite Client" | Invite form shown |
| 2 | Enter client email | Email accepted |
| 3 | Send invite | Invite token created, email sent |
| 4 | Client clicks invite link | Redirects to signin if needed |
| 5 | Client accepts invite | Client linked to coach |
| 6 | Verify in coach dashboard | Client appears in list |

### 8.3 Coach Bulk Import
**Persona:** Coach user (paid tier)
**Entry:** `/create`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Toggle "Bulk Import Mode" | Multi-file upload shown |
| 2 | Upload multiple files (≤20) | Files queued |
| 3 | Process all files | Parallel processing |
| 4 | Preview all programs | List of parsed programs |
| 5 | Save all | Saved as templates |
| 6 | Redirect to `/program/templates` | Templates listed |

---

## Persona-to-Flow Mapping

| Persona | Primary Test Flows |
|---------|-------------------|
| `alex@test.baisics.app` | Auth signup, AI onboarding, first workout, empty states |
| `sarah@test.baisics.app` | Free tier limits, sporadic recovery, upgrade flow |
| `jordan@test.baisics.app` | Week 2 check-in, minimal logging, program import |
| `chris@test.baisics.app` | Skipper behavior, time-crunched workouts |
| `kim@test.baisics.app` | Exercise swap, injury-aware modifications |
| `taylor@test.baisics.app` | Lapsed recovery (7 days), re-engagement |
| `robert@test.baisics.app` | Meticulous logging, steady progress |
| `marcus@test.baisics.app` | Full workout logging, paid features, settings |
| `priya@test.baisics.app` | Streak tracking, rest day, milestone celebrations |
| `derek@test.baisics.app` | Program completion, milestones, veteran flow |
| `maya@test.baisics.app` | Multi-program switching, returning user |

---

## Debug State Coverage Matrix

| Debug State | Persona | Flow |
|-------------|---------|------|
| `normal` | Any | Baseline verification |
| `first_workout` | alex | Fresh user onboarding |
| `first_workout_complete` | alex | First completion celebration |
| `rest_day` | priya | Rest day dashboard |
| `missed_1_day` | sarah | Recovery variant 1 |
| `missed_3_days` | taylor | Recovery variant 2 |
| `missed_7_days` | taylor | Extended absence |
| `week_2_checkin` | jordan | Check-in modal trigger |
| `milestone_10` | marcus | 10th workout milestone |
| `milestone_25` | priya | 25th workout milestone |
| `milestone_50` | derek | 50th workout milestone |
| `program_complete` | derek | Completion celebration |
| `program_almost_done` | derek | 95% through UI |

---

## Implementation Priority

### P0 - Critical (Must Have)
1. Auth flows (signup, signin, signout, protected routes)
2. AI program generation
3. Start workout → log sets → complete workout
4. Dashboard loads correctly
5. Free tier restrictions work

### P1 - High (Should Have)
6. Program import (text only - file import deferred)
7. Exercise swap
8. Recovery screens (all variants)
9. Milestones and celebrations
10. Settings persistence

### P2 - Medium (Nice to Have)
11. Coach signup and client invite
12. Workout share
13. Rest timer accuracy
14. Check-in flow

### P3 - Low (Future / Deferred)
15. File upload tests (PDF/DOCX parsing)
16. Stripe/billing portal integration
17. Coach bulk import
18. Coach program assignment
19. All edge cases / error states

---

## Technical Decisions

### Magic Link Authentication
**Decision:** Extract clickable link from dev verify page
- Dev mode already sets cookies `baisics.__dev_magic_link` and `baisics.__dev_magic_email` in `src/lib/auth.ts:64-77`
- Verify page at `src/app/auth/verify-request/page.tsx` displays clickable link
- Playwright clicks the "Click here to sign in →" link directly

### AI Response Handling
**Decision:** Hybrid approach - mock by default, real AI optional
- **Default (CI/quick runs):** Mock AI responses with canned program structure
  - Fast (~100ms vs ~10s)
  - Deterministic, no flakiness
  - Free, no rate limits
- **Optional flag:** `REAL_AI=true` for full integration runs
  - Weekly or pre-release verification
  - Catches prompt/integration regressions
- Tests still click through entire UI - only AI wait is mocked

### Database Reset Strategy
**Decision:** Full persona reseed per test FILE
- `beforeAll(() => seedPersonas())` at file level
- ~5s overhead per file is acceptable
- Each file assumes clean persona state
- Tests within same file can share state (sequential order)

### Environment
**Decision:** Local only initially
- No separate CI database for now
- Tests run against local dev database
- Can add CI pipeline later when stable

### Deferred (Not In Scope)
- Stripe payment testing (not actively used)
- File upload tests (PDF/DOCX parsing) - future improvement
- Billing portal integration
