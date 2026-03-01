# PR #429 Code Review — feat(nutrition): curated verified foods

**Date:** 2026-03-01
**Branch:** `feat/curated-verified-foods` | **Closes:** #379
**Agents used:** security-sentinel, performance-oracle, architecture-strategist, data-integrity-guardian, data-migration-expert, pattern-recognition-specialist, kieran-typescript-reviewer, code-simplicity-reviewer

---

## P1 — Critical (BLOCKS MERGE)

### 1. `shouldReplace()` guard ordering lets verified foods replace QuickFoods

**File:** `src/lib/food-search/unified-search.ts:159-164`

The `isVerified` check fires before the QuickFood guard. If a user has a custom "Banana" QuickFood and a verified "Banana" exists, the verified entry replaces the QuickFood during dedup — violating the documented priority (QuickFood > Verified > OFF).

**Fix:** Reorder guards — move QuickFood checks first:

```typescript
function shouldReplace(existing, candidate) {
  if (existing.source === 'QUICK_FOOD') return false;
  if (candidate.source === 'QUICK_FOOD') return true;
  if (candidate.isVerified && !existing.isVerified) return true;
  return false;
}
```

### 2. `VERIFIED` source not in Prisma `FoodSource` enum — logging verified foods will fail

**Files:** `prisma/schema.prisma:646-656`, `src/components/food-logging/FoodLogPage.tsx:879-885`, `src/components/food-logging/FoodLogPage.tsx:700-716`

When a user selects a verified food and logs it, `source: 'VERIFIED'` is sent to the API. The API validates against `Object.values(FoodSource)` which has no `VERIFIED` value → returns 400 error. The `sourceMap` in `handleInlineFoodAdd` (line 879) also has no `'VERIFIED'` entry, so it falls through unmapped.

**Fix options:**
- **Quick:** Add `'VERIFIED': 'OPEN_FOOD_FACTS'` to the sourceMap (verified foods are stored in OFF table, semantically correct)
- **Full:** Add `VERIFIED` to the Prisma `FoodSource` enum (requires migration)

### 3. Duplicate tuna entries with identical macros

**Files:** `migration.sql:45,97` + `verified-foods.json:40,97`

`BAISICS-TUNA-CANNED-001` and `BAISICS-CANNED-TUNA-WATER-001` are the same food (FDC ID 171986, identical macros: 116 cal, 25.5g P, 0g C, 0.8g F). Both will appear in search results since they have different codes and name Jaccard similarity may or may not cross the 0.85 threshold.

**Fix:** Remove `BAISICS-CANNED-TUNA-WATER-001` from both migration SQL and verified-foods.json.

---

## P2 — Important (Should Fix)

### 4. Quinoa has wrong FDC ID (168917 = Pasta)

**File:** `verified-foods.json:61`

Quinoa references FDC ID 168917 which is "Pasta, cooked, enriched". Correct FDC ID for quinoa is **168874**. Macros appear correct — only the provenance reference is wrong.

### 5. Missing `key={food.id}` on modal ServingSizeSelector

**File:** `src/components/food-logging/USDAFoodSearch.tsx:237`

The PR added `key={food.id}` to 4 ServingSizeSelector instances to fix stale state on food switch, but missed the modal branch in USDAFoodSearch. The non-modal branch (line 158) has it. This means the stale-state bug persists on this code path.

### 6. `hasValidNutrition` could filter verified foods at boundary

**File:** `src/lib/food-search/unified-search.ts:49`

Olive oil (fat=100) and sugar (carbs=100) sit exactly at the validation boundary (`> 100`). If USDA ever revises to 100.1, verified foods would be silently filtered.

**Fix:** Add `if (food.isVerified) return true;` bypass at the top of `hasValidNutrition`.

### 7. Unnecessary `as FoodSearchSource` type cast

**File:** `src/lib/food-search/unified-search.ts:329`

Both `'VERIFIED'` and `'OPEN_FOOD_FACTS'` are valid members of the union type. The cast hides potential typo errors. Remove the `as FoodSearchSource`.

### 8. Import script should guard verified rows

**File:** `scripts/import-off-data.ts:169-177`

If the OFF bulk import is re-run, it could theoretically overwrite verified data. The `BAISICS-` prefix makes collision impossible today, but adding `WHERE foods_off.is_verified = false` to the import's ON CONFLICT clause is defensive.

---

## P3 — Nice-to-Have (Follow-up)

### 9. Missing partial index for `is_verified` sort

Add `CREATE INDEX foods_off_verified_idx ON foods_off(is_verified) WHERE is_verified = true;` to prevent full-table sort at scale. Currently the `ORDER BY is_verified DESC` has no supporting index. Fine at current row count, matters at 100K+.

### 10. Duplicate `plainto_tsquery` in SQL

**File:** `unified-search.ts:312-320`

`plainto_tsquery('english', ${query})` evaluated twice (WHERE + ORDER BY). Use a CTE:

```sql
WITH q AS (SELECT plainto_tsquery('english', ${query}) AS tsq)
SELECT ... FROM foods_off f, q
WHERE f.search_vector @@ q.tsq
ORDER BY f.is_verified DESC, ts_rank(f.search_vector, q.tsq) DESC
LIMIT ${pageSize}
```

### 11. `counts.openFoodFacts` silently includes verified foods

**File:** `unified-search.ts:420-426`

Verified foods come from `offLocalResults` but get source `'VERIFIED'`. They're counted under `openFoodFacts`, inflating that metric. Consider adding `verified: number` to the counts type.

### 12. Pre-compute relevance scores before sort

**File:** `unified-search.ts:414-418`

`calculateRelevanceScore` is called inside `sort()` comparator (~900 calls for 75 results). Pre-compute once, then sort by cached score. ~12x fewer string operations.

### 13. COLORS constant duplicated across 12 files

The identical `COLORS` object exists in 12 component files. Extract to `src/lib/design/colors.ts`. The CLAUDE.md style guide already defines these as CSS variables.

### 14. Inline SVGs where Lucide icons exist

**File:** `FoodSearchAutocomplete.tsx:332-354`

Star icon (QuickFood) and shield-checkmark icon (Verified) are inline SVG. The project already uses `lucide-react` (`Star`, `ShieldCheck`).

### 15. Document rollback SQL for migration

No down migration provided. Rollback:
```sql
DELETE FROM foods_off WHERE code LIKE 'BAISICS-%';
ALTER TABLE foods_off DROP COLUMN IF EXISTS is_verified;
ALTER TABLE foods_off DROP COLUMN IF EXISTS verified_serving_unit;
ALTER TABLE foods_off DROP COLUMN IF EXISTS verified_serving_grams;
```

---

## What's Good

- **Architecture:** Reusing `foods_off` table with `BAISICS-` namespace avoids unnecessary complexity
- **Security:** PASS — raw SQL properly parameterized via Prisma tagged templates, no XSS, no badge spoofing vector
- **Simplicity:** PASS — well-scoped, no unnecessary abstractions, SCORING constants improve readability
- **Migration:** Idempotent (IF NOT EXISTS + ON CONFLICT DO UPDATE), safe defaults, search_vector auto-populates
- **Type system:** Clean extension of FoodSearchSource union, proper optional fields
- **Key prop pattern:** Correct React idiom for resetting uncontrolled state (just missed one instance)
- **Data pipeline:** Clean flow from DB → raw SQL → UnifiedFoodResult → component props
