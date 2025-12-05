# BAISICS v2 Implementation Plan

## Overview

This plan addresses 6 critical gaps and adds 11 feature improvements to transform BAISICS into a polished, production-ready AI fitness coach.

---

## Phase 1: Foundation (Gaps 1-3)

### Gap 1: Unified Generation Service
**Problem:** Two competing flows (`/hi` conversational, `/dashboard/new-program` wizard) with duplicated logic and broken endpoints.

**Solution:**
- Create `src/services/programGeneration/` with single entry point
- One service handles: new users, returning users, program modifications
- 1-2 AI calls max using Claude's JSON mode
- Shared types, no duplication

**Files to create/modify:**
- `src/services/programGeneration/index.ts` - Main service
- `src/services/programGeneration/prompts.ts` - Generation prompts
- `src/services/programGeneration/types.ts` - Shared types
- `src/app/api/programs/generate/route.ts` - Unified endpoint
- Delete redundant endpoints in `/api/program-creation/*`

**Acceptance criteria:**
- [ ] Single `/api/programs/generate` endpoint works for all cases
- [ ] Generation completes in <30 seconds
- [ ] Both `/hi` and `/dashboard/new-program` use same service

---

### Gap 2: Streamlined Generation (1-2 AI Calls)
**Problem:** Current approach makes 6-10 sequential AI calls, slow and fragile.

**Solution:**
- Single comprehensive prompt that returns full program JSON
- Use Claude 3.5 Sonnet with `response_format: { type: "json_object" }`
- Fallback: If response truncates, make second call for remaining phases
- Validate output with Zod schema

**Prompt structure:**
```
System: You are an expert fitness coach...
User: Generate a complete {phases}-phase program for:
{user profile JSON}

Return JSON matching this schema:
{schema}
```

**Files to create/modify:**
- `src/services/programGeneration/prompts.ts` - New unified prompt
- `src/services/programGeneration/schema.ts` - Zod validation
- `src/lib/anthropic.ts` - Add JSON mode support

**Acceptance criteria:**
- [ ] Full program generated in 1-2 API calls
- [ ] Response validated before saving
- [ ] Graceful handling of truncated responses

---

### Gap 3: Streaming Generation UI
**Problem:** Users stare at spinner for 30-60 seconds with no feedback.

**Solution:**
- Stream generation progress to client
- Show phases/workouts as they're parsed
- Use Server-Sent Events or chunked response

**UI states:**
1. "Analyzing your profile..."
2. "Designing program structure..."
3. "Creating Phase 1: Foundation..."
4. "Building Day 1 workout..."
5. "Finalizing nutrition plan..."
6. "Your program is ready!"

**Files to create/modify:**
- `src/app/api/programs/generate/route.ts` - Streaming response
- `src/components/ProgramGenerationProgress.tsx` - Progress UI
- `src/hooks/useProgramGeneration.ts` - Client-side streaming hook

**Acceptance criteria:**
- [ ] User sees progress updates during generation
- [ ] Each phase appears as it's ready
- [ ] Error states handled gracefully

---

## Phase 2: Data & UX (Gaps 4-6)

### Gap 4: Simplified Data Extraction
**Problem:** Overcomplicated confidence-score system adds complexity without benefit.

**Solution:**
- Remove confidence scores from extraction prompt
- Simple required/optional field tracking
- Ask follow-up for missing required fields only
- Store partial data, don't block on optionals

**Required fields:** sex, goals, weight, workout environment, equipment access
**Optional fields:** everything else (age, height, preferences, etc.)

**Files to create/modify:**
- `src/utils/prompts/index.ts` - Simplified extraction prompt
- `src/app/hi/actions.ts` - Remove confidence logic
- `src/types/intake.ts` - Clean intake types

**Acceptance criteria:**
- [ ] Extraction prompt is <50% current size
- [ ] No confidence scores in codebase
- [ ] Missing required fields trigger follow-up question

---

### Gap 5: Dashboard Polish
**Problem:** Dashboard (`/dashboard/[programId]`) exists with good bones but needs refinement.

**Current state (already built):**
- Activity graph (GitHub contribution style - 12 weeks)
- Weight chart (LineChart)
- Next workout CTA
- Progress photos section
- Recent activity list
- Weekly check-in status
- Daily macros display
- Program selector

**Solution - Polish existing:**
- Make "Begin Workout" more prominent (hero position)
- Add week-at-a-glance view (Mon-Sun with completion status)
- Improve empty states (first-time user guidance)
- Better mobile responsiveness
- Add quick stats summary card
- Consolidate program history view

