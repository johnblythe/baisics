# Project Instructions

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
