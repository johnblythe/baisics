# Nutrition Architecture Brainstorm

**Date:** 2026-01-25
**Status:** Approved for planning

## What We're Building

Decouple nutrition from WorkoutPlan into its own first-class entity. Create:
1. **NutritionPlan** model - sibling to WorkoutPlan under Program, or standalone on User
2. **Goals** model - user's fitness goals (target weight, timeframe, milestones)
3. **Nutrition Targets Modal** - reusable component for food log + dashboard
4. **Help flows** - calculator (TDEE-based) and AI freeform text

## Why This Approach

Current state: Nutrition fields are embedded in WorkoutPlan. This conflates exercise and nutrition, makes it impossible to have nutrition-only tracking, and doesn't model reality (nutrition ≠ exercise).

Better model: Program is a coordinated plan containing both WorkoutPlans[] and NutritionPlans[] as siblings. Either can exist independently. Both are means toward user's Goals.

## Key Decisions

### Architecture
- **NutritionPlan is sibling to WorkoutPlan** under Program (not child of WorkoutPlan)
- **Standalone NutritionPlan on User** for users without programs
- **Separate Goals model** with target weight, timeframe, milestones
- **Program always wins** - if user has active program, its NutritionPlan takes precedence over standalone

### Phase Coordination
- Both WorkoutPlan and NutritionPlan have `phaseNumber` field
- **"Pull most recent" matching** - nutrition plan with highest phaseNumber ≤ current workout phase
- Allows nutrition phases to be fewer than workout phases (e.g., 2 nutrition phases for 4 workout phases)

### Modal & Help Flows
- **Calculator** - uses existing `calculateMacros()` TDEE function
- **AI freeform** - natural language input → suggested targets
- Modal reusable across food log page and dashboard

### Migration
- **Full refactor** - migrate existing WorkoutPlan nutrition to NutritionPlan records
- Update all consumers (daily-summary, /hi flow, program generation)
- Remove WorkoutPlan nutrition fields after migration

## Data Model

```
User
├── Goals
│   ├── primaryGoal (enum: lose_weight, build_muscle, maintain, health)
│   ├── targetWeight
│   ├── timeframe
│   └── notes
│
├── NutritionPlan? (standalone - users without programs)
│   ├── dailyCalories, proteinGrams, carbGrams, fatGrams
│   └── source (manual, calculator, ai_suggested)
│
└── Programs
    ├── WorkoutPlans[] (exercise phases)
    │   └── phaseNumber, weeks, exercises...
    │
    └── NutritionPlans[] (nutrition phases)
        ├── phaseNumber
        ├── dailyCalories, proteinGrams, carbGrams, fatGrams
        └── source (manual, calculator, ai_suggested, program_generated)
```

## Target Resolution Priority

1. Active Program's NutritionPlan (matching phase)
2. User's standalone NutritionPlan
3. Default targets (2000 cal, 150g P, 250g C, 65g F)

## Open Questions

None - ready for planning.

## Next Steps

Run `/workflows:plan` to create implementation plan.
