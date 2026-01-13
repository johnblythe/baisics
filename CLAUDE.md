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
