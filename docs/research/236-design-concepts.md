# Top 5 Design Concepts with Wireframes

**Document ID:** 236-design-concepts
**Purpose:** Concrete design proposals for highest-impact psychological patterns
**Last Updated:** January 2026

---

## Selection Criteria

Patterns selected based on three factors:
1. **Impact** - High retention/engagement effect
2. **Feasibility** - Can implement within reasonable scope
3. **Brand Fit** - Aligns with baisics' sophisticated, non-manipulative approach

### Patterns Selected

| # | Pattern | Why Selected |
|---|---------|--------------|
| 1 | **Completion Ring + Weekly Progress** | Visual simplicity (Apple-proven), high brand fit, addresses Days 3-7 |
| 2 | **First Workout Celebration** | Critical moment, peak-end rule, builds habit foundation |
| 3 | **Missed Workout Recovery Flow** | Addresses #1 dropout cause (shame spiral), critical gap |
| 4 | **Rest Day Affirmation Screen** | Quick win, addresses "rest anxiety", streak protection |
| 5 | **Lifetime Milestone Badges** | Progress never lost, psychologically healthier than streaks |

---

## Concept 1: Completion Ring + Weekly Progress Arc

### Pattern Details
- **Pattern Name:** Completion Ring / Progress Arc (Pattern #13 from library)
- **Psychological Principle:** Zeigarnik effect (incomplete tasks create tension), visual simplicity
- **Tasteful Rating:** 5/5 | **Manipulation Risk:** 2/5

### Where It Appears
- **Primary:** Dashboard/home screen (always visible)
- **Secondary:** Workout completion screen
- **Tertiary:** Weekly summary notification

### ASCII Wireframe (Mobile)

```
┌─────────────────────────────────────────┐
│  ☰  baisics              Mon, Jan 15    │
├─────────────────────────────────────────┤
│                                         │
│           ╭────────────────╮            │
│          ╱    ╭──────╮      ╲           │
│         │    ╱        ╲      │          │
│         │   │  WEEK 3  │     │          │
│         │   │  ███░░░  │     │          │
│         │   │  2 of 4  │     │          │
│         │    ╲        ╱      │          │
│          ╲    ╰──────╯      ╱           │
│           ╰────────────────╯            │
│                                         │
│   Mon   Tue   Wed   Thu   Fri   Sat   Sun
│   [✓]   [ ]   [✓]   [ ]   [→]   [R]   [R]
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  TODAY'S WORKOUT                    ││
│  │  ─────────────────────              ││
│  │  Upper Body Strength • 45 min       ││
│  │  5 exercises • 15 sets              ││
│  │                                     ││
│  │  [Start Workout →]                  ││
│  └─────────────────────────────────────┘│
│                                         │
│  Next workout: Friday (Legs & Core)     │
│                                         │
└─────────────────────────────────────────┘

LEGEND:
  [✓] = Completed workout
  [→] = Today (scheduled)
  [R] = Rest day (protected)
  [ ] = Scheduled but missed
```

### Desktop Variant (Split View)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  ☰  baisics                                           Mon, Jan 15 • Week 3    │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────┐     ┌──────────────────────────────────────────┐│
│   │                         │     │                                          ││
│   │     ╭────────────╮      │     │  TODAY: Upper Body Strength              ││
│   │    ╱   WEEK 3     ╲     │     │  ─────────────────────────────────       ││
│   │   │    ██░░░       │    │     │                                          ││
│   │   │    2 of 4      │    │     │  ┌─────────┐ ┌─────────┐ ┌─────────┐     ││
│   │    ╲              ╱     │     │  │Bench    │ │Rows     │ │Shoulder │     ││
│   │     ╰────────────╯      │     │  │Press    │ │         │ │Press    │     ││
│   │                         │     │  │3×8      │ │3×10     │ │3×10     │     ││
│   │  Mon Tue Wed Thu Fri Sat│     │  └─────────┘ └─────────┘ └─────────┘     ││
│   │  [✓] [ ] [✓] [ ] [→] [R]│     │                                          ││
│   │                         │     │  ┌─────────┐ ┌─────────┐                 ││
│   │  Program: 38% complete  │     │  │Curls    │ │Tricep   │                 ││
│   │  ████████░░░░░░░░░░░░   │     │  │         │ │Ext.     │                 ││
│   │                         │     │  │3×12     │ │3×12     │                 ││
│   │                         │     │  └─────────┘ └─────────┘                 ││
│   │                         │     │                                          ││
│   │                         │     │           [Start Workout →]              ││
│   │                         │     │                                          ││
│   └─────────────────────────┘     └──────────────────────────────────────────┘│
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Copy/Messaging Examples

| State | Message |
|-------|---------|
| 0 of 4 workouts | "Fresh week. Let's go." |
| 1 of 4 workouts | "Off to a good start." |
| 2 of 4 workouts | "Halfway there. Keep it up." |
| 3 of 4 workouts | "One more to close the ring." |
| 4 of 4 workouts | "Week complete. Nice work." |
| Rest day | "Rest day. Your muscles are growing." |

### Implementation Notes

1. **Ring Component:**
   - Use SVG or Canvas for smooth animation
   - Animate fill on completion
   - Navy stroke (#0F172A), coral fill (#FF6B6B)

2. **Data Required:**
   - `weeklyWorkoutsCompleted` (count)
   - `weeklyWorkoutsScheduled` (count from program)
   - `workoutDays` array with status per day

3. **Mobile-First:**
   - Ring takes ~40% of viewport above the fold
   - Day indicators are touch targets (48px min)
   - "Start Workout" is primary CTA

4. **Accessibility:**
   - Screen reader: "2 of 4 workouts completed this week"
   - Color not sole indicator (checkmarks + fill)

---

## Concept 2: First Workout Celebration

### Pattern Details
- **Pattern Name:** Completion Celebrations + First-Time Achievement (Patterns #16 + #5)
- **Psychological Principle:** Immediate dopamine release, positive reinforcement, identity formation
- **Tasteful Rating:** 4/5 (sophistication dependent on execution) | **Manipulation Risk:** 1/5

### Where It Appears
- **Primary:** Workout completion screen (first workout only)
- **Secondary:** Home screen badge display
- **Tertiary:** Share card generation

### ASCII Wireframe: Completion Screen (Mobile)

```
┌─────────────────────────────────────────┐
│                                         │
│           * * *   * * *                 │
│        *         *     *                │
│      *    🎉              *             │
│     *                      *            │
│    *                        *           │
│                                         │
│        ╔═══════════════════╗            │
│        ║  FIRST WORKOUT    ║            │
│        ║    COMPLETE!      ║            │
│        ╚═══════════════════╝            │
│                                         │
│    You're officially a baisics athlete. │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │  🏆 Badge Earned                │  │
│    │  ─────────────────────────      │  │
│    │                                 │  │
│    │     ╭───────────────╮           │  │
│    │     │   ★           │           │  │
│    │     │  DAY          │           │  │
│    │     │  ONE          │           │  │
│    │     │               │           │  │
│    │     ╰───────────────╯           │  │
│    │                                 │  │
│    │  "The first rep is the         │  │
│    │   hardest one to take."        │  │
│    │                                 │  │
│    └─────────────────────────────────┘  │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │  What you accomplished:         │  │
│    │  • 15 sets completed            │  │
│    │  • ~3,200 lbs total volume      │  │
│    │  • First step of your journey   │  │
│    └─────────────────────────────────┘  │
│                                         │
│         [Share Achievement]             │
│                                         │
│         [Continue to Home →]            │
│                                         │
└─────────────────────────────────────────┘
```

### Share Card Design (for social)

```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓                                     ▓ │
│ ▓   ★ DAY ONE                         ▓ │
│ ▓   ─────────                         ▓ │
│ ▓                                     ▓ │
│ ▓   Just completed my first           ▓ │
│ ▓   workout on @baisicsapp            ▓ │
│ ▓                                     ▓ │
│ ▓   15 sets • 3,200 lbs volume        ▓ │
│ ▓                                     ▓ │
│ ▓   baisics.app                       ▓ │
│ ▓                                     ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────┘

Colors: Navy background (#0F172A)
        Coral accent (#FF6B6B)
        White text
```

### Animation Sequence

```
Timeline: 0ms ─────────────────────────────────────── 3000ms

0ms:    Screen transitions in
100ms:  Confetti particles begin falling (tasteful, not overwhelming)
400ms:  "FIRST WORKOUT COMPLETE!" text scales in
700ms:  Badge fades in with subtle glow
1200ms: Stats count up (0 → 15 sets, 0 → 3,200 lbs)
2000ms: Confetti slows
2500ms: Buttons fade in
3000ms: Animation complete, static state
```

### Copy/Messaging Examples

| Element | Copy |
|---------|------|
| Headline | "First Workout Complete!" |
| Subhead | "You're officially a baisics athlete." |
| Badge Quote | "The first rep is the hardest one to take." |
| Stats Label | "What you accomplished:" |
| CTA Primary | "Share Achievement" |
| CTA Secondary | "Continue to Home" |

### Implementation Notes

1. **Animation Library:**
   - Use Framer Motion or CSS keyframes
   - Confetti: canvas-confetti library (lightweight)
   - Keep it tasteful—2-3 seconds max, then static

2. **Badge System:**
   - Reuse existing `AchievementType.first_workout`
   - Badge design: geometric, minimal, brand-colored
   - Store in user achievements table

3. **Mobile-First:**
   - Full-screen takeover (immersive celebration)
   - Swipe or tap to dismiss
   - Auto-advance after 5s if no interaction

4. **Differentiation:**
   - First workout gets special treatment
   - Subsequent completions: shorter celebration, no confetti
   - Prevents celebration fatigue

5. **Follow-up:**
   - Schedule notification 24h later: "Ready for workout #2?"
   - Not guilt-based—framed as excitement

---

## Concept 3: Missed Workout Recovery Flow

### Pattern Details
- **Pattern Name:** Shame Reduction + Recovery Path (derived from Duolingo Streak Freeze + Noom reframing)
- **Psychological Principle:** Loss aversion management, shame reduction, clear recovery
- **Tasteful Rating:** 5/5 | **Manipulation Risk:** 1/5

### Where It Appears
- **Primary:** Home screen when user returns after missed workout(s)
- **Secondary:** Notification attempting re-engagement
- **Tertiary:** Ongoing weekly progress indicator

### Trigger Conditions

```
IF (scheduledWorkout yesterday AND !completedWorkout yesterday)
   AND (userReturns today)
THEN show MissedWorkoutRecovery screen

OR

IF (daysSinceLastWorkout >= 3)
   AND (userReturns)
THEN show LongerAbsenceRecovery variant
```

### ASCII Wireframe: 1-Day Miss (Mobile)

```
┌─────────────────────────────────────────┐
│  ☰  baisics              Wed, Jan 15    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │   👋 Welcome back                   ││
│  │   ───────────────                   ││
│  │                                     ││
│  │   Life happens. Missing one         ││
│  │   workout doesn't erase progress.   ││
│  │                                     ││
│  │   ┌───────────────────────────────┐ ││
│  │   │  Your progress is safe:       │ ││
│  │   │                               │ ││
│  │   │  ✓ 12 total workouts          │ ││
│  │   │  ✓ Week 4 of your program     │ ││
│  │   │  ✓ 18,000 lbs lifted          │ ││
│  │   └───────────────────────────────┘ ││
│  │                                     ││
│  │   This week: [✓] [✓] [ ] [→]       ││
│  │              Mon  Tue Wed  Thu      ││
│  │              2 of 4 workouts        ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  Ready to continue?                     │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  [📋 Today's Workout]               ││
│  │  Upper Body • 45 min                ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  [⚡ Quick Session]                 ││
│  │  3 exercises • 20 min               ││
│  │  Get back in the groove             ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Not today - remind me tomorrow]       │
│                                         │
└─────────────────────────────────────────┘
```

### ASCII Wireframe: 3+ Day Absence (Mobile)

```
┌─────────────────────────────────────────┐
│  ☰  baisics              Mon, Jan 20    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │   👋 Hey, it's been a few days     ││
│  │   ───────────────────────────────   ││
│  │                                     ││
│  │   No judgment. Life gets busy.      ││
│  │   The important thing is you're     ││
│  │   here now.                         ││
│  │                                     ││
│  │   ┌───────────────────────────────┐ ││
│  │   │  Your lifetime progress:      │ ││
│  │   │                               │ ││
│  │   │     12                        │ ││
│  │   │   workouts                    │ ││
│  │   │   completed                   │ ││
│  │   │                               │ ││
│  │   │   That's 12 more than most    │ ││
│  │   │   people who never started.   │ ││
│  │   └───────────────────────────────┘ ││
│  │                                     ││
│  │   Want to adjust your program?      ││
│  │   [Make it easier] [Keep as is]     ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  [🔥 Comeback Workout]              ││
│  │  3 exercises • 15 min               ││
│  │  Low pressure, high reward          ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  [📋 Resume Full Program]           ││
│  │  Pick up where you left off         ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Take a break - I'll come back later]  │
│                                         │
└─────────────────────────────────────────┘
```

### Copy/Messaging Examples

| Absence Length | Tone | Headline | Key Message |
|----------------|------|----------|-------------|
| 1 day | Light | "Welcome back" | "Life happens. Missing one workout doesn't erase progress." |
| 2-3 days | Supportive | "Hey, it's been a few days" | "No judgment. Life gets busy." |
| 4-7 days | Warm | "We missed you" | "Your progress is still here waiting for you." |
| 8+ days | Encouraging | "Ready to restart?" | "Every expert was once a beginner. Every beginner can become a finisher." |

### Quick Comeback Workout Design

For users returning after absence, offer a reduced workout:

```
Regular Workout → Comeback Workout
───────────────────────────────────
5 exercises     → 3 exercises
15 sets         → 8 sets
45 min          → 15-20 min
Full intensity  → 70% weights
```

**Psychology:** Lower barrier to re-entry. Once they complete the comeback workout, momentum returns.

### Implementation Notes

1. **Detection Logic:**
   - Track `lastWorkoutDate` per user
   - Calculate `daysSinceLastWorkout` on session start
   - Store `scheduledWorkoutDays` from program

2. **Screen Priority:**
   - Recovery screen shows BEFORE home screen on return
   - Can be dismissed; appears once per absence period
   - Don't show if user returns on a rest day

3. **Mobile-First:**
   - Full-screen interstitial (important moment)
   - Options are large tap targets
   - "Not today" option always available (autonomy)

4. **Comeback Workout Generator:**
   - Algorithmically select 3 compound movements
   - Reduce sets by ~50%
   - Suggest 70% of last-used weights
   - Mark as "comeback" in logs (for analytics)

5. **Analytics:**
   - Track: recovery screen shown → option selected → workout completed
   - A/B test copy variations
   - Measure return rate after recovery flow vs. silent return

---

## Concept 4: Rest Day Affirmation Screen

### Pattern Details
- **Pattern Name:** Rest Day Reframing + Streak Protection (derived from Apple + Noom)
- **Psychological Principle:** Psychological safety, education, autonomy support
- **Tasteful Rating:** 5/5 | **Manipulation Risk:** 1/5

### Where It Appears
- **Primary:** Home screen on scheduled rest days
- **Secondary:** Weekly progress indicator (rest days marked specially)
- **Tertiary:** Evening check-in notification

### ASCII Wireframe: Rest Day Home (Mobile)

```
┌─────────────────────────────────────────┐
│  ☰  baisics              Thu, Jan 16    │
├─────────────────────────────────────────┤
│                                         │
│           ╭────────────────╮            │
│          ╱    ╭──────╮      ╲           │
│         │    ╱   R    ╲      │          │
│         │   │  REST    │     │          │
│         │   │   DAY    │     │          │
│         │    ╲        ╱      │          │
│          ╲    ╰──────╯      ╱           │
│           ╰────────────────╯            │
│                                         │
│   Mon   Tue   Wed   Thu   Fri   Sat   Sun
│   [✓]   [✓]   [✓]   [R]   [→]   [R]   [R]
│                            ↑             │
│                    Next workout          │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │   💪 Your muscles are growing       ││
│  │   ─────────────────────────────     ││
│  │                                     ││
│  │   Rest isn't the absence of         ││
│  │   progress—it's where progress      ││
│  │   happens.                          ││
│  │                                     ││
│  │   During rest, your body:           ││
│  │   • Repairs muscle fibers           ││
│  │   • Replenishes energy stores       ││
│  │   • Adapts to get stronger          ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Optional: Active Recovery          ││
│  │  ────────────────────────────       ││
│  │  • 10-min walk                      ││
│  │  • Light stretching                 ││
│  │  • Foam rolling                     ││
│  └─────────────────────────────────────┘│
│                                         │
│         [I Did Something Active]        │
│         (optional, no pressure)         │
│                                         │
│  ───────────────────────────────────    │
│  Next: Friday • Legs & Core • 5 exercises│
│                                         │
└─────────────────────────────────────────┘
```

### Rest Day Notification

```
┌─────────────────────────────────────────┐
│  baisics                           now  │
│  ─────────────────────────────────────  │
│  🌙 Rest Day Reminder                   │
│                                         │
│  "Your muscles are growing right now.   │
│   Enjoy your rest—you've earned it."    │
│                                         │
│  Next workout: Friday                   │
└─────────────────────────────────────────┘
```

### Weekly View with Rest Days

```
This Week:

Mon   Tue   Wed   Thu   Fri   Sat   Sun
───── ───── ───── ───── ───── ───── ─────
 ✓     ✓     ✓     R     →     R     R
Upper Lower Upper REST  Legs  REST  REST
Body  Body  Body        Core

Progress: 3/4 workouts • On track
```

### Educational Micro-Content (Rotating)

| Day | Title | Content |
|-----|-------|---------|
| Thu | "Why Rest Works" | "Muscle protein synthesis—the process of building muscle—peaks 24-48 hours after exercise. Today, your body is literally building the muscle you trained." |
| Sat | "The Recovery Window" | "Sleep, nutrition, and rest are the three pillars of recovery. You can't out-train a bad recovery strategy." |
| Sun | "Active Recovery" | "Light movement on rest days (walking, stretching) increases blood flow without adding stress. It's optional—do what feels right." |

### Copy/Messaging Examples

| Element | Option A | Option B |
|---------|----------|----------|
| Headline | "Your muscles are growing" | "Rest Day" |
| Subhead | "Rest isn't the absence of progress—it's where progress happens." | "Recovery is training too." |
| CTA | "I Did Something Active" | "Log Active Recovery" |
| Next Workout | "Next: Friday • Legs & Core" | "See you Friday for Legs & Core" |

### Implementation Notes

1. **Rest Day Detection:**
   - Program defines workout days (e.g., Mon/Wed/Fri)
   - Non-workout days are rest days
   - Special handling for "extra" rest (user skipped)

2. **Dashboard Variant:**
   - Different background color (subtle gray vs white)
   - Ring shows "R" instead of empty
   - No "Start Workout" CTA on rest days

3. **Streak Protection:**
   - Rest days NEVER break streak
   - Streak counts scheduled workouts completed
   - "3/3 this week" not "3/7 days"

4. **Mobile-First:**
   - Rest day screen is calmer (less saturated colors)
   - Educational content is scrollable
   - Active recovery log is optional and frictionless

5. **Psychology:**
   - Avoid any language that implies rest = lazy
   - Frame rest as active choice, not passive absence
   - Provide optional micro-tasks (don't require them)

---

## Concept 5: Lifetime Milestone Badges

### Pattern Details
- **Pattern Name:** Lifetime Consistency Milestones (Pattern #3 from library)
- **Psychological Principle:** Progress permanence, identity formation, no loss possible
- **Tasteful Rating:** 5/5 | **Manipulation Risk:** 1/5

### Where It Appears
- **Primary:** Achievement unlock screen (on milestone completion)
- **Secondary:** Profile/achievements page
- **Tertiary:** Share cards for social

### Milestone Tiers

| Milestone | Badge Name | Meaning |
|-----------|------------|---------|
| 1 workout | "Day One" | Started the journey |
| 10 workouts | "Getting Started" | Building the habit |
| 25 workouts | "Quarter Century" | Consistency emerging |
| 50 workouts | "Fifty Strong" | Intermediate commitment |
| 100 workouts | "Century Club" | Serious dedication |
| 250 workouts | "Two-Fifty" | Long-term athlete |
| 365 workouts | "Year's Worth" | A full year of training |
| 500 workouts | "Five Hundred" | Elite commitment |
| 1000 workouts | "The Thousand" | Legendary status |

### ASCII Wireframe: Badge Unlock (Mobile)

```
┌─────────────────────────────────────────┐
│                                         │
│                  ★                      │
│                 /|\                     │
│                / | \                    │
│               /  |  \                   │
│              /___|___\                  │
│                                         │
│    ╔═══════════════════════════════╗    │
│    ║     MILESTONE UNLOCKED        ║    │
│    ╚═══════════════════════════════╝    │
│                                         │
│         ┌─────────────────────┐         │
│         │                     │         │
│         │    ╭───────────╮    │         │
│         │    │    50     │    │         │
│         │    │  FIFTY    │    │         │
│         │    │  STRONG   │    │         │
│         │    ╰───────────╯    │         │
│         │                     │         │
│         │  "Fifty workouts.   │         │
│         │   This is who you   │         │
│         │   are now."         │         │
│         │                     │         │
│         └─────────────────────┘         │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │  Your Journey So Far:           │  │
│    │                                 │  │
│    │  ✓ Day One         ✓ 10        │  │
│    │  ✓ 25              ★ 50        │  │
│    │  ○ 100             ○ 250       │  │
│    │  ○ 365             ○ 500       │  │
│    │  ○ 1000                        │  │
│    │                                 │  │
│    │  Next milestone: 100 workouts   │  │
│    │  (50 to go)                     │  │
│    └─────────────────────────────────┘  │
│                                         │
│         [Share Achievement]             │
│                                         │
│          [Continue →]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Profile Achievements View

```
┌─────────────────────────────────────────┐
│  ← Profile                              │
├─────────────────────────────────────────┤
│                                         │
│  LIFETIME ACHIEVEMENTS                  │
│  ─────────────────────                  │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │  ★  │  │ 10  │  │ 25  │  │ 50  │    │
│  │ DAY │  │     │  │     │  │     │    │
│  │ ONE │  │ ✓   │  │ ✓   │  │ ✓   │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │ 100 │  │ 250 │  │ 365 │  │ 500 │    │
│  │     │  │     │  │     │  │     │    │
│  │ 🔒  │  │ 🔒  │  │ 🔒  │  │ 🔒  │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
│                                         │
│  ┌─────┐                                │
│  │1000 │  Progress to next:             │
│  │     │  ████████████░░░░░░░  62/100   │
│  │ 🔒  │                                │
│  └─────┘                                │
│                                         │
│  PROGRAM ACHIEVEMENTS                   │
│  ─────────────────────                  │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │ 🏆  │  │ 📅  │  │ 🔥  │             │
│  │Prog │  │Week │  │7-Day│             │
│  │Done │  │Done │  │Fire │             │
│  └─────┘  └─────┘  └─────┘             │
│                                         │
└─────────────────────────────────────────┘
```

### Badge Visual Design System

```
Badge Shape: Rounded square (iOS-style)
Size: 80x80px (2x for retina)

╭───────────╮
│           │
│   [ICON]  │
│   NUMBER  │
│   LABEL   │
│           │
╰───────────╯

Earned State:
- Background: Gradient (navy → coral)
- Icon: White
- Border: Subtle glow

Locked State:
- Background: Gray (#94A3B8)
- Icon: Lock symbol
- Opacity: 60%

Badge Icons (by milestone):
- 1: Star
- 10: Flame (small)
- 25: Medal
- 50: Dumbbell
- 100: Crown
- 250: Diamond
- 365: Calendar with checkmark
- 500: Trophy
- 1000: Infinity symbol
```

### Copy/Messaging Examples

| Milestone | Badge Quote |
|-----------|-------------|
| 1 | "The first rep is the hardest one to take." |
| 10 | "Ten down. You're building something." |
| 25 | "Twenty-five workouts. The habit is forming." |
| 50 | "Fifty workouts. This is who you are now." |
| 100 | "One hundred workouts. You're in the Century Club." |
| 250 | "Two hundred fifty. Most people quit at ten." |
| 365 | "A year's worth of workouts. Respect earned." |
| 500 | "Five hundred workouts. Elite commitment." |
| 1000 | "One thousand workouts. Legendary." |

### Implementation Notes

1. **Data Model:**
   ```typescript
   interface LifetimeMilestone {
     threshold: number;
     name: string;
     quote: string;
     icon: string;
     earned: boolean;
     earnedAt?: Date;
   }
   ```

2. **Trigger Logic:**
   - After each workout completion, check `totalWorkouts`
   - If crosses milestone threshold, trigger unlock animation
   - Store `earnedAt` timestamp for badge

3. **Key Insight: Progress Never Lost:**
   - Unlike streaks, these badges can never be lost
   - User who takes 6-month break still has their 50 badge
   - Psychologically safer than streak-based achievement

4. **Mobile-First:**
   - Badge grid is 4 columns (fits all 9 badges)
   - Tap badge to see details and share
   - Progress bar shows next milestone

5. **Social Sharing:**
   - Generate share card for each milestone
   - Include stats: total workouts, time since Day One
   - Branded with baisics colors/logo

---

## Summary: Implementation Priorities

### Recommended Build Order

| Order | Concept | Effort | Impact | Rationale |
|-------|---------|--------|--------|-----------|
| 1 | **Lifetime Milestone Badges** | Small | High | Low risk, high psychological safety, extends existing badge system |
| 2 | **Rest Day Affirmation** | Small | High | Quick win, addresses critical gap, minimal new UI |
| 3 | **Completion Ring** | Medium | High | Core dashboard improvement, reusable component |
| 4 | **Missed Workout Recovery** | Medium | Critical | Addresses #1 dropout cause, more complex flow |
| 5 | **First Workout Celebration** | Medium | High | Polish item, enhances existing completion flow |

### Dependencies

```
Lifetime Badges ←── (standalone)
       ↓
Rest Day Screen ←── (uses weekly progress from badges)
       ↓
Completion Ring ←── (builds on rest day visual language)
       ↓
First Workout ←── (uses celebration patterns from ring completion)
       ↓
Missed Workout Recovery ←── (uses all above patterns for recovery messaging)
```

### Technical Considerations

| Component | Technology | Notes |
|-----------|------------|-------|
| Completion Ring | SVG + Framer Motion | Animate stroke-dasharray for fill |
| Confetti | canvas-confetti | Lightweight, configurable |
| Badge Icons | SVG sprite or icon component | Keep consistent visual language |
| Share Cards | Canvas API or React-to-image | Generate server-side or client-side |
| Recovery Flow | React state machine | Handle complex conditional routing |

---

## Related Documents

- [236-pattern-library.md](./236-pattern-library.md) - Full pattern catalog with ratings
- [236-journey-map.md](./236-journey-map.md) - User journey intervention points
- [236-psych-foundations.md](./236-psych-foundations.md) - Underlying psychological principles
- [236-competitor-apple-fitness.md](./236-competitor-apple-fitness.md) - Apple ring patterns
- [236-competitor-duolingo.md](./236-competitor-duolingo.md) - Streak and celebration patterns

---

*Document created for baisics research spike #236*
