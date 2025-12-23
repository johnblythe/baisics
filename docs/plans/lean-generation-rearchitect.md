# Lean Program Generation Re-Architecture

## Problem
Program generation takes 35-200s due to generating 3,000-10,000 tokens of repetitive content (exercise instructions, warmup activities, etc.) that doesn't vary by user.

## Solution
AI generates **decisions** (500-1,500 tokens), DB provides **details** via lookup. Target: <30s generation, fits Vercel 60s limit.

---

## Phase 1: Exercise Library Foundation

### Status: MOSTLY EXISTS
- `ExerciseLibrary` schema ✓ (has instructions, equipment, muscles, difficulty, etc.)
- `import-exercises.ts` script ✓ (pulls 873 exercises from free-exercise-db)
- `exerciseMatcher.ts` ✓ (fuzzy matching, caching)

### 1.1 Schema Additions
- [ ] Add new fields to `ExerciseLibrary`:
  ```prisma
  enum ExerciseTier {
    TIER_1  // Main lifts - typically first (squat, deadlift, bench)
    TIER_2  // Supporting - typically middle (lunges, RDLs, dips)
    TIER_3  // Accessory - typically last (curls, raises, abs)
  }

  model ExerciseLibrary {
    // ... existing fields (name, equipment, instructions, etc.)

    // NEW FIELDS:
    defaultTier        ExerciseTier  @default(TIER_2)
    contraindications  String[]      @default([])  // ["knee", "shoulder", "lower back"]
    environments       String[]      @default([])  // ["gym", "home", "outdoors"]
  }
  ```

### 1.2 Populate Library (Local)
- [ ] Run `import-exercises.ts` locally to seed 873 exercises
- [ ] Verify instructions, equipment, muscles populated
- [ ] Create migration for new fields

### 1.3 Classify Tiers
- [ ] Auto-classify using heuristics:
  ```typescript
  // Tier 1: compound + (SQUAT|HINGE) + specific names
  // Tier 2: compound + other patterns
  // Tier 3: !isCompound
  ```
- [ ] Manual review/fix for ~50-100 common exercises

### 1.4 Add Contraindications (stretch goal)
- [ ] Map common exercises to injury flags
- [ ] Could be manual for top 50 exercises, or defer

### 1.5 Warmup/Cooldown Templates
- [ ] Create JSON config (not DB):
  ```typescript
  // src/lib/templates/warmups.ts
  const WARMUP_TEMPLATES = {
    'lower': { duration: 5, activities: ['Hip circles', 'Leg swings', 'Glute bridges'] },
    'upper': { duration: 5, activities: ['Arm circles', 'Band pull-aparts', 'Wall slides'] },
    'full':  { duration: 5, activities: ['Jumping jacks', 'Arm circles', 'Bodyweight squats'] },
  }
  ```

---

## Phase 2: Lean Prompt & Schema

### 2.1 New AI Output Schema
- [ ] Define slim `GeneratedProgramSlim` type:
  ```typescript
  interface GeneratedProgramSlim {
    name: string;
    description: string;  // 1-2 sentences max
    phases: {
      name: string;
      focus: string;      // 1 sentence
      splitType: string;
      workouts: {
        name: string;
        focus: string;    // "lower" | "upper" | "push" | "pull" | "full"
        exercises: {
          slug: string;   // references ExerciseLibrary
          sets: number;
          reps?: number;
          duration?: number;  // for time-based
          rpe: number;
          notes?: string; // ONLY user-specific notes (injury mods, etc)
        }[];
      }[];
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        notes?: string;  // user-specific only
      };
    }[];
  }
  ```

### 2.2 New Prompt
- [ ] Rewrite `buildGenerationPrompt()` to:
  - Request slim schema only
  - Provide exercise library as available options (slugs + equipment + contraindications)
  - Remove instruction generation requirements
  - Remove warmup/cooldown generation
  - Keep: exercise selection logic, periodization, user-specific notes

