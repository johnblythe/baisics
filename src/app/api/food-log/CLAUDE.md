# Food Log API

## Architecture Decisions (2026-01-25)

### Target Resolution (daily-summary)
When fetching nutrition targets, use this priority:

1. **Active Program's NutritionPlan** - find by `phaseNumber <= currentWorkoutPhase` (most recent)
2. **User's standalone NutritionPlan** - fallback if no program
3. **Default targets** - 2000 cal, 150g P, 250g C, 65g F

### Phase Matching Query
```sql
-- Find applicable NutritionPlan for current workout phase
SELECT * FROM nutrition_plans
WHERE program_id = $programId
  AND phase_number <= $currentWorkoutPhase
ORDER BY phase_number DESC
LIMIT 1
```

### New Endpoints (to be added)
- `GET /api/nutrition-plan` - Get user's active nutrition plan
- `POST /api/nutrition-plan` - Create/update standalone nutrition plan
- `POST /api/nutrition-plan/calculate` - TDEE calculator → suggested targets
- `POST /api/nutrition-plan/ai-suggest` - AI freeform → suggested targets

### hasPersonalizedTargets Flag
Return `true` when targets come from:
- Program's NutritionPlan
- User's standalone NutritionPlan

Return `false` when falling back to defaults.

See: `docs/brainstorms/2026-01-25-nutrition-architecture-brainstorm.md`