**Files to modify:**
- `src/app/dashboard/[programId]/page.tsx` - Reorganize layout
- Add `src/components/dashboard/WeekAtAGlance.tsx`
- Improve mobile styles throughout

**Acceptance criteria:**
- [ ] "Start Workout" is immediately visible above fold
- [ ] Week view shows scheduled vs completed workouts
- [ ] Empty states guide new users
- [ ] Mobile layout is usable

---

### Gap 6: Check-In Feedback Loop
**Problem:** Check-in data stored but never used to influence programs.

**Solution:**
- Feed check-in data into generation context
- AI acknowledges progress/changes in new programs
- Suggest program modifications based on trends

**Data to incorporate:**
- Weight trend (gaining/losing/stable)
- Strength progression (lifts going up?)
- Reported issues (soreness, injuries, fatigue)
- Completion rate (skipping workouts?)

**Files to create/modify:**
- `src/services/programGeneration/context.ts` - Build generation context
- `src/app/api/programs/generation-data/route.ts` - Include check-in analysis
- `src/utils/prompts/index.ts` - Add progress context to prompts

**Acceptance criteria:**
- [ ] New programs reference recent check-in data
- [ ] AI mentions progress/changes in program description
- [ ] Injury reports influence exercise selection

---

## Phase 3: Tier 1 Improvements

### T1-1: Smart Program Continuation
**Problem:** Programs end, user starts over from scratch.

**Solution:**
- Detect when program is 75%+ complete
- Prompt: "Ready for your next phase?"
- Generate continuation that builds on progress
- Option to modify goals or continue same path

**Files to create/modify:**
- `src/services/programContinuation/index.ts`
- `src/components/ProgramCompletionPrompt.tsx`
- `src/app/api/programs/continue/route.ts`

**Acceptance criteria:**
- [ ] Users prompted when nearing program end
- [ ] Continuation generated with one click
- [ ] Progress data carried forward

---

### T1-2: Quick Workout Start
**Problem:** Dashboard has "Begin Workout" but could be faster.

**Current state:**
- Button exists in dashboard
- Requires navigation to `/workout/[id]`

**Solution:**
- Add persistent "Start Workout" FAB on mobile
- Show workout preview before starting
- Remember last position if workout was interrupted

**Files to modify:**
- `src/app/dashboard/[programId]/page.tsx` - Add mobile FAB
- `src/app/workout/[id]/page.tsx` - Add resume capability

**Acceptance criteria:**
- [ ] Mobile FAB always visible
- [ ] Interrupted workouts can be resumed
- [ ] <2 taps to start workout

---

## Phase 4: Tier 2 Improvements

### T2-1: Working Rest Timer
**Problem:** RestPeriodIndicator shows rest time but doesn't count down (implementation commented out).

**Current state:**
- Component exists at `src/app/components/RestPeriodIndicator.tsx`
- Shows "Rest: Xs" but no actual countdown
- Commented out implementation in file

**Solution:**
- Implement actual countdown timer
- Auto-start after set completion
- Audio/vibration alert when rest complete
- Skip button to proceed early

**Files to modify:**
- `src/app/components/RestPeriodIndicator.tsx` - Activate countdown
- `src/app/workout/[id]/page.tsx` - Wire up timer state

**Acceptance criteria:**
- [ ] Timer counts down after set completion
- [ ] Alert when rest period ends
- [ ] Can skip rest early
- [ ] Timer persists if user switches tabs

---

### T2-2: Progress Photos Comparison
**Problem:** Photos stored but no comparison view.

**Solution:**
- Side-by-side before/after slider
- Timeline view of all photos
- Filter by photo type (front/back/side)
- Overlay body measurements

**Files to create/modify:**
- `src/app/progress/photos/page.tsx`
- `src/components/progress/PhotoComparison.tsx`
- `src/components/progress/PhotoTimeline.tsx`

**Acceptance criteria:**
- [ ] Before/after comparison with slider
- [ ] Timeline shows progression
- [ ] Can filter by angle/type

---

### T2-3: Weekly Summary Emails
**Problem:** No re-engagement mechanism.

**Solution:**
- Weekly email digest (opt-in)
- Shows: workouts completed, progress, next week preview
- Links back to dashboard
- Configurable send day/time

**Files to create/modify:**
- `src/services/email/weeklyDigest.ts`
- `src/app/api/cron/weekly-digest/route.ts`
- `src/components/settings/EmailPreferences.tsx`
- Email template

