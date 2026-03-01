---
date: 2026-02-23
topic: food-staples
issue: "#376"
---

# Food Staples — Handle by Exception

## What We're Building

A "pinning" system that lets users assign frequently-eaten foods or recipes to meal slots. Pinned items (staples) appear as a carousel in each meal slot on the Log Food page, auto-logged by default. Users only intervene when something changes — "handle by exception."

## Key Decisions

- **Staple = pin, not content type**: A staple is a meal-slot assignment referencing an existing food or recipe. No new content type to create or manage.
- **Auto-log by default**: Staples count toward the day unless dismissed. User setting to flip to "require tap" mode.
- **Greyed-out visual state**: Staples appear visually distinct from manually-logged foods (pending vs confirmed).
- **Carousel per meal slot**: Multiple staples per slot, swipeable (arrows + dots). Force-ranked by recency/frequency.
- **Sits above "+ Add" button**: Carousel is a suggestion layer. Normal logging flow untouched underneath.
- **End-of-day auto-confirm**: Uninteracted staples get logged. Dismissed ones don't.
- **No new tab**: Staple management lives on the Log Food page (carousel edit icon) and as actions on recipes/foods.

## Data Model

```
Staple = {
  userId
  mealSlot: BREAKFAST | LUNCH | DINNER | SNACK
  itemType: RECIPE | QUICK_FOOD | FOOD_ENTRY (for single foods)
  itemId: references recipe or quick food
  schedule: DAILY | WEEKDAYS | WEEKENDS | CUSTOM
  customDays: [MON, TUE, ...] (if CUSTOM)
  sortOrder: position in carousel
  isActive: boolean
}
```

## Meal Slot Layout

```
┌─ Breakfast ──────────────────────────┐
│  ◀ [Protein Yogurt + Berries] ▶  ○●○ │  ← staple carousel (greyed)
│                                       │
│  Logged item 1                        │  ← manually logged foods
│  Logged item 2                        │
│                                       │
│  + Add breakfast                      │  ← always present
└───────────────────────────────────────┘
```

## Entry Points to Create Staples

1. **From carousel**: "Add a staple here" button in empty carousel
2. **From logged meal**: "Pin to [Breakfast] as staple" action
3. **From recipes**: "Pin to meal slot" action
4. **From food search**: long-press → "Make this a staple"
5. **Auto-suggested**: After 4+ identical meal logs in 2 weeks → prompt

## Carousel Behavior

- Default staple = most-recently-used or most-frequently-used, shown first
- Swipe left/right or click arrows to browse alternatives
- Dots indicate position / number of options
- Tapping the active staple = confirm (visual state changes from greyed to solid)
- Dismiss button (X) = "not eating this today"
- Edit/gear icon = manage staples for this slot (reorder, add, remove)

## User Settings

- `stapleAutoLog`: boolean (default: true) — auto-log at end of day vs require tap
- Per-staple scheduling (daily, weekdays, weekends, custom days)

## Phases (Future)

- Tag staples with phase: cutting / bulking / maintenance
- When user switches phase, staple set rotates automatically
- Deferred — not in MVP

## Related Issues

- #377 Macro Budget View (show discretionary macros after staple baseline)
- #378 AI Pattern Intelligence (auto-detect staples from history)
- #381 Speed-of-logging (staple confirm = 1-tap logging)

## Open Questions

- Should auto-confirm happen at a specific time (midnight? 9pm?) or truly end-of-day?
- On the carousel: show macro summary inline or only on expand/tap?
- When user confirms a staple, does it create a real FoodLogEntry immediately or batch at end of day?

## Next Steps

→ Plan implementation and build today
