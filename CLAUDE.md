# Project Instructions

## Development
- **Dev server runs on port 3001**: `http://localhost:3001`
- Run with `npm run dev`

## Git Workflow
- **Trunk-based development: all PRs target `main`**
- Create feature branches from `main`

## Database & Migrations
- **Production migrations only via deploy**: Never run migrations directly against prod. Vercel build runs `prisma migrate deploy` automatically.
- **Workflow**: Create migration locally → commit → push to main → Vercel deploys and applies migration
- **Local data → prod**: Use sync scripts in `scripts/` folder, not direct DB access

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
