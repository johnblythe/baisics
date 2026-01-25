# Prisma Schema Guidelines

## Architecture Decisions (2026-01-25)

### Program Structure
```
Program
├── WorkoutPlans[] (exercise phases)
└── NutritionPlans[] (nutrition phases) ← NEW, sibling not child
```

- **NutritionPlan** is sibling to WorkoutPlan, not embedded within it
- Both have `phaseNumber` for coordination
- Phase matching uses "most recent" lookup (highest phaseNumber ≤ currentWorkoutPhase)

### NutritionPlan Model (to be added)
```prisma
model NutritionPlan {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Can belong to User (standalone) OR Program (coordinated)
  userId        String?  @map("user_id") @db.Uuid
  programId     String?  @map("program_id") @db.Uuid

  phaseNumber   Int      @default(1) @map("phase_number")
  dailyCalories Int      @map("daily_calories")
  proteinGrams  Int      @map("protein_grams")
  carbGrams     Int      @map("carb_grams")
  fatGrams      Int      @map("fat_grams")
  source        NutritionPlanSource @default(MANUAL)
  isActive      Boolean  @default(true) @map("is_active")

  // Relations
  user          User?    @relation(fields: [userId], references: [id])
  program       Program? @relation(fields: [programId], references: [id])
}

enum NutritionPlanSource {
  MANUAL
  CALCULATOR
  AI_SUGGESTED
  PROGRAM_GENERATED
}
```

### Goals Model (to be added)
```prisma
model Goals {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String   @unique @map("user_id") @db.Uuid

  primaryGoal   String   @map("primary_goal")  // lose_weight, build_muscle, maintain, health
  targetWeight  Float?   @map("target_weight")
  timeframe     String?  // e.g., "12 weeks"
  notes         String?

  user          User     @relation(fields: [userId], references: [id])
}
```

### Migration Strategy
- Migrate existing WorkoutPlan nutrition fields → NutritionPlan records (linked to Program)
- Keep WorkoutPlan columns temporarily during transition
- Remove WorkoutPlan nutrition fields after migration verified

See: `docs/brainstorms/2026-01-25-nutrition-architecture-brainstorm.md`
