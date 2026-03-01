# OFF Data Import + Food Search Infrastructure — Brainstorm

**Date**: 2026-02-24
**Issues**: #390 (primary), #392 (bundled), #391 (separate), #393 (separate, depends on #390)

## What We're Building

**Crescendo model** for Open Food Facts data: start with a quality subset in our Postgres, keep Search-a-licious as a fallback, auto-ingest products users actually select. The local DB grows organically based on real usage.

### Architecture

```
User searches "chicken breast"
        │
        ├─→ QuickFoods (Postgres, user-scoped)     ← highest priority
        ├─→ USDA (external API, tiered search)      ← primary external source
        ├─→ Local OFF (Postgres, tsvector search)   ← NEW: fast local subset
        └─→ SAL fallback (Elasticsearch, external)  ← fills gaps in local OFF
                │
                └─→ User selects a SAL-only result?
                        → Auto-ingest into local OFF table
```

**Search blending**: All four sources searched concurrently. Results merged, deduplicated, relevance-sorted as today. Local OFF replaces most SAL results; SAL catches what we haven't imported yet.

## Why This Approach

- **No external dependency for 90%+ of searches** — local Postgres handles common foods
- **Zero data loss** — SAL fallback means we never show fewer results than today
- **Self-improving** — auto-ingest means the DB converges on what users actually want
- **Incremental** — start with filtered subset, expand if needed. No big-bang import required.

## Key Decisions

1. **Full local Postgres + SAL fallback** over pure-local or pure-SAL. Best of both worlds.
2. **Initial seed filters**: Complete nutrition data (all 4 macros present) + English product names. Should yield ~1-2M products from the 3M+ total.
3. **tsvector for search** — Postgres full-text search is "good enough" for a supplementary source. USDA is primary, OFF catches the rest.
4. **Auto-ingest on selection** — when a user picks a SAL result not in our DB, insert it into `foods_off`. Captures demand signal.
5. **Round macros at data layer (#392)** — fix in `simplifyFood()` (USDA), `simplifyProduct()` (OFF), and QuickFood/AI estimate outputs. Not at display components.
6. **Per-100g base rates: look up from source on edit (#393)** — no new columns on `food_log_entries`. On edit, re-fetch from USDA/local OFF/QuickFood using stored source + fdcId/code.
7. **Delta sync: manual script** — no cron infra. Auto-ingest handles freshness for active products. Bulk refresh script available for periodic manual runs.

## Table Design (Sketch)

```sql
CREATE TABLE foods_off (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,           -- barcode (OFF primary key)
  product_name TEXT NOT NULL,
  product_name_en TEXT,
  brands TEXT[],                        -- array, matches SAL format
  -- Macros per 100g
  calories_per_100g FLOAT,
  protein_per_100g FLOAT,
  carbs_per_100g FLOAT,
  fat_per_100g FLOAT,
  -- Serving data (the gap we're filling)
  serving_size FLOAT,
  serving_unit TEXT,
  -- Search
  tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(product_name, '') || ' ' || coalesce(product_name_en, '') || ' ' || coalesce(array_to_string(brands, ' '), ''))
  ) STORED,
  -- Metadata
  countries_tags TEXT[],
  source TEXT DEFAULT 'bulk_import',    -- 'bulk_import' | 'user_selection' | 'delta_sync'
  imported_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_foods_off_tsv ON foods_off USING GIN (tsv);
CREATE INDEX idx_foods_off_code ON foods_off (code);
```

## Scope Breakdown

### This PR (#390 + #392)
- Create `foods_off` table + migration
- Import script (download JSONL, filter, bulk insert)
- New `searchLocalOff()` function in unified search
- Modify `searchOpenFoodFacts()` to be SAL fallback (only when local results < threshold)
- Auto-ingest: on food log save, if source is OFF + not in local DB → insert
- Round macros at data layer in all simplify/transform functions

### Separate: #391 (preserve search results on cancel)
- Component state management — stash results + query, restore on back/cancel

### Separate: #393 (portion recalculation on edit)
- Depends on #390 (local OFF provides base rates for re-lookup)
- On edit: fetch per-100g rates from source (USDA API / local OFF / QuickFood)
- Recalculate macros when serving size changes

## Open Questions

1. **Supabase row limits** — what's our plan tier's row limit? 3M rows might need Pro.
2. **Import method** — stream JSONL line-by-line and batch INSERT, or use Supabase's CSV import? Need to test what works for 1-2M rows.
3. **SAL fallback threshold** — how many local results before we skip SAL? 5? 10? Or always query both and merge?
4. **OFF serving size format** — need to inspect the JSONL dump to understand what `serving_size` actually looks like (could be "100g", "1 cup (240ml)", etc.). May need parsing.
5. **ODbL attribution** — where do we display "Data from Open Food Facts" in the UI?

## Next Steps

Run `/workflows:plan` to create implementation plan.
