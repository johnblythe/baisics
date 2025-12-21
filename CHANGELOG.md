# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Fix middleware auth bypass that allowed unauthenticated access to protected routes (#159)
- Add auth checks to 8 previously unprotected API routes (email, generate-token, program-creation/*)
- Add IP-based rate limiting to AI endpoints and auth routes
- Secure `/api/email` to prevent open relay abuse (self-only restriction)
- Secure `/api/auth/generate-token` to prevent token generation for other users

### Added
- `.env.example` documenting all required environment variables
- `vercel.json` with function timeouts (60s for AI routes) and security headers
- `src/utils/security/rateLimit.ts` for basic IP-based rate limiting
- Suspense boundary for `/library` page to fix static generation

### Fixed
- Stripe API version mismatch causing type errors
- ESLint unescaped entity errors in UpsellModal and test files
- Type errors in ConversationalInterface and progress route

### Changed
- Remove debug console.log statements from API routes
- Audit NEXT_PUBLIC_ env vars (all verified safe)

### Added
- A/B testing for UpsellModal with 3 honest variants (#156)
  - Variant A: Program preview with blurred content teaser
  - Variant B: Benefits list with icon cards
  - Variant C: Minimal single-CTA with subtle Pro upsell
  - `useABTest` hook tracks view/convert/dismiss events to GTM
  - Variants persist in localStorage for consistent user experience
- Test page at `/test/upsell-modal` for previewing all variants

### Changed
- UpsellModal redesigned with v2a styling (navy/coral/white palette)
  - Removed fake urgency timers and inflated stats
  - Single focused CTA per variant instead of dual Free/Pro columns
  - Simplified copy and streamlined forms

### Added
- Auto-assign program from template library when user claims via tool page (#149)
  - Tool-to-template matching service scores templates by goal, activity level, body fat
  - Macro calculator results map to appropriate hypertrophy/strength programs
  - Body fat estimator results map by difficulty and category
  - Welcome banner persists until first workout or new program creation
  - "Make Your Own (~1 min)" CTA for custom program generation

### Fixed
- MealPlanDisplay: coral border now shows on all expanded meals, not just the first (CSS specificity fix)
- ProgramSelector: fix white text on white background by removing dark mode classes, use consistent project colors

### Added
- Exercise library with 873 exercises imported from free-exercise-db (public domain)
  - Images, instructions, target/secondary muscles, difficulty, equipment data
  - New `images` field on ExerciseLibrary model
  - `NECK` added to MuscleGroup enum
  - Import script: `npm run import:exercises`
- Exercise matcher utility for linking AI-generated exercises to library entries
  - Exact match with normalization (DB→Dumbbell, BB→Barbell)
  - Pre-resolves exercises before program save for better data linking
  - See #128 for future AI-assisted fuzzy matching enhancement

### Changed
- Upgraded AI models for better quality and speed
  - Opus 4.5 for high-value tasks: program generation, body composition analysis
  - Sonnet 4.5 for high-volume tasks: meal prep, nutrition parsing, chat
  - Configurable via `OPUS_MODEL` and `SONNET_MODEL` env vars

- Meal Prep Helper feature at `/meal-prep` (#124)
  - AI-generated meal plans targeting user's daily macros from their program
  - Configurable meals per day (2-6) and planning duration (1-7 days)
  - Dietary preferences: high-protein, quick meals (free), vegetarian, dairy-free, gluten-free, budget-friendly, low-carb (Pro)
  - Expandable meal cards showing ingredients, macros per meal, prep time, instructions
  - Auto-generated grocery list grouped by category with checkboxes
  - Copy grocery list to clipboard, export for Pro users
  - Save/load meal plans via localStorage (Pro only)
  - Free tier: 1-day plans, basic preferences; Pro tier: multi-day, all preferences, save plans
  - CTA banner on `/nutrition` page linking to meal prep
- Nutrition tracking feature with daily macro logging (#98)
  - NutritionLog model with unique constraint per user/date (LRU upsert)
  - API routes: log (upsert), history (with summary stats), parse (Claude Vision for MFP screenshots)
  - NutritionLogModal with quick entry and screenshot import tabs
  - Auto-computes calories from macros (P×4, C×4, F×9), or accepts calories-only
  - Pre-fills form when editing existing entry, shows info banner for updates
  - NutritionWidget dashboard card showing 7-day adherence and averages
  - "Log Nutrition" button next to "Start Workout" on dashboard
- Nutrition history page at `/nutrition` (#98)
  - Calendar view with logged days highlighted, click to log/edit
  - 14-day trends chart with dual Y-axis (calories + protein)
  - List view showing all logs with macros and calories
  - Links from dashboard widget header
- MacroDisplay component with visual donut chart for nutrition data (#104)
  - SVG donut shows caloric percentage breakdown (P×4, C×4, F×9)
  - Color-coded legend with gram values
  - Compact variant for dashboard, full variant for program review

### Changed
- Redesigned Program Review page with v2a design system (#102)
  - Sticky phase navigation tabs with progress indicator
  - Collapsible workout day cards matching StreamingPhasePreview style
  - Exercise category badges (PRI, SEC, ISO, CAR, FLX)
  - Quick jump links for programs with 4+ workouts
  - Phase cards with key focus areas, nutrition summary, macro pills
- Redesigned DisclaimerBanner to be collapsible and less intrusive
  - Collapsed by default with "Health notice" summary
  - Expandable bullet points instead of wall of text
  - Warm amber color scheme instead of jarring blue

### Added
- StreamingPhasePreview component shows phases as they generate with expandable workouts
- Design preview page (`/hi/design-preview`) for testing UI states without real generation
- Streaming parser utility for incremental JSON parsing

### Changed
- Redesigned `/hi` flow to match v2a design system (Outfit font, white bg, navy/coral palette)
  - Updated Header, Footer, MainLayout with consistent styling
  - Simplified DataReviewTransition to 4 condensed cards with better CTA hierarchy
  - GeneratingProgramTransition shows real-time phase previews during generation
  - ConversationalInterface uses white card styling with coral accents

### Fixed
- Streaming SSE "Controller already closed" error - added guard flag
- React closure bug in useStreamingGeneration - use refs to avoid stale options
- Dark background void between content and footer in MainLayout

### Security
- Add prompt injection protection for user-provided inputs (#115)
  - Sanitization utility filters known injection patterns (instruction override, role hijacking, prompt extraction)
  - System prompt guardrails tell model to treat user data as DATA not instructions
  - Logging for suspicious input monitoring
  - 19 unit tests for sanitization logic
  - Fixed false positives: "Respond with" alone no longer triggers (must have suspicious suffix)

### Added
- Exercise `sortOrder` field to guarantee display order in database queries
- Streaming program generation with real-time progress UI
  - `useStreamingGeneration` hook for consuming SSE stream
  - Progress bar and stage-by-stage completion in GeneratingProgramTransition
  - `/api/programs/generate/stream` endpoint now used by `/hi` flow
- Post-processing sort for exercise ordering - guarantees primary → secondary → isolation (#108)
- Vitest testing framework with integration tests for exercise ordering (#108)
- `npm run test:integration` script for running API integration tests
- JSON repair function for handling truncated AI responses
- Landing page variants (v2, v2a, v2b, v2d) with distinct color palettes for A/B testing (#101)
- Coach mode database migration
- Test plan document for QA workflow

### Fixed
- Exercise ordering now persists correctly - added `sortOrder` DB field and `orderBy` to all queries (#108)
- Normalize invalid AI measure types (circuit, rounds) to valid values before validation
- TawkChat only loads in production (no more chat widget in dev)
- Exercise ordering in generated programs - added emphatic prompt rules with examples (#108)
- Returning user flow not recognizing existing data - now passes existing intake to extraction prompt (#107)
- Session loading race condition in ConversationalIntakeContainer
- JSON truncation for multi-phase programs - increased max_tokens and added repair logic
- Wired up unified program generation service to ConversationalInterface - was calling old 6-7 endpoint flow
- Fixed stale userId bug in handleDataReviewConfirm - React state async issue causing empty userId in redirects
- Fixed JSON parsing for Claude Sonnet 4 responses - strips markdown code blocks before parsing
- Removed redundant intake save - unified service already handles it
- Updated Supabase ports to 5433X range to avoid conflicts with other local projects

### Changed
- Updated Claude model names from `-latest` aliases to specific versions (claude-sonnet-4-20250514)

### Previously Added
- Unified program generation service (`src/services/programGeneration/`) that consolidates all program creation into 1-2 AI calls instead of 6-10 sequential calls
- New `/api/programs/generate` endpoint for all program generation flows
- Streaming generation endpoint (`/api/programs/generate/stream`) with Server-Sent Events for real-time progress updates
- `ProgramGenerationProgress` component showing visual progress through generation stages
- `useProgramGeneration` React hook for consuming streaming generation
- `/dashboard/new-program` page with program type selection (similar, new focus, fresh start)
- Zod validation schemas for generated programs
- Implementation plan document for v2 roadmap
- Quick Workout Start card at top of dashboard with prominent "Start Workout" button
- Smart Program Continuation UI when program is complete (similar, new focus, fresh start options)
- Check-in feedback service (`src/services/checkInFeedback/`) for informing program generation with user history
- Working rest timer in `RestPeriodIndicator` with countdown, play/pause, and reset controls
- Progress photos comparison feature with side-by-side and slider overlay views
- Weekly summary emails with workout stats, weight progress, and streak tracking
- Exercise swap feature to substitute exercises mid-workout with similar alternatives
- Social sharing: shareable program cards, OG image generation, achievement sharing
- Coach Mode: trainer dashboard, client management, invite system (`/coach/dashboard`)
- Program template library with 7 popular templates (Starting Strength, PPL, 5/3/1, PHUL, etc.)
- Public share page for programs (`/share/[programId]`) with social meta tags

### Changed
- `/hi` conversational flow now uses unified generation service (faster generation)
- Simplified extraction prompt: removed confidence scores, now just tracks required vs optional fields
- `/dashboard/new-program` now shows real-time progress during generation
- `convertToIntakeFormat` updated to handle both legacy (confidence scores) and new (direct values) formats
- Updated Stripe API version to 2025-02-24.acacia
- Dashboard responsive layout improvements (stacking on mobile, responsive widths)
- Activity legend in dashboard wraps properly on mobile
- Program generation now uses weight trends, wellness metrics, and body measurements from check-ins
- MainLayout uses proper flex structure with sticky footer behavior
- Workout page set inputs stack vertically on mobile
- Database schema: added `CoachClient` model and `isCoach` field on User for coach mode

### Fixed
- Removed outdated TODO comments in WorkoutPlanDisplay

## SLATED

- Add nutrition parsing from uploaded file
- Add nutrition tracking
- Program library
- Program search
- Edit workouts

## [0.1.4] - 2025-02-06

### Added
- Upload workouts from file
- Create new program
- Choose program

## [0.1.3] - 2025-02-04

### Added
- Google Analytics integration
- GTM integration
- Variant testing for landing page

### Fixed
- PDF data and type expectations

## [0.1.2] - 2025-01-29

### Added
- Blog page and articles

### Fixed
- Miscellaneous bugs and improvements

## [0.1.1] - 2025-01-22

### Removed
- Removed testing portions of /hi convo box
- 

## [0.1.0] - 2025-01-22

### Added
- Macros guide modal
- Beta signup after program creation

### Changed
- Landing page only allowing beta signups, now allows initial /hi route usage

## [0.0.7] - 2025-01-21

### Fixed
- Fixed the extraction prompt to handle multiple training goals
- Other misc items found 

## [0.0.6] - 2025-01-21

### Added
- Progress photo stats display and updating functionality
- Activity chart on dashboard
- Recent activity display

### Changed
- Refactored dashboard to use simpler types and more API routes
- Improved mobile UX on /hi page
- Updated upsell modal for mobile devices
- Enhanced first workout display UX

### Fixed
- Dashboard type system cleanup and improvements
- Progress photos display and update mechanism
- User intake improvements

## [0.0.5] - 2025-01-20

### Added
- Enhanced check-in system with comprehensive stats tracking
- Wellness metrics tracking (sleep, energy, stress levels)
- Detailed body measurements tracking
- Progress photo management with type categorization
- Image upload functionality in conversational interface
- Workout logging system with status tracking
- Email verification system
- Stripe integration preparation

### Changed
- Improved exercise schema with intensity and measurement types
- Enhanced user profile with additional fields
- Updated landing page with new value propositions
- Refined program modification request handling
- Improved database indexing for better performance

### Fixed
- Database constraints and foreign key relationships
- Workout plan optional fields handling
- Image upload error handling
- Program modification error handling

## [0.0.4] - 2025-01-17
### Added
- Stripe webhook integration and middleware
- Enhanced payment link security
- Subscription validation system
- Program review tweaking
- Improved reps display on workout interface

### Fixed
- Payment link popup protection issues
- Database unique constraints

## [0.0.4] - 2025-01-17
### Added
- Disclaimer banner and components
- Support chat widget integration
- Review step for program creation
- Admin notification system for signups
- Exercise video listings
- Confetti animations for achievements

### Changed
- Enhanced PDF generation and exercise groupings
- Improved exercise measure formatting
- Updated layout and content page uniformity

### Fixed
- Repetition computation issues
- PDF generation bugs
- Warmup/cooldown data handling

## [0.0.3] - 2025-01-08
### Added
- Magic link authentication
- Dark mode implementation
- Basic email flows and templates
- Admin email management
- Progress picture stats
- Body composition assessment

### Changed
- Improved authentication flow
- Enhanced upsell experience
- Updated landing page styling

### Fixed
- Authentication sign-in issues
- Build preparation fixes
- Header display issues

## [0.0.2] - 2024-12-30
### Added
- Complete workout interface
- Exercise logging system
- Rest period animations
- Set completion tracking
- Dashboard improvements
- Activity tracking
- Progress pictures
- Weight check-ins

### Changed
- Enhanced dashboard UI
- Improved workout logging UX
- Updated navigation system

### Fixed
- Program name and description saving
- Exercise logging cleanup
- Various UI/UX improvements

## [0.0.1] - 2024-11-05
### Added
- Initial project setup
- Basic landing page
- Image upload with dropzone
- Body composition analysis using AI
- Base64 image handling
- Basic intake form
- Initial workout planning
- Exercise library foundation

### Changed
- Improved prompt engineering
- Enhanced data handling
- Refined intake process

### Fixed
- Body fat percentage calculation issues
- Image upload handling
- Basic data flow

[0.0.5]: https://github.com/johnblythe/baisics/compare/v0.0.4...HEAD
[0.0.4]: https://github.com/johnblythe/baisics/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/johnblythe/baisics/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/johnblythe/baisics/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/johnblythe/baisics/releases/tag/v0.0.1 