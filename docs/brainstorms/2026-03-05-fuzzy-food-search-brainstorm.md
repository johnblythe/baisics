# Fuzzy Food Search (Issue #387 — Partial)

**Date:** 2026-03-05
**Scope:** pg_trgm fuzzy matching on `foods_off` table only
**Issue:** #387 (addresses fuzzy matching / typo tolerance item)

## What We're Building

Add PostgreSQL trigram similarity (`pg_trgm`) to the `foods_off` table so misspelled queries like "chiken brest" or "brocoli" still return relevant results. Currently, `tsvector` full-text search requires exact word stems — any typo returns zero local OFF results, falling back to external APIs or nothing.

## Why This Approach

- **pg_trgm is the standard** for typo-tolerant search in PostgreSQL. It's built-in, fast with GIN indexes, and handles multi-word partial matches naturally.
- **foods_off is the right target** — it's the 1-2M product table where tsvector misses hurt most. QuickFoods (user's personal foods) are small sets where ILIKE `%contains%` is sufficient.
- **Levenshtein rejected** — better for single-word "did you mean?" than ranked multi-word search. pg_trgm handles the ranking use case natively.
- **No new dependencies** — pg_trgm ships with PostgreSQL, just needs `CREATE EXTENSION`.

## Key Decisions

1. **pg_trgm on `foods_off`** — not QuickFoods or USDA (external API, can't index)
2. **Hybrid approach**: tsvector first (exact matches rank highest), then fall back to trigram similarity for fuzzy matches when tsvector returns < N results
3. **GIN index on `product_name`** using `gin_trgm_ops` — fast trigram lookups
4. **Similarity threshold** — start with 0.3 (pg_trgm default), tune based on search logs
5. **Scoring integration** — trigram similarity score feeds into existing `calculateRelevanceScore()` with a weight factor

## Sketch of the Search Flow Change

```
Current:
  foods_off search → plainto_tsquery(query) → ts_rank() → results

Proposed:
  foods_off search →
    1. tsvector search (exact stems) → results
    2. IF results < 5:
       trigram search: similarity(product_name, query) > 0.3 → ORDER BY similarity DESC
    3. Merge & deduplicate, tsvector matches ranked higher
```

## What's NOT in Scope

- AI fallback auto-trigger (separate effort)
- Portion preset buttons (separate effort)
- AI-enhanced USDA display names (separate effort)
- Community verification / trust scores (separate effort)
- Changes to QuickFoods search or USDA API search
- Unifying food tables (#427)

## Open Questions

1. **Supabase pg_trgm availability** — need to verify the extension is enabled or can be enabled on our Supabase instance. Likely yes (it's a common extension) but should confirm.
2. **Index size impact** — GIN trigram index on 1-2M rows of `product_name` will add storage. Probably ~200-500MB. Acceptable?
3. **Similarity threshold tuning** — 0.3 is default. May need to go lower (0.2) for very short queries or higher (0.4) to reduce noise. Search logs can guide this post-launch.
4. **Query length minimum** — trigram matching on 1-2 char queries is noisy. Probably only engage fuzzy for queries >= 3 chars.

## Files Likely Touched

- New migration: `CREATE EXTENSION IF NOT EXISTS pg_trgm` + GIN index on `foods_off.product_name`
- `src/lib/food-search/unified-search.ts` — add trigram fallback in `searchLocalOff()`
- Possibly `src/app/api/foods/search/route.ts` — no changes expected (search service handles it)
