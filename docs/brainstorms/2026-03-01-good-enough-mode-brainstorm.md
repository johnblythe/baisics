---
date: 2026-03-01
topic: good-enough-estimation-mode
issue: "#430"
related: "#380, #378, #381, #386"
status: brainstorming
---

# "Good Enough" Estimation Mode — Brainstorm

## Context

Most people quit food logging because it's too precise too fast. "Good Enough" mode lets users describe food naturally and get reasonable macro estimates without weighing, measuring, or searching databases. Consistency > accuracy for behavior change.

## Existing Building Blocks

The system already has: AI parse-text (natural language → structured entries), AI estimate modal, `isApproximate` flag, staples/copy/recipes for fast repeat logging, source tracking. The gap is more about **framing and flow** than raw capability.

---

## Ideas to Vet

### A: Mode Shift — "T-Shirt Sizing"

A lower gear for logging. Still logging food, but tuned for speed over precision.

- Portions become t-shirt sizes (S/M/L/XL) → AI maps to reasonable grams
- Meals become composite entries ("chicken stir fry") instead of itemized lists
- Daily view shifts from macro bars to directional scorecard (on track / off track)
- AI text input is the default, search is de-emphasized
- Weekly rolling averages matter more than daily precision

### B: "Confirm or Correct"

System learns patterns and pre-fills your day based on history. Logging becomes editing rather than creating.

- Wake up → log already says "Breakfast: oatmeal + protein shake (like Tuesday)"
- One-tap confirm or correct
- Gets smarter over time via AI pattern intelligence (#378)
- Lowest friction for users with consistent habits (most people)

### C: "Meal Slots"

Define 3-5 template meals per slot. Each day, pick which template you ate — or "something else" for AI parse.

- Leans into the reality that most people eat 10-15 meals on rotation
- Staples and recipes already exist — this makes them the primary interface
- "Something else" escape hatch triggers freeform AI input
- Could surface as a quick-pick grid per meal slot

### D–E: Parked Ideas

- **D: Running Tally** — no meals, no structure, just a running cal+protein counter. "+400 cal, +30g protein" per eating event.
- **E: Photo Log** — snap plate photo, AI estimates, one-tap confirm. Camera stub already in QuickInput.

---

## Key Discovery: Most of This Already Exists

During brainstorming we found the building blocks are already in place:

- **Subjective quick check-in** — already built in `NutritionLogModal.tsx` as a fallback (Struggled ~50% / On track ~80% / Nailed it 100%). Saves adherence note via `/api/nutrition/log`. Currently buried — only shows when no values entered.
- **AI parse-text** — freeform natural language → structured entries, already works
- **QuickFoods/staples** — repeat meal logging, already works
- **History-first matching** — the ONE missing piece. Parse-text currently sends everything to AI; should fuzzy-match user's QuickFoods/staples/recipes first, only hit AI for genuinely new foods.

The real "Good Enough" may not be a new feature — it's **smarter surfacing and composition of existing pieces**.

---

## Idea F: Missed-Day Email Nudge (Favorite)

Daily email sent when no food is logged for the day. Configurable setting (on/off + time).

### How It Works

- **Trigger**: No food logged by user-configured time (default ~7pm?)
- **Email subject**: "Quick check — how'd you eat today?"
- **Email body** (progressive funnel, easiest first):
  1. **One-tap buttons in email**: Struggled / On track / Nailed it → deep links that auto-log the check-in for that specific day
  2. **"Want to log details?"** → link to food log page for that date
  3. **"Log with voice/text"** → link to QuickInput focused
- **Backfill**: Email is timestamped to the missed day. URI params encode the target date. Tapping the button a day later or 5 days later still applies to the original missed day. No expiration.
- **Stacking behavior**:
  - MVP: one email per missed day (simple)
  - V2: batch after 2+ consecutive misses — one email: "You've missed 3 days" with a row of buttons per day. Reduces nag factor.

### Why This Is Good

- Zero-friction entry point — one tap from email, streak preserved
- Meets users where they are (inbox) instead of requiring app open
- Naturally tiers engagement: quick check-in → detailed log → full logging
- Backfill mechanic means no "lost days" guilt
- Email is the nudge AND the interface

---

## Emerging Synthesis: "Smart Entry Point"

Rather than a single new mode, the "Good Enough" concept may be a **triage layer** that routes users to the right level of detail:

- Typed something specific → match history/QuickFoods first, AI for unknowns
- Typed something vague ("ate okay today") → route to quick check-in
- Didn't log by evening → email with one-tap check-in buttons
- Opened the app proactively → full logging experience (current)

---

## Open Questions

- Email provider — Resend already set up? Cron job or edge function for the trigger?
- What does a quick check-in entry look like in the daily/weekly view alongside real food entries?
- Should the check-in percentages be customizable or are Struggled/On track/Nailed it fixed?
- Does a check-in day count the same as a logged day for streak purposes?
- How does the weekly compliance view handle mixed days (some logged, some check-in)?

## Next Steps

- Continue divergent brainstorming or converge?
- Explore how check-in data displays in daily/weekly views
- Decide what to prototype first
