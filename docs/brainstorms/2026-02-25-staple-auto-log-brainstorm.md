---
date: 2026-02-25
topic: staple-auto-log
issue: "#398"
---

# Staple Auto-Log

## What We're Building
When a user opens /nutrition, auto-create `FoodLogEntry` rows for today from their staples marked `autoLog: true`. Entries are real, editable, deletable — just like manually logged food. A small badge indicates auto-logged origin.

## Why This Approach
- **Page-load trigger** — no infra (cron/jobs), entries appear the moment the user needs them
- **DB dedup via stapleId + date** — reliable across devices, no client-side state drift
- **Normal entries** — no new UI states (pending/confirm/ghost). YAGNI. Users can delete if they skipped that staple today
- **Today only** — no backfill complexity. Missed days are just missed

## Key Decisions
- **Trigger**: API call on page load (not cron, not button)
- **Dedup**: Query `FoodLogEntry WHERE stapleId IN (...) AND date = today` before inserting
- **UX**: Real entries with small auto-log indicator (clock icon or "auto" badge)
- **Scope**: Current date only, no historical backfill
- **Source**: `source: 'STAPLE'` + `stapleId` (already supported by food-log POST)

## Open Questions
- Should the auto-log API be a new endpoint (`POST /api/food-staples/auto-log`) or folded into the existing food-log GET?
- Toast notification when staples are auto-logged? ("3 staples added to today's log")
- Should deleting an auto-logged entry prevent it from being re-created on next page load (same-day)? (Probably yes — the stapleId+date dedup handles this naturally since we'd delete the row, but we need to track "user dismissed this today" somehow)

## Next Steps
→ `/workflows:plan` for implementation details
