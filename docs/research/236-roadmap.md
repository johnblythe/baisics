# Psychological UX Implementation Roadmap

**Document ID:** 236-roadmap
**Purpose:** Prioritized roadmap for implementing psychological UX patterns in baisics
**Last Updated:** January 2026

---

## Table of Contents

1. [Prioritization Framework](#prioritization-framework)
2. [MVP Features (Ship First)](#mvp-features-ship-first)
3. [V2 Features (Next Iteration)](#v2-features-next-iteration)
4. [Future Features (Nice to Have)](#future-features-nice-to-have)
5. [Never Build (Doesn't Fit)](#never-build-doesnt-fit)
6. [Implementation Recommendations](#implementation-recommendations)
7. [Risk Assessment](#risk-assessment)

---

## Prioritization Framework

Each feature is evaluated on three dimensions:

| Dimension | Rating Scale | Definition |
|-----------|--------------|------------|
| **Retention Impact** | High / Medium / Low | Expected effect on user retention and engagement |
| **Implementation Effort** | S / M / L / XL | Engineering + design effort required |
| **Brand Alignment** | 5 to 1 | Fit with baisics' sophisticated, non-manipulative brand |

**Priority Formula:** High Impact + Small Effort + High Brand Alignment = Ship First

---

## MVP Features (Ship First)

These features address critical dropout points with high impact and reasonable effort.

### 1. Lifetime Milestone Badges

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | HIGH |
| **Effort** | S (Small) |
| **Brand Alignment** | 5/5 |

**What:** Track cumulative workouts (10 → 25 → 50 → 100 → 250 → 365 → 500 → 1000) with permanent badges that can never be lost.

**Why Now:**
- Progress never lost = psychologically healthier than streaks
- Addresses shame spiral on breaks (user still has their 50-badge after 6-month absence)
- Extends existing `AchievementType` enum (low lift)
- Zero manipulation risk

**Rough Scope:**
- Add milestone thresholds to achievement system
- Create badge unlock screen with celebration
- Add profile achievements display
- Generate share cards for each milestone

**Dependencies:** None (standalone)

**Risks:**
- Low: Simple extension of existing badge system

---

### 2. Rest Day Affirmation Screen

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | HIGH |
| **Effort** | S (Small) |
| **Brand Alignment** | 5/5 |

**What:** Explicit rest day handling with educational messaging ("Your muscles are growing") and optional active recovery suggestions.

**Why Now:**
- Addresses critical gap: no current rest day UX
- Prevents "rest anxiety" that breaks engagement
- Quick win—mostly copy/UI, minimal logic
- Educational approach (Noom-style) builds trust

**Rough Scope:**
- Detect rest days from program schedule
- Dashboard variant for rest days
- Educational micro-content (rotating)
- Optional "active recovery" checkbox

**Dependencies:** None (standalone)

**Risks:**
- Low: Simple conditional UI

---

### 3. First Workout Celebration

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | HIGH |
| **Effort** | S-M (Small-Medium) |
| **Brand Alignment** | 4/5 |

**What:** Special celebration screen for first workout completion with confetti, "Day One" badge, and share card.

**Why Now:**
- First workout is moment of truth (4/5 dropout risk)
- Peak-end rule: memorable ending creates positive association
- Differentiates from subsequent workouts (prevents celebration fatigue)
- Already have achievement card infrastructure

**Rough Scope:**
- Detect first workout completion
- Full-screen celebration with animation
- "Day One" badge with quote
- Share card generation
- 24h follow-up notification logic

**Dependencies:** Lifetime Milestone Badges (badge system)

**Risks:**
- Medium: Animation polish requires iteration
- Mitigation: Start simple (confetti library), iterate

---

### 4. Completion Ring + Weekly Progress

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | HIGH |
| **Effort** | M (Medium) |
| **Brand Alignment** | 5/5 |

**What:** Apple-style visual ring showing weekly workout progress (e.g., "3 of 4 workouts this week").

**Why Now:**
- Visual simplicity proven effective (Apple Activity Rings)
- Zeigarnik effect creates healthy completion drive
- Weekly framing protects rest days (not daily requirement)
- Reusable component for dashboard

**Rough Scope:**
- SVG ring component with animation
- Weekly progress calculation logic
- Day indicators (completed/scheduled/rest/today)
- Integration with dashboard

**Dependencies:** Rest Day logic (for [R] indicators)

**Risks:**
- Medium: Animation performance on mobile
- Mitigation: Use lightweight SVG, test early

---

### 5. Missed Workout Recovery Flow

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | CRITICAL |
| **Effort** | M (Medium) |
| **Brand Alignment** | 5/5 |

**What:** Dedicated screen when user returns after missed workout(s) with shame-reducing messaging and clear recovery options.

**Why Now:**
- Addresses #1 dropout cause (shame spiral → ghosting)
- Current state: silent failure, no recovery path
- High-impact intervention at critical moment
- Brand-aligned: supportive, not guilt-tripping

**Rough Scope:**
- Detect absence duration (1 day vs 3+ days)
- Recovery screen variants by absence length
- "Quick comeback workout" generator (50% reduced)
- Recovery flow state management
- "Not today" deferral option

**Dependencies:**
- Completion Ring (visual language)
- Lifetime Milestones (progress messaging)

**Risks:**
- Medium: Workout generator algorithm complexity
- Mitigation: Start with simple rule (3 compound movements, 50% sets)

---

### 6. Week 2 Check-in Intervention

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | CRITICAL |
| **Effort** | M (Medium) |
| **Brand Alignment** | 5/5 |

**What:** Proactive check-in at Week 2 (the "dropout cliff") asking how things are going with adjustment options.

**Why Now:**
- Industry data: 50%+ users quit by Week 2
- Currently no intervention at this critical moment
- Opportunity to recommit or adjust program difficulty
- Research-backed timing

**Rough Scope:**
- Detect Week 2 of program
- Check-in modal/screen
- "How's it going?" with adjustment options
- Goal reminder display
- Program difficulty adjustment flow

**Dependencies:** None (standalone)

**Risks:**
- Medium: Finding right check-in timing/tone
- Mitigation: A/B test copy variations

---

### MVP Summary Table

| # | Feature | Impact | Effort | Brand | Priority Score |
|---|---------|--------|--------|-------|----------------|
| 1 | Lifetime Milestone Badges | High | S | 5 | **10** |
| 2 | Rest Day Affirmation | High | S | 5 | **10** |
| 3 | First Workout Celebration | High | S-M | 4 | **9** |
| 4 | Completion Ring | High | M | 5 | **9** |
| 5 | Missed Workout Recovery | Critical | M | 5 | **9** |
| 6 | Week 2 Check-in | Critical | M | 5 | **9** |

**Recommended Build Order:**
```
1. Lifetime Milestone Badges (standalone, quick win)
   ↓
2. Rest Day Affirmation (standalone, quick win)
   ↓
3. First Workout Celebration (uses badge system)
   ↓
4. Completion Ring (builds visual language)
   ↓
5. Missed Workout Recovery (uses all above)
   ↓
6. Week 2 Check-in (standalone intervention)
```

---

## V2 Features (Next Iteration)

These features are valuable but require more design/engineering work or depend on MVP features.

### 7. Implementation Intentions (When Planning)

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium-High |
| **Effort** | S-M |
| **Brand Alignment** | 5/5 |

**What:** Ask users to commit to specific workout times ("When will you work out today? Morning / Lunch / Evening").

**Why V2:**
- Research-backed but requires notification infrastructure
- Best implemented with reminder system
- Can build on MVP engagement patterns

**Scope Notes:**
- Time selection during program generation
- Morning micro-commitment prompts
- Integration with notification system

---

### 8. Days 3-7 Habit Activation

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | HIGH |
| **Effort** | M-L |
| **Brand Alignment** | 4/5 |

**What:** Active engagement campaign during the critical habit formation window with daily nudges, streak prominence, and micro-commitments.

**Why V2:**
- Requires coordinated notification strategy
- Builds on MVP features (ring, milestones)
- Needs A/B testing infrastructure

**Scope Notes:**
- Day 2-7 notification sequence
- Streak badge animation activation
- Daily "Planning to workout?" prompts
- "1 Week Champion" achievement

---

### 9. Psychology Education (Micro-Lessons)

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium |
| **Effort** | M |
| **Brand Alignment** | 5/5 |

**What:** Noom-style brief educational content explaining the psychology of habit formation, rest, and motivation.

**Why V2:**
- Requires content creation investment
- Differentiator but not urgent
- Can enhance rest day and recovery screens

**Scope Notes:**
- 10-15 micro-lessons (2-3 min read)
- Topics: habit formation, rest, motivation, plateau handling
- Display during rest days, post-workout, or on-demand

---

### 10. PR (Personal Record) Celebration

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium-High |
| **Effort** | M |
| **Brand Alignment** | 5/5 |

**What:** Automatic detection and celebration of personal bests per exercise.

**Why V2:**
- Natural fit for strength training
- Requires historical data tracking
- Builds on celebration patterns from MVP

**Scope Notes:**
- Track max weight/reps per exercise
- Detect new PR on set completion
- Celebration animation + badge
- PR history timeline view

---

### 11. Before/After Progress Comparison

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | High |
| **Effort** | M |
| **Brand Alignment** | 5/5 |

**What:** Visual comparison of user's starting point vs. current stats at program completion and milestones.

**Why V2:**
- Requires accumulated data over time
- Best shown at program completion
- Natural extension of milestone system

**Scope Notes:**
- Week 1 vs current stats comparison
- Volume/weight progression charts
- Program completion summary card
- Shareable progress card

---

### 12. Kudos / Fist-Bump System

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium |
| **Effort** | M-L |
| **Brand Alignment** | 4/5 |

**What:** Simple social acknowledgment (single-tap "fist bump") for friends' completed workouts.

**Why V2:**
- Requires social graph infrastructure
- Optional social layer
- Lower priority than core retention

**Scope Notes:**
- Friend connections system
- Activity feed (opt-in)
- Single-tap reaction only (no comments)
- Notification for received kudos

---

### V2 Summary Table

| # | Feature | Impact | Effort | Brand | Priority |
|---|---------|--------|--------|-------|----------|
| 7 | Implementation Intentions | Med-High | S-M | 5 | 8 |
| 8 | Days 3-7 Habit Activation | High | M-L | 4 | 8 |
| 9 | Psychology Education | Medium | M | 5 | 7 |
| 10 | PR Celebration | Med-High | M | 5 | 8 |
| 11 | Before/After Comparison | High | M | 5 | 8 |
| 12 | Kudos System | Medium | M-L | 4 | 6 |

---

## Future Features (Nice to Have)

These features are valuable but lower priority or require significant investment.

### 13. Program Cohorts / Groups

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium-High |
| **Effort** | L (Large) |
| **Brand Alignment** | 4/5 |

**What:** Group users doing the same program at the same time for ambient accountability.

**Why Future:**
- Requires critical mass of users
- Complex social infrastructure
- Strava data: 2x retention with groups, but we need scale first

---

### 14. Accountability Partner Pairing

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | High |
| **Effort** | L |
| **Brand Alignment** | 5/5 |

**What:** 1:1 pairing with another user for mutual accountability.

**Why Future:**
- Matching algorithm complexity
- Requires user base
- Strong research backing but complex implementation

---

### 15. Monthly Challenges

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium |
| **Effort** | L |
| **Brand Alignment** | 3/5 |

**What:** Time-limited challenges with exclusive badges (e.g., "January Resolution" challenge).

**Why Future:**
- Operational overhead (creating monthly challenges)
- FOMO can feel manipulative if overdone
- Apple/Strava do this well but we need basics first

---

### 16. Surprise Micro-Rewards

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium |
| **Effort** | M |
| **Brand Alignment** | 3/5 |

**What:** Unexpected small achievements that appear randomly ("Leg Day Legend" after 5 leg days).

**Why Future:**
- Variable reward = classic addiction mechanic
- Can feel manipulative if overdone
- Use sparingly and authentically

---

### 17. Program Completion Graduation Ceremony

| Attribute | Value |
|-----------|-------|
| **Retention Impact** | Medium |
| **Effort** | M-L |
| **Brand Alignment** | 5/5 |

**What:** Full "graduation" experience when completing a program with stats summary, certificate, and next program recommendation.

**Why Future:**
- Transition moment, but users need to GET there first
- Focus on retention TO completion first
- Natural extension of milestone system

---

### Future Summary Table

| # | Feature | Impact | Effort | Brand | Priority |
|---|---------|--------|--------|-------|----------|
| 13 | Program Cohorts | Med-High | L | 4 | 5 |
| 14 | Accountability Partners | High | L | 5 | 5 |
| 15 | Monthly Challenges | Medium | L | 3 | 4 |
| 16 | Surprise Rewards | Medium | M | 3 | 4 |
| 17 | Graduation Ceremony | Medium | M-L | 5 | 5 |

---

## Never Build (Doesn't Fit)

These patterns are effective but conflict with baisics' brand values.

| Pattern | Why It Works | Why Never |
|---------|--------------|-----------|
| **Guilt-Based Notifications** | Emotional manipulation effective short-term | Damages trust, creates negative association |
| **Paid Streak Repair** | Exploits sunk-cost fallacy | Feels predatory, monetizes user distress |
| **Hearts/Lives System** | Creates scarcity and urgency | Doesn't translate to fitness, punishes beginners |
| **Aggressive Leaderboards** | Social comparison motivates some | Discouraging for beginners, encourages overtraining |
| **Performance Comparison** | Competitive drive | Beginners always "worst", triggers exercise disorders |
| **Countdown Timers** | FOMO drives action | Dishonest, associated with dark patterns |
| **Difficult Cancellation** | Friction prevents churn | Illegal in many places, destroys trust |
| **Daily Streak Requirement** | Daily habits strong | Rest is essential for fitness; creates rest anxiety |

**Brand Principle:** We use psychology TO help users, not ON users to extract value.

---

## Implementation Recommendations

### First Features to Prototype

Based on impact, effort, and learning value, we recommend starting with:

#### 1. Lifetime Milestone Badges (Prototype First)

**Rationale:**
- Lowest risk, standalone feature
- Tests badge unlock UX and celebration patterns
- Foundation for First Workout Celebration
- Quick win for user-visible improvement

**Prototype Scope:**
- Implement 10/25/50/100 milestone detection
- Create badge unlock screen
- Test celebration animation
- Deploy and measure engagement

#### 2. Rest Day Affirmation (Prototype Second)

**Rationale:**
- Addresses critical gap with minimal risk
- Tests educational content approach
- Quick to implement, high learning value
- Sets up visual language for Completion Ring

**Prototype Scope:**
- Rest day detection from program
- Dashboard variant with messaging
- 3 rotating educational snippets
- Optional active recovery checkbox

### Implementation Sequence

```
Phase 1: Foundation (2-3 features)
├── Lifetime Milestone Badges
├── Rest Day Affirmation
└── First Workout Celebration

Phase 2: Core Engagement (2-3 features)
├── Completion Ring + Weekly Progress
├── Missed Workout Recovery
└── Week 2 Check-in

Phase 3: Enhancement (V2 features)
├── Implementation Intentions
├── Days 3-7 Habit Activation
├── PR Celebration
└── Psychology Education

Phase 4: Social Layer (Future)
├── Kudos System
├── Program Cohorts
└── Accountability Partners
```

### Technical Prerequisites

| Feature | Prerequisites |
|---------|---------------|
| Milestones | `totalWorkouts` count per user |
| Rest Day | Program schedule in accessible format |
| First Workout | Workout counter, `isFirstWorkout` flag |
| Completion Ring | Weekly workout schedule calculation |
| Recovery Flow | `lastWorkoutDate`, absence detection |
| Week 2 Check-in | Program start date tracking |

### Success Metrics

| Feature | Primary Metric | Target |
|---------|----------------|--------|
| Milestones | Badge share rate | >10% of earners share |
| Rest Day | Return rate after rest days | +15% vs baseline |
| First Workout | Workout #2 completion rate | +20% vs baseline |
| Completion Ring | Weekly completion rate | +10% vs baseline |
| Recovery Flow | Return rate after absence | +25% vs baseline |
| Week 2 Check-in | Week 3 retention | +15% vs baseline |

---

## Risk Assessment

### High-Impact Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Over-gamification | Medium | High | Start minimal, add sparingly |
| Celebration fatigue | Medium | Medium | Reserve big celebrations for milestones only |
| Notification spam | Low | High | Keep notifications helpful, not guilt-based |
| Streak anxiety | Low | High | Use weekly, not daily; lifetime > consecutive |

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation performance | Medium | Medium | Test on low-end devices early |
| State management complexity | Medium | Medium | Use state machine for recovery flow |
| Notification deliverability | Low | Medium | Test on iOS/Android, handle failures gracefully |

### Brand Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Feeling "gamey" | Medium | High | Maintain sophisticated visual design |
| User manipulation perception | Low | High | Transparent messaging, education approach |
| Feature bloat | Medium | Medium | Ship minimal, iterate based on data |

---

## Summary

### Key Takeaways

1. **Focus on Critical Gaps First:** Missed workout recovery and rest day handling address the highest-risk moments
2. **Lifetime > Consecutive:** Progress that can never be lost is psychologically healthier
3. **Education > Manipulation:** Teaching psychology TO users builds trust
4. **Start Simple:** Apple's three rings beat dozens of metrics—simplicity scales
5. **Prototype Early:** Milestones and rest day screens test patterns with low risk

### Top 3 Priorities

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | **Lifetime Milestone Badges** | Zero risk, high impact, foundation for others |
| 2 | **Rest Day Affirmation** | Quick win, critical gap, brand-aligned |
| 3 | **Missed Workout Recovery** | Addresses #1 dropout cause |

### Next Steps

1. Implement Lifetime Milestone Badges
2. A/B test rest day messaging copy
3. Design missed workout recovery flow variants
4. Build Completion Ring component
5. Plan Week 2 check-in content

---

## Related Documents

- [236-design-concepts.md](./236-design-concepts.md) - Detailed wireframes for top 5 concepts
- [236-pattern-library.md](./236-pattern-library.md) - Full pattern catalog with ratings
- [236-journey-map.md](./236-journey-map.md) - User journey intervention points
- [236-psych-foundations.md](./236-psych-foundations.md) - Psychological principles research
- [236-competitor-duolingo.md](./236-competitor-duolingo.md) - Duolingo retention mechanics
- [236-competitor-strava.md](./236-competitor-strava.md) - Strava social mechanics
- [236-competitor-noom.md](./236-competitor-noom.md) - Noom psychology-first approach
- [236-competitor-apple-fitness.md](./236-competitor-apple-fitness.md) - Apple Fitness rings/awards

---

*Document created for baisics research spike #236*
