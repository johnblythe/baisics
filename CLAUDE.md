# Project Instructions

## Product Philosophy

### Free vs Paid Tiers
**"If it's core to their success, it's free. If it's convenient to their experience, it's paid."**

- Nutrition tracking, workout logging, progress visibility → Free (core to health outcomes)
- AI convenience features, advanced analytics, time-savers → Paid (nice-to-have, not essential)
- When in doubt: can a user achieve their health goal without this feature? If no → free.

## Domain
**The domain is baisics.app** - NOT baisics.co, NOT baisics.com. Always use baisics.app.

## Development
- **Dev server runs on port 3001**: `http://localhost:3001`
- Run with `npm run dev`

## Git Workflow
- **Trunk-based development: all PRs target `main`**
- Create feature branches from `main`

## Database & Migrations

**Database Provider**: Supabase (PostgreSQL)
- Connection strings in `.env.local` via `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
- Use `psql "$POSTGRES_URL_NON_POOLING"` for direct SQL queries
- Never use Prisma Studio - use SQL directly

### Key Concepts
- `migrate deploy` = **DEFAULT** - safe, non-destructive, applies existing migrations
- `migrate dev` = ONLY when creating NEW schema changes (can reset DB!)

### Workflow
```bash
# DEFAULT: Apply migrations (safe, preserves data)
npx prisma migrate deploy

# ONLY when adding new schema changes:
npx prisma migrate dev --name add_some_field
```

### Rules
- **ALWAYS use `migrate deploy`** - after pulling, switching branches, or "column does not exist" errors
- **NEVER use `migrate dev`** unless actively creating a new migration
- **Never run migrations directly against prod** - Vercel handles it
- **Local data → prod**: Use sync scripts in `scripts/` folder

### Fixing Failed Migrations
```bash
# If changes applied but migration marked failed:
npx prisma migrate resolve --applied <migration_name>

# If changes didn't apply:
npx prisma migrate resolve --rolled-back <migration_name>
```

## Style Guide (v2a - Fresh Athletic)
All public-facing pages should match the v2a landing page styling:
- **Colors**: White + deep navy (#0F172A) + warm coral (#FF6B6B)
- **Fonts**: Outfit (sans-serif) + Space Mono (monospace)
- **Tone**: Bold, confident, energetic
- **CSS Variables**:
  - `--color-white: #FFFFFF`
  - `--color-gray-50: #F8FAFC`
  - `--color-gray-100: #F1F5F9`
  - `--color-gray-400: #94A3B8`
  - `--color-gray-600: #475569`
  - `--color-navy: #0F172A`
  - `--color-navy-light: #1E293B`
  - `--color-coral: #FF6B6B`
  - `--color-coral-dark: #EF5350`
  - `--color-coral-light: #FFE5E5`
- Reference: `src/app/landing-v2a/page.tsx`

## Debug System for Condition-Based Testing

**Location**: `src/lib/debug/` (client + API utilities)

For testing features that trigger on specific conditions (user states, data thresholds, etc.), use the debug system. **This works at the API level** - components receive modified data and don't need debug-aware code.

### How It Works
1. Set state via URL: `?debug_state=rest_day` (sets cookie, page reloads)
2. Or via console: `window.baisicsDebug.setState('missed_3_days')`
3. Debug panel appears in bottom-right corner (dev only)
4. API routes check the cookie and return modified response data
5. Components "just work" - they see the simulated user state

### Available States
```typescript
type DebugState =
  | 'normal'                  // Default - no overrides
  | 'first_workout'           // User has 0 workouts
  | 'first_workout_complete'  // Just completed first workout
  | 'rest_day'                // Force rest day dashboard
  | 'missed_1_day'            // 1-day recovery screen
  | 'missed_3_days'           // 3+ day recovery screen
  | 'missed_7_days'           // Extended absence
  | 'week_2_checkin'          // Trigger week 2 modal
  | 'milestone_10'            // Next workout = 10th milestone
  | 'milestone_25'            // Next workout = 25th milestone
  | 'milestone_50'            // Next workout = 50th milestone
  | 'program_complete'        // Program completion celebration
  | 'program_almost_done';    // 95% through program
```

