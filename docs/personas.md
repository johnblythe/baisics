# Test Personas

Reference for seed data generation and local testing. Use with debug states in `src/lib/debug/`.

## Quick Reference

| # | Name | Type | Journey | Behavior | Tier |
|---|------|------|---------|----------|------|
| 1 | Marcus | gym bro PPL | cruising | meticulous | paid |
| 2 | Sarah | stay-at-home mom | early | sporadic | free |
| 3 | Jordan | home bands/DBs | week2 | minimal | free |
| 4 | Derek | former athlete | veteran | meticulous | paid |
| 5 | Priya | weight loss focus | cruising | streak_builder | paid |
| 6 | Alex | complete beginner | fresh | — | free |
| 7 | Chris | time-crunched pro | early | skipper | paid |
| 8 | Maya | runner adding strength | returning | minimal | paid |
| 9 | Robert | senior mobility | cruising | meticulous | free |
| 10 | Kim | injury recovery | week2 | skipper | free |
| 11 | Taylor | lapsed user | lapsed | sporadic | free |

---

## Journey States

| State | Workouts | Program % | Description |
|-------|----------|-----------|-------------|
| `fresh` | 0 | 0% | just signed up, no workouts |
| `early` | 3-5 | ~15% | still forming habit |
| `week2` | 6-8 | ~25% | check-in territory |
| `cruising` | 15-20 | ~50% | solid habit, mid-program |
| `veteran` | 40-50 | 90%+ | almost done with program |
| `complete` | 50+ | 100% | finished program |
| `returning` | 60+ | on 2nd program | repeat customer |
| `lapsed` | 12 | 30% | last workout 10+ days ago |

---

## Behavior Patterns

| Pattern | Description | Data Characteristics |
|---------|-------------|---------------------|
| `meticulous` | logs every set, adds notes, never skips | full set data, notes on exercises, consistent dates |
| `minimal` | marks workout complete, no details | workout logged, sparse set data |
| `skipper` | skips exercises, modifies workouts | incomplete exercise logs, substitutions |
| `streak_builder` | never misses scheduled days | long unbroken date sequences |
| `sporadic` | gaps in attendance, restarts often | irregular dates, gaps of 3-7 days |

---

## Persona Details

### 1. Marcus (Gym Bro PPL)
- **Type:** Intermediate lifter, push/pull/legs split
- **Journey:** `cruising` — 18 workouts, 50% through program
- **Behavior:** `meticulous` — logs weights, reps, RPE notes
- **Tier:** Paid
- **Equipment:** Full gym
- **Program:** 6-day PPL, 12 weeks
- **Sample data:** Progressive overload visible, bench from 185→205

### 2. Sarah (Stay-at-Home Mom)
- **Type:** Returning after 2 kids, rebuilding base
- **Journey:** `early` — 4 workouts, 15% through
- **Behavior:** `sporadic` — missed days due to kid schedules
- **Tier:** Free
- **Equipment:** Home gym basics (rack, barbell, DBs)
- **Program:** 3-day full body, 8 weeks
- **Sample data:** Gaps between workouts, lighter weights, building consistency

### 3. Jordan (Home Workout)
- **Type:** Apartment dweller, minimal equipment
- **Journey:** `week2` — 7 workouts, 25% through
- **Behavior:** `minimal` — marks done, doesn't log details
- **Tier:** Free
- **Equipment:** Bands, bodyweight, light dumbbells (5-25lb)
- **Program:** 4-day upper/lower, 6 weeks
- **Sample data:** Bodyweight exercises, band variations, basic completion

### 4. Derek (Former Athlete)
- **Type:** Ex-college football, wants big lifts back
- **Journey:** `veteran` — 45 workouts, 90% through
- **Behavior:** `meticulous` — tracks everything, focused on PRs
- **Tier:** Paid
- **Equipment:** Full gym, powerlifting focus
- **Program:** 4-day strength (5/3/1 style), 16 weeks
- **Sample data:** Heavy compounds, clear progression, PR attempts logged

