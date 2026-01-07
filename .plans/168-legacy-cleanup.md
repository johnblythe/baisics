# Issue #168: Legacy Code Cleanup Plan

**Branch**: `168-legacy-cleanup`
**Status**: ✅ Complete
**Created**: 2025-01-07
**Completed**: 2025-01-07

---

## 🔴 High Priority (Clear Dead Code)

| Item | Files | Status |
|------|-------|--------|
| Commented IntakeForm.tsx | `src/app/components/IntakeForm.tsx` | ⬜ Pending |
| Old landing pages (v2, v2a, v2b, v2d) | `src/app/landing-v2*/` (~89KB) | ⬜ Pending |
| Duplicate prompts | `src/app/start/prompts.ts` (438 lines) | ⬜ Pending |
| Duplicate A/B utils | `utils/abTest.ts` + `utils/ab-testing.ts` | ⬜ Pending |

---

## 🟡 Medium Priority (Issue #168 Core Scope)

| Item | Location | Status |
|------|----------|--------|
| Remove `USE_LEAN_GENERATION` flag | `services/programGeneration/leanGeneration.ts:356` | ⬜ Pending |
| Remove `generateProgram()` legacy | `services/programGeneration/index.ts:42` | ⬜ Pending |
| Remove `convertIntakeToProfile()` | `services/programGeneration/index.ts:544` | ⬜ Pending |
| Clean verbose prompt builders | `services/programGeneration/prompts.ts` | ⬜ Pending |

---

## 🟢 Low Priority (Test/Dev Artifacts)

| Item | Location | Status |
|------|----------|--------|
| Model comparison results | `model-comparison-results/` (29 JSON) | ⬜ Pending |
| Test pages | `/test/*`, `/compare` | ⬜ Pending |
| Comparison scripts | `scripts/compare-*.ts` | ⬜ Pending |

---

## 🔵 Verification Results

| Question | Items | Answer |
|----------|-------|--------|
| Is `/start` replaced by `/hi`? | `src/app/start/` | ✅ **Page is dead**, but `actions.ts` is actively used by 5 components |
| Are `program-creation/*` APIs dead? | 7 endpoints | ✅ **Zero callers** - safe to delete |
| Is `start/prompts.ts` used? | 438 lines | ✅ **Zero imports** - safe to delete |
| Which A/B utility is canonical? | `abTest.ts` vs `ab-testing.ts` | ⬜ TBD (only `abTest.ts` has imports) |

### `/start` Directory Breakdown:
- `page.tsx` - ❌ DELETE (only self-references, no external links)
- `prompts.ts` - ❌ DELETE (zero imports)
- `actions.ts` - ⚠️ PARTIAL KEEP - move 5 active functions to shared location

#### `actions.ts` Active Functions (KEEP):
| Function | Used By |
|----------|---------|
| `getUser` | ProgramDisplay, UpsellModal, review/page, ConversationalInterface |
| `updateUser` | UpsellModal |
| `createAnonUser` | ConversationalInterface |
| `getUserProgram` | ConversationalIntakeContainer |
| `getSessionIntake` | ConversationalIntakeContainer |

#### `actions.ts` Dead Functions (DELETE):
- `uploadImages`, `getSessionImages`, `deleteImage`, `createNewUser`
- `saveIntakeForm`, `getSessionPromptLogs`, `getUserByEmail`, `getProgram`
- `deleteWorkoutPlan`, `prepareWorkoutPlanObject`, `createNewProgram`, `preparePromptForAI`

---

## Cleanup Log

### Session 1 (2025-01-07)
- [x] Created cleanup plan
- [x] Created feature branch `168-legacy-cleanup`
- [x] Verified `/start` usage → page dead, actions.ts active
- [x] Verified `program-creation/*` API usage → zero callers, safe to delete
- [x] Verified `start/prompts.ts` → zero imports, safe to delete
- [x] Wrote tests for 5 active user actions (21 tests)
- [x] Phase 1: Delete clear dead code (7 items)
- [x] Phase 2: Extract 5 active functions to `src/lib/actions/user.ts`
- [x] Phase 3: Update imports in 5 components
- [x] Phase 4: Delete start/ directory entirely
- [x] Phase 5: Clean lean generation - removed feature flag, made lean-only
- [x] Final verification: 636 tests pass, TypeScript compiles

---

## Files to Delete

```
# Phase 1: Safe Deletes (verified zero usage)
src/app/components/IntakeForm.tsx          # commented out
src/app/landing-v2/                        # old landing
src/app/landing-v2a/                       # old landing
src/app/landing-v2b/                       # old landing
src/app/landing-v2d/                       # old landing
src/app/start/page.tsx                     # replaced by /hi
src/app/start/prompts.ts                   # zero imports
src/app/api/program-creation/              # zero callers (7 endpoints)
src/utils/ab-testing.ts                    # duplicate, zero imports

# Phase 2: After refactor
src/app/start/                             # after moving actions.ts

# Phase 3: Low Priority
model-comparison-results/                  # test artifacts
src/app/test/                              # test pages
src/app/compare/                           # comparison page
scripts/compare-*.ts                       # comparison scripts
```

## Files to Modify

```
# Consolidate A/B testing
src/utils/abTest.ts (keep)
src/utils/ab-testing.ts (merge into abTest.ts, then delete)

# Remove legacy generation
src/services/programGeneration/index.ts (remove generateProgram, convertIntakeToProfile)
src/services/programGeneration/leanGeneration.ts (remove feature flag, make lean default)
```