**Acceptance criteria:**
- [ ] Weekly emails sent to opted-in users
- [ ] Contains workout completion stats
- [ ] Deep links to dashboard/workouts

---

### T2-4: Exercise Swap (AI-Powered)
**Problem:** Users can't do certain exercises, no easy alternatives.

**Solution:**
- "Can't do this?" button on each exercise
- AI suggests alternatives based on:
  - Same muscle groups
  - Available equipment
  - User limitations
- One-tap swap, persists to program

**Files to create/modify:**
- `src/app/workout/[id]/page.tsx` - Add swap button
- `src/app/api/exercises/alternatives/route.ts`
- `src/services/exerciseSwap/index.ts`

**Acceptance criteria:**
- [ ] Swap button on each exercise
- [ ] AI provides relevant alternatives
- [ ] Swaps persist to user's program

---

## Phase 5: Tier 3 Improvements

### T3-1: Social/Sharing
**Problem:** No viral/growth mechanics.

**Solution:**
- Share program summary cards (image)
- Share milestone achievements
- Public profile option (opt-in)
- OG image generation for links

**Files to create/modify:**
- `src/app/api/share/program/route.ts`
- `src/components/share/ProgramCard.tsx`
- `src/app/api/og/route.tsx` - OG image generation

**Acceptance criteria:**
- [ ] Shareable program cards
- [ ] Achievement sharing
- [ ] OG images for social previews

---

### T3-2: Coach Mode
**Problem:** Only self-service, no B2B potential.

**Solution:**
- Trainer accounts can create client programs
- Client receives program via email/link
- Trainer dashboard shows all clients
- Basic progress visibility

**Files to create/modify:**
- `src/app/coach/dashboard/page.tsx`
- `src/app/coach/clients/[id]/page.tsx`
- `src/app/api/coach/clients/route.ts`
- Database: add Coach-Client relationship

**Acceptance criteria:**
- [ ] Trainers can create programs for clients
- [ ] Client management dashboard
- [ ] Progress visibility for trainers

---

### T3-3: Template Library
**Problem:** Every program generated from scratch.

**Solution:**
- Pre-made program templates
- "Starting Strength", "PPL", "5/3/1", etc.
- Users can customize before generation
- Community-submitted templates (future)

**Files to create/modify:**
- `src/data/templates/` - Template definitions
- `src/app/templates/page.tsx`
- `src/components/templates/TemplateCard.tsx`
- `src/app/api/programs/from-template/route.ts`

**Acceptance criteria:**
- [ ] Template selection available
- [ ] Templates customizable before generation
- [ ] 5+ templates at launch

---

## Implementation Order

### Sprint 1: Core Generation (Issues 1-3)
1. Gap 1: Unified Generation Service
2. Gap 2: 1-2 AI Call Generation
3. Gap 3: Streaming UI

### Sprint 2: Data & Dashboard (Issues 4-6)
4. Gap 4: Simplified Extraction
5. Gap 5: Dashboard Polish
6. Gap 6: Check-In Feedback Loop

### Sprint 3: Core Features (Issues 7-9)
7. T1-1: Smart Program Continuation
8. T1-2: Quick Workout Start
9. T2-1: Working Rest Timer

### Sprint 4: Engagement (Issues 10-12)
10. T2-2: Progress Photos Comparison
11. T2-3: Weekly Summary Emails
12. T2-4: Exercise Swap

### Sprint 5: Growth (Issues 13-15)
13. T3-1: Social/Sharing
14. T3-2: Coach Mode
15. T3-3: Template Library

---

## Technical Decisions

### AI Model
- **Primary:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Fallback:** Claude 3 Haiku for simple tasks (swaps, alternatives)

### State Management
- Keep server-first approach (Server Components + Actions)
- Client state only where needed (forms, real-time updates)

### Database
- Continue with Prisma + PostgreSQL
- Add indexes for common queries
- Consider caching layer for program reads

### Testing
- Add integration tests for generation service
- E2E tests for critical flows (signup → generate → workout)

---

## Open Questions

1. Mobile app vs PWA for workout logging?
2. Stripe integration scope - just premium flag or full subscription management?
3. Exercise library - build from scratch or license existing database?
4. Video demos - self-host or embed from YouTube/external?

---

## Success Metrics

- Generation time: <20 seconds (from 60+)
- Completion rate: >60% of started programs
- Return rate: >40% weekly active users
- NPS: >50