### Adding New Debug States
When building features with condition-based triggers:
1. Add state to `DebugState` type in `src/lib/debug/index.ts`
2. Add to `DEBUG_STATES` array (label + description)
3. Create override function in `src/lib/debug/api.ts`
4. Add case to `withDebugOverrides()` switch
5. Call `withDebugOverrides(data, 'route-type')` in your API route

### Example: Adding Debug to an API Route
```typescript
// In your API route
import { withDebugOverrides, logDebugState } from '@/lib/debug/api';

export async function GET(req: Request) {
  // ... fetch real data ...

  const response = { isRestDay, stats, ... };

  // Apply debug overrides (only affects dev, no-op in prod)
  await logDebugState('my-route');
  const finalResponse = await withDebugOverrides(response, 'rest-day');

  return NextResponse.json(finalResponse);
}
```

### Wired Routes
- `/api/programs/[programId]/rest-day` - `rest_day` state
- `/api/programs/[programId]/recovery` - `missed_*` states
- `/api/programs/[programId]/week2-checkin` - `week_2_checkin` state
- `/api/milestones` - `milestone_*` states
- `/api/programs/[programId]/completion` - `program_complete` state
- `/api/workout-logs/[id]/complete` - `first_workout_complete` state

## Test Personas

**Location**: `prisma/seed-data/personas/` | **Reference**: `docs/personas.md`

11 pre-built test users for local development. Run `npx prisma db seed` to populate.

### Quick Lookup
| Email | Type | Journey | Workouts |
|-------|------|---------|----------|
| alex@test.baisics.app | Complete beginner | fresh | 0 |
| sarah@test.baisics.app | Stay-at-home mom | early/sporadic | 4 |
| jordan@test.baisics.app | Home workout | week2 | 7 |
| chris@test.baisics.app | Time-crunched pro | early/skipper | 5 |
| kim@test.baisics.app | Injury recovery | week2 | 6 |
| taylor@test.baisics.app | Lapsed user | lapsed (14 days) | 12 |
| robert@test.baisics.app | Senior mobility | cruising | 16 |
| marcus@test.baisics.app | Gym bro PPL | cruising | 18 |
| priya@test.baisics.app | Weight loss | cruising/streak | 20 |
| derek@test.baisics.app | Former athlete | veteran | 45 |
| maya@test.baisics.app | Runner + strength | returning | 65 (2 programs) |

### Finding Personas by Need
- **Test streak UI**: priya, marcus (streak_builder, meticulous)
- **Test recovery screens**: taylor (lapsed), sarah (sporadic)
- **Test first-time UX**: alex (fresh)
- **Test program completion**: derek (veteran), maya (returning)
- **Test free tier**: sarah, jordan, alex, robert, kim, taylor
- **Test paid features**: marcus, derek, priya, chris, maya
- **Test minimal data**: jordan, chris (minimal, skipper)
- **Test detailed data**: marcus, derek, robert (meticulous)

### Pairing with Debug States
Personas provide real data; debug states override behavior:
- Login as `taylor@test.baisics.app` + `?debug_state=missed_7_days` → test recovery flow
- Login as `alex@test.baisics.app` + `?debug_state=first_workout` → test onboarding
- Login as `derek@test.baisics.app` + `?debug_state=milestone_50` → test milestone celebration
## UI Pattern: No Sidebars

The app does not use sidebar navigation. Navigation patterns:
- **Tabs**: Used within pages (e.g., /nutrition has Log | History | Recipes tabs)
- **Header nav**: Top-level navigation, may need dropdowns for sections with multiple pages (future work)

When adding new pages to an existing section, prefer adding tabs over introducing sidebars.
