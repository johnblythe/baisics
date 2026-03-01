---
date: 2026-03-01
topic: free-text-recipe-creation
issue: 397
---

# Free-Text Recipe Creation

## What We're Building

A free-text input on the `/nutrition/recipes` page where users describe a recipe in plain language (e.g., "2 eggs scrambled with 1oz cheddar, 2 strips bacon, toast with butter") and get it parsed into a structured recipe with accurate macros. The system uses AI to parse the text into ingredients, cross-references OFF/USDA databases for accurate macros (falling back to AI estimation), and presents results with confidence-based review — auto-accepting high-confidence items and flagging uncertain ones for user correction.

## Why This Approach

**Approach chosen: New API route + enhanced CreateRecipeModal (Approach A)**

Three approaches considered:
- **A (chosen):** New `/api/recipes/parse-text` endpoint + text box on recipes page + pre-populate existing `CreateRecipeModal` with parsed results. Minimal new UI, reuses proven patterns.
- **B (rejected):** Dedicated `/nutrition/recipes/new` page with multi-step flow. Over-built for v1.
- **C (rejected):** Inline parse/edit on recipes list page. Clutters the page, harder state management.

Approach A wins on simplicity. The `CreateRecipeModal` already has ingredient list editing, macro totals, and save logic. We're adding a new input mode, not a new workflow.

## Key Decisions

- **Location:** `/nutrition/recipes` page for v1. Can expand to main log flow later (e.g., "+ Add" → "Describe a meal").
- **Input:** Free text only. Recipe URL paste-to-parse logged as future enhancement (#407).
- **Parsing:** AI (Claude) parses text → structured ingredients with names, quantities, units.
- **Macro lookup:** Database-first (OFF 1.44M products + USDA), AI estimation fallback for unmatched items.
- **Review UX:** Confidence-based. High-confidence ingredients auto-accepted, low-confidence flagged for review. Follows existing `AIParseResult` confidence indicator pattern.
- **Servings:** Support multi-serving recipes. After parsing, user specifies serving count. Macros calculated and stored per-serving.
- **Save behavior:** Save only — no auto-log prompt. Newly saved recipe appears at top of recipe list for immediate one-tap logging.
- **Tier:** Free (core to nutrition tracking success).

## Existing Patterns to Leverage

| Pattern | Location | Reuse |
|---------|----------|-------|
| AI text → structured food | `/api/food-log/parse-text` | Same prompt engineering pattern, adapt for recipe context |
| Unified food search | `src/lib/food-search/unified-search.ts` | Cross-reference parsed ingredients against OFF/USDA |
| AI macro estimation | `/api/foods/estimate` | Fallback for ingredients not in databases |
| Confidence indicators | `AIParseResult` component | Reuse for ingredient confidence display |
| Recipe CRUD | `/api/recipes` | Existing create endpoint accepts ingredients JsonB |
| CreateRecipeModal | `src/components/food-logging/CreateRecipeModal.tsx` | Pre-populate with parsed results |
| Rate limiting | `src/utils/security/rateLimit.ts` | Apply to new parse endpoint |

## Open Questions

- Should the AI prompt attempt to detect serving count from the text (e.g., "serves 4") or always ask?
- What's the confidence threshold for auto-accept vs flag? (Could start at 0.8 and tune.)
- Should we store the original free text on the recipe for reference?
- Max input length? Current food parse is capped — recipes could be longer.

## Next Steps

→ `/workflows:plan` for implementation details
