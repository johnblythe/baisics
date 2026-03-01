# Gym Buddy — Shared Food Library

**Date:** 2026-03-01
**Issue:** #428
**Status:** Ready for planning

## What We're Building

A "Gym Buddy" pairing system where connected users automatically share their food libraries — recipes, quick foods, and staples. No per-item sharing. Connect once, everything pools.

Up to 5 buddies per user. All free tier.

## Why This Approach

Per-item sharing (share button → accept/decline) adds friction to every interaction. Couples and gym partners eating the same meals want **zero extra steps** — they just want each other's stuff to appear.

Gym Buddy = one-time pairing, automatic library pooling.

**Competitive edge:** MFP has no equivalent. Strong viral loop (invite partner = new user).

## Key Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Share model | Auto-pool entire library | Zero friction vs per-item sharing |
| UI treatment | Unified lists + buddy attribution pill | Option A — fast access, still know who created what |
| Invite flow | Share link / 6-digit code | No email required. Like game friend codes. |
| Tier | All free, up to 5 buddies | Maximize viral growth. Monetize later. |
| Shared content | Recipes, Quick Foods, Staples only | No logged meals (that's accountability — see #383) |
| Buddy edits | Read-only; fork to customize | Buddy's items appear but only they can edit originals |
| Visibility | Buddy items visible in search, quick add, pantry | Everywhere your own items appear, buddy items appear too |

## What's Shared

| Content Type | How It Appears |
|-------------|---------------|
| **Recipes** | In recipe list + search, with buddy avatar badge |
| **Quick Foods** | In quick food pills/bar, with buddy badge |
| **Staples** | In staple suggestions per meal slot, with buddy badge |

## What's NOT Shared

- Food log entries (what you actually ate today)
- Nutrition targets/plans
- Workout data
- Account settings

## Data Model Sketch

```
GymBuddyGroup
  id
  code (6-char unique, for joining)
  inviteUrl (nanoid-based)
  createdById (user who created)
  maxMembers (default 5)
  timestamps

GymBuddyMembership
  id
  groupId → GymBuddyGroup
  userId → User
  joinedAt
  role (OWNER | MEMBER)
```

No need to duplicate food data — queries just expand to include `userId IN (my buddies)` alongside `userId = me`.

## UX Flow

### Pairing
1. User goes to Settings or Pantry → "Gym Buddy" section
2. Tap "Create Group" → get a 6-digit code + share link
3. Partner opens link or enters code → instant pairing
4. Both see each other's libraries immediately

### Daily Use
- Open nutrition → quick foods bar shows buddy items with small avatar
- Search recipes → buddy recipes appear with badge
- Staple suggestions → buddy staples appear per meal slot
- Tap buddy item → log it like your own (creates YOUR food log entry)

### Attribution
- Small circular avatar or colored dot on buddy items
- Tooltip/tap to see "From Sarah's library"
- Optional: filter to show only your items or only buddy items

## Open Questions

- Should there be a "leave group" flow or just remove via settings?
- When a buddy deletes a recipe, does it disappear from everyone's view? (Probably yes — it's a live reference, not a copy)
- Group naming? Or just show member avatars?

## Related Issues

- #383 — Social & accountability features (future: shared logs, streaks)
- #381 — Speed-of-logging innovations (buddy library = faster logging)
- #427 — Unify food tables (may simplify buddy queries)
