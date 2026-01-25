# Nutrition Components

## Architecture Decisions (2026-01-25)

### NutritionPlan Model
- **Sibling to WorkoutPlan** under Program, not child
- Can also attach to User directly (standalone, for users without programs)
- Fields: `dailyCalories`, `proteinGrams`, `carbGrams`, `fatGrams`, `source`, `phaseNumber`
- Sources: `manual`, `calculator`, `ai_suggested`, `program_generated`

### Target Resolution Priority
1. Active Program's NutritionPlan (matching phase via "most recent" lookup)
2. User's standalone NutritionPlan
3. Default targets (2000 cal, 150g P, 250g C, 65g F)

### Phase Matching
- "Pull most recent" - find NutritionPlan with highest `phaseNumber <= currentWorkoutPhase`
- Allows nutrition phases to be fewer than workout phases

### NutritionTargetsModal
- Reusable across food log page and dashboard
- Direct editing of all four macro fields
- Help flows: Calculator (TDEE-based) and AI freeform text
- Links to existing `calculateMacros()` in `src/utils/macros.ts`

See: `docs/brainstorms/2026-01-25-nutrition-architecture-brainstorm.md`