### 5. Priya (Weight Loss Journey)
- **Type:** Down 30lbs, now adding muscle
- **Journey:** `cruising` — 20 workouts, 55% through
- **Behavior:** `streak_builder` — hasn't missed a day in 3 weeks
- **Tier:** Paid
- **Equipment:** Full gym
- **Program:** 4-day upper/lower, 12 weeks
- **Sample data:** 21-day streak, cardio notes, consistent attendance

### 6. Alex (Complete Beginner)
- **Type:** Never lifted, intimidated but motivated
- **Journey:** `fresh` — 0 workouts, just created program
- **Behavior:** N/A (no data yet)
- **Tier:** Free
- **Equipment:** Gym membership (unsure what to use)
- **Program:** 3-day full body beginner, 8 weeks
- **Sample data:** Program exists, no workout logs

### 7. Chris (Time-Crunched Pro)
- **Type:** Lawyer, 30-min lunch workouts max
- **Journey:** `early` — 5 workouts, 20% through
- **Behavior:** `skipper` — drops accessories, focuses on compounds
- **Tier:** Paid
- **Equipment:** Office building gym
- **Program:** 3-day full body express, 8 weeks
- **Sample data:** Incomplete exercise logs, skipped isolation work

### 8. Maya (Runner Adding Strength)
- **Type:** Marathon runner, needs injury prevention
- **Journey:** `returning` — 65 workouts across 2 programs
- **Behavior:** `minimal` — strength is supplement to running
- **Tier:** Paid
- **Equipment:** Home gym
- **Program:** 2-day maintenance (2nd program)
- **Sample data:** Completed first program, on program #2, light weights

### 9. Robert (Senior Mobility)
- **Type:** 67yo, active but careful
- **Journey:** `cruising` — 16 workouts, 50% through
- **Behavior:** `meticulous` — follows program exactly
- **Tier:** Free
- **Equipment:** Gym + home bands
- **Program:** 3-day mobility/strength, 10 weeks
- **Sample data:** Lighter weights, mobility work logged, no skipped days

### 10. Kim (Injury Recovery)
- **Type:** Shoulder surgery 6mo ago, cleared for lifting
- **Journey:** `week2` — 6 workouts, 20% through
- **Behavior:** `skipper` — avoids overhead, substitutes exercises
- **Tier:** Free
- **Equipment:** Full gym
- **Program:** 3-day modified full body, 10 weeks
- **Sample data:** Exercise substitutions, notes about shoulder, skipped OHP

### 11. Taylor (Lapsed User)
- **Type:** Started strong, life got in the way
- **Journey:** `lapsed` — 12 workouts, last one 14 days ago
- **Behavior:** `sporadic` — was consistent, then stopped
- **Tier:** Free
- **Equipment:** Gym membership
- **Program:** 4-day upper/lower, 8 weeks (stalled at 35%)
- **Sample data:** Good first 3 weeks, then gap, recovery screen territory

---

## Usage

### Finding personas by need:
- **Test streak UI:** Priya (streak_builder), Marcus (meticulous)
- **Test recovery screens:** Taylor (lapsed), Sarah (sporadic)
- **Test first-time UX:** Alex (fresh)
- **Test program completion:** Derek (veteran), Maya (returning)
- **Test free tier limits:** Sarah, Jordan, Alex, Robert, Kim, Taylor
- **Test paid features:** Marcus, Derek, Priya, Chris, Maya
- **Test minimal data handling:** Jordan (minimal), Chris (skipper)
- **Test detailed data display:** Marcus, Derek, Robert (meticulous)

### Seed file location:
`prisma/seed-data/personas/`

### Debug state pairing:
Use journey state with corresponding debug state for full testing:
- `fresh` → `first_workout`
- `early` → `first_workout_complete`
- `week2` → `week_2_checkin`
- `cruising` → `milestone_25`
- `veteran` → `program_almost_done`, `milestone_50`
- `complete` → `program_complete`
- `lapsed` → `missed_7_days`