### 2.3 Prompt Size Management
- [ ] Filter exercise library sent to AI based on user's equipment/environment
- [ ] Only send ~50-80 relevant exercises, not full library

---

## Phase 3: Enrichment Layer

### 3.1 Hydration Service
- [ ] Create `src/services/programGeneration/enrichment.ts`:
  ```typescript
  async function enrichProgram(
    slim: GeneratedProgramSlim,
    profile: UserProfile
  ): Promise<GeneratedProgram> {
    // 1. Look up exercise details from DB
    // 2. Attach warmup/cooldown templates based on workout focus
    // 3. Calculate nutrition from formulas if not provided
    // 4. Add progression protocol from templates
    // 5. Return full GeneratedProgram shape
  }
  ```

### 3.2 Exercise Lookup
- [ ] Batch fetch exercises by slug
- [ ] Handle missing exercises gracefully (AI hallucinated a name)
- [ ] Fuzzy match fallback for close names

### 3.3 Template Application
- [ ] Match warmup template to workout focus
- [ ] Apply progression protocol templates by experience level
- [ ] Generate `expectations` from phase focus + level

---

## Phase 4: API Integration

### 4.1 Update Generation Flow
- [ ] Modify `/api/programs/generate/route.ts`:
  ```
  1. Build slim prompt with filtered exercise list
  2. Call AI (target: 500-1500 tokens out)
  3. Validate slim response
  4. Enrich with DB lookups
  5. Save enriched program to DB
  6. Return full program
  ```

### 4.2 Streaming Updates (if keeping streaming)
- [ ] Stream slim response
- [ ] Enrich phases as they arrive
- [ ] Emit enriched phases to client

### 4.3 Model Routing (optional optimization)
- [ ] Default to Sonnet for slim generation
- [ ] Opus only for users with injuries/medical flags (better exercise selection judgment)

---

## Phase 5: Migration & Cleanup

### 5.1 Backward Compatibility
- [ ] Keep old prompt/schema temporarily
- [ ] Feature flag: `USE_LEAN_GENERATION`
- [ ] A/B test quality

### 5.2 Cleanup
- [ ] Remove verbose prompt builders
- [ ] Remove instruction generation from schema validation
- [ ] Update tests

---

## File Changes Summary

```
src/
├── services/programGeneration/
│   ├── index.ts              # Update main flow
│   ├── prompts.ts            # New lean prompts
│   ├── promptsLegacy.ts      # Move old prompts here temporarily
│   ├── schema.ts             # Add slim schema
│   ├── enrichment.ts         # NEW: hydration service
│   └── exerciseFilter.ts     # NEW: filter library for prompt
├── lib/
│   └── templates/
│       ├── warmups.ts        # NEW: warmup/cooldown templates
│       └── progressions.ts   # NEW: progression protocol templates
prisma/
├── schema.prisma             # ExerciseLibrary updates
└── seed/
    └── exercises.ts          # NEW: exercise seed data
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Generation time (beginner) | 35-90s | <15s |
| Generation time (advanced) | 115-200s | <30s |
| Output tokens | 3,000-10,000 | 500-1,500 |
| Vercel timeout errors | Frequent | Zero |
| Quality (subjective) | Good | Same or better |

---

## Open Questions

1. **Exercise library scope** - Start with 100 exercises or go bigger?
2. **Hallucination handling** - Strict reject or fuzzy match?
3. **Streaming** - Keep streaming UI or simplify to single response now that it's fast?
4. **User-specific instructions** - Ever generate custom cues for injuries, or always template?

---

## Rough Sequencing

```
Week 1: Phase 1 (Exercise library schema + seed)
Week 2: Phase 2 (Lean prompt + schema) + Phase 3 (Enrichment)
Week 3: Phase 4 (API integration) + Phase 5 (Testing/cleanup)
```
