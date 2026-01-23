# iOS App Store Distribution

**Date:** 2026-01-23
**Status:** Parked for future
**Priority:** When discovery becomes bottleneck

## What We're Building

A thin Capacitor wrapper around the existing baisics.app web experience, with minimal native polish to pass App Store review. Goal is **distribution/discovery**, not native features.

## Why This Approach

- **Distribution first:** App Store search visibility is the goal, not offline sync or HealthKit
- **Web-first stays true:** Continue building for web, mobile gets it "for free"
- **Minimal maintenance:** Single codebase with thin native shell
- **1-2 week effort:** Feasible scope for solo developer

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Simplified Capacitor | Best balance of effort vs. acceptance risk |
| Offline support | Graceful degradation only | Not blocking for v1, can add later |
| Native features | Tab bar, haptics, safe areas | Minimum to pass 4.2 review |
| Android | PWA | App Store discovery less valuable there |
| Push notifications | Defer to v2 | Retention lever, not discovery |
| HealthKit | Defer to v2 | Nice-to-have, not core |

## What's In Scope (v1)

- Static export configuration
- Fix any SSR-dependent code paths
- Capacitor setup + iOS project
- Native tab bar component
- Haptic feedback on key interactions
- iOS safe area handling
- App icon + splash screen
- Graceful offline state (error screen, not broken)
- TestFlight + App Store submission

## What's Out of Scope (v1)

- Offline sync queue / localStorage persistence
- SQLite database
- Native rest timer
- Push notifications
- HealthKit integration
- Apple Watch
- Android native app

## Technical Notes

### Static Export

Capacitor requires `output: 'export'` in next.config.ts:
- API routes stay on Vercel, called via HTTPS
- Server Components with data fetching need refactor to client-side
- Server Actions need refactor to API calls
- Middleware won't run

### 4.2 Review Risk

Apple rejects "web wrappers." Mitigation:
- Native tab bar (not hamburger menu)
- Haptic feedback
- iOS safe area handling
- Graceful offline screen

### Prerequisites

- Apple Developer Account ($99/year)
- Xcode 16+ on macOS
- Physical iOS device for testing
- AASA file for Universal Links (magic link auth)

## Rough Effort

**Week 1:** Static export + Capacitor setup + tab bar
**Week 2:** Polish + TestFlight + submission

## Open Questions

1. Do we have access to deploy AASA file to baisics.app/.well-known/?
2. Physical iOS device available for testing?
3. What's the current Server Action / SSR usage that needs refactor?

## References

- Existing detailed plan: `plans/feat-ios-app-store-conversion.md`
- Capacitor docs: https://capacitorjs.com/docs
- App Store 4.2 guidelines: https://developer.apple.com/app-store/review/guidelines/

## When to Pursue

Pick this up when:
- Core web experience is solid
- Retention metrics look good (people who try it, stick)
- Ready to invest in discovery/growth
