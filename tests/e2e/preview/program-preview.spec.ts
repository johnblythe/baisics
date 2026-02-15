/**
 * Program Preview Page E2E Tests (Phase 3 - Preview Page Redesign)
 *
 * Tests for the ProgramDisplay component's preview behavior for
 * unauthenticated users vs authenticated users.
 *
 * ProgramDisplay renders different UI based on `userEmail`:
 * - When `userEmail` is falsy (unauthenticated/anonymous): Shows preview banner,
 *   value comparison card, locked phase tabs, combined locked phases section
 *   with email capture, and "Keep My Program" button.
 * - When `userEmail` is truthy (authenticated): Shows PDF/Share/Email buttons,
 *   no preview elements, all phases unlocked.
 *
 * Pages that use ProgramDisplay:
 * - /hi (ConversationalInterface) - inline after program generation
 * - /program/review?userId=X&programId=Y - public review page
 *
 * The /dev/preview-prototype page has a standalone mock that demonstrates
 * the preview design with mock data (does NOT use real ProgramDisplay).
 *
 * @see src/app/components/ProgramDisplay.tsx
 * @see src/app/dev/preview-prototype/page.tsx
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";

test.describe("Program Preview - Phase 3 Redesign", () => {
  test.describe.configure({ mode: "serial" });

  // ─────────────────────────────────────────────────────────────
  // Authenticated user tests (via /program/review with real data)
  // ─────────────────────────────────────────────────────────────

  test.describe("Authenticated user - program review page", () => {
    test("authenticated user does NOT see preview banner", async ({ page }) => {
      const marcus = getPersona("marcus");
      await loginAsUser(page, marcus.email);

      // Wait for dashboard to load (confirms authentication)
      await page.waitForURL("**/dashboard/**", { timeout: 15000 });

      // Dismiss "Welcome back" modal if it appears
      try {
        const dismissButton = page.getByText("Not today, remind me tomorrow");
        await dismissButton.waitFor({ state: "visible", timeout: 5000 });
        await dismissButton.click();
        await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
      } catch {
        // Modal might not appear, continue
      }

      // Navigate to /hi to check ProgramDisplay behavior for authenticated users
      // When an authenticated user is on /hi and generates a program, they get
      // redirected to /dashboard/[programId]. The ProgramDisplay in /hi would
      // pass localUser?.email which would be set for authenticated users.
      //
      // Instead of triggering a full program generation, we verify that the
      // dashboard (where authenticated users land) does NOT show preview elements.
      // The preview banner text "PREVIEW" with the pulsing dot only shows when
      // userEmail is falsy in ProgramDisplay.

      // Verify "PREVIEW" text is NOT visible on the dashboard
      const previewText = page.locator("text=Preview").first();
      await expect(previewText).not.toBeVisible({ timeout: 5000 });

      // Verify "Unlock full program" link is NOT visible
      const unlockLink = page.locator("text=Unlock full program");
      await expect(unlockLink).not.toBeVisible({ timeout: 3000 });
    });

    test("authenticated user does NOT see value comparison card", async ({
      page,
    }) => {
      const marcus = getPersona("marcus");
      await loginAsUser(page, marcus.email);
      await page.waitForURL("**/dashboard/**", { timeout: 15000 });

      // Dismiss modal if present
      try {
        const dismissButton = page.getByText("Not today, remind me tomorrow");
        await dismissButton.waitFor({ state: "visible", timeout: 5000 });
        await dismissButton.click();
        await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
      } catch {
        // Modal might not appear
      }

      // "Preview includes" and "Free signup unlocks" are value comparison card headers
      const previewIncludes = page.locator("text=Preview includes");
      await expect(previewIncludes).not.toBeVisible({ timeout: 3000 });

      const freeSignupUnlocks = page.locator("text=Free signup unlocks");
      await expect(freeSignupUnlocks).not.toBeVisible({ timeout: 3000 });
    });

    test("authenticated user does NOT see unlock section", async ({
      page,
    }) => {
      const marcus = getPersona("marcus");
      await loginAsUser(page, marcus.email);
      await page.waitForURL("**/dashboard/**", { timeout: 15000 });

      // Dismiss modal if present
      try {
        const dismissButton = page.getByText("Not today, remind me tomorrow");
        await dismissButton.waitFor({ state: "visible", timeout: 5000 });
        await dismissButton.click();
        await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
      } catch {
        // Modal might not appear
      }

      // The unlock section has id="unlock-program-section" and contains email capture
      const unlockSection = page.locator("#unlock-program-section");
      await expect(unlockSection).not.toBeVisible({ timeout: 3000 });

      // "Unlock Full Program" button (the email capture submit) should not be visible
      const unlockButton = page.getByRole("button", {
        name: /Unlock Full Program/i,
      });
      await expect(unlockButton).not.toBeVisible({ timeout: 3000 });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Dev prototype page tests (standalone mock with preview UI)
  // The /dev/preview-prototype page uses mock data to demonstrate
  // the full preview experience for design review.
  // ─────────────────────────────────────────────────────────────

  test.describe("Preview prototype page - unauthenticated UI elements", () => {
    test("preview prototype loads and shows preview banner", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // Preview banner should be visible with "Preview" label
      const previewLabel = page.locator("text=Preview").first();
      await expect(previewLabel).toBeVisible({ timeout: 10000 });

      // Should show "Phase 1 of 3" context
      const phaseContext = page.getByText("Phase 1 of 3");
      await expect(phaseContext).toBeVisible({ timeout: 10000 });

      // "Unlock full program" link should be visible
      const unlockLink = page.getByText("Unlock full program");
      await expect(unlockLink).toBeVisible({ timeout: 10000 });
    });

    test("preview prototype shows value comparison card", async ({ page }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // "Preview includes" column header
      const previewIncludes = page.getByText("Preview includes");
      await expect(previewIncludes).toBeVisible({ timeout: 10000 });

      // "Free signup unlocks" column header
      const freeSignupUnlocks = page.getByText("Free signup unlocks");
      await expect(freeSignupUnlocks).toBeVisible({ timeout: 10000 });

      // Preview items
      await expect(
        page.getByText("Phase 1 workouts (4 weeks)")
      ).toBeVisible({ timeout: 5000 });

      // Signup unlock items
      await expect(page.getByText("All 3 phases (12 weeks)")).toBeVisible({
        timeout: 5000,
      });
      await expect(
        page.getByText("Progress tracking dashboard")
      ).toBeVisible({ timeout: 5000 });
    });

    test("preview prototype shows 'Keep My Program' CTA (not 'Save & Share')", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // "Keep My Program" button should be visible (the Phase 3 copy change)
      const keepButton = page.getByText("Keep My Program");
      await expect(keepButton).toBeVisible({ timeout: 10000 });

      // "Save & Share" should NOT exist (old copy, replaced in Phase 3)
      const saveShareButton = page.locator("text=Save & Share");
      await expect(saveShareButton).not.toBeVisible({ timeout: 3000 });
    });

    test("preview prototype shows lock icons on Phase 2+ tabs", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // Phase navigation tabs should be visible
      const phase1Tab = page.locator("button", { hasText: "Phase 1" });
      await expect(phase1Tab).toBeVisible({ timeout: 10000 });

      const phase2Tab = page.locator("button", { hasText: "Phase 2" });
      await expect(phase2Tab).toBeVisible({ timeout: 10000 });

      const phase3Tab = page.locator("button", { hasText: "Phase 3" });
      await expect(phase3Tab).toBeVisible({ timeout: 10000 });

      // Phase 2 and 3 tabs should contain lock icon SVGs (they have disabled state)
      // The prototype uses SVG lock icons for locked phases
      const phase2LockIcon = phase2Tab.locator("svg");
      await expect(phase2LockIcon).toBeVisible({ timeout: 5000 });

      const phase3LockIcon = phase3Tab.locator("svg");
      await expect(phase3LockIcon).toBeVisible({ timeout: 5000 });
    });

    test("preview prototype shows locked phase sections with email capture", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // Locked phases should show "Unlock Phase N" heading
      const unlockPhase2 = page.getByText(/Unlock Phase 2/);
      await expect(unlockPhase2).toBeVisible({ timeout: 10000 });

      // Email input for unlocking should be present
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toHaveAttribute("placeholder", "your@email.com");

      // "Unlock Full Program" submit button
      const unlockButton = page
        .getByRole("button", { name: /Unlock Full Program/i })
        .first();
      await expect(unlockButton).toBeVisible({ timeout: 10000 });

      // Reassurance text about being free
      const freeText = page.getByText(/100% free/).first();
      await expect(freeText).toBeVisible({ timeout: 5000 });

      const noCreditCard = page.getByText(/No credit card/).first();
      await expect(noCreditCard).toBeVisible({ timeout: 5000 });
    });

    test("preview prototype shows benefits pills in locked section", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // Benefits listed as pills in the locked phases overlay
      await expect(page.getByText("All phases").first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText("PDF").first()).toBeVisible({
        timeout: 5000,
      });
      await expect(page.getByText("Dashboard").first()).toBeVisible({
        timeout: 5000,
      });
    });

    test("preview prototype has blurred content behind locked phases", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // The locked phase sections use blur-[2px] on the preview content
      // and have a white/80 backdrop overlay
      const blurredContent = page.locator(".blur-\\[2px\\]").first();
      await expect(blurredContent).toBeVisible({ timeout: 10000 });

      // The overlay is also present (backdrop-blur-sm)
      const overlay = page.locator(".backdrop-blur-sm").first();
      await expect(overlay).toBeVisible({ timeout: 10000 });
    });

    test("preview prototype - locked phase tabs are not clickable", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      // Phase 2 and 3 tabs should be disabled
      const phase2Tab = page.locator("button", { hasText: "Phase 2" });
      await expect(phase2Tab).toBeDisabled({ timeout: 10000 });

      const phase3Tab = page.locator("button", { hasText: "Phase 3" });
      await expect(phase3Tab).toBeDisabled({ timeout: 10000 });

      // Phase 1 tab should be enabled
      const phase1Tab = page.locator("button", { hasText: "Phase 1" });
      await expect(phase1Tab).toBeEnabled({ timeout: 10000 });
    });

    test("preview prototype has no critical JavaScript errors", async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (error) => {
        pageErrors.push(error.message);
      });

      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      const criticalErrors = [...consoleErrors, ...pageErrors].filter(
        (error) => {
          const lowerError = error.toLowerCase();
          if (lowerError.includes("favicon")) return false;
          if (lowerError.includes("hydration")) return false;
          if (lowerError.includes("failed to fetch")) return false;
          if (lowerError.includes("third-party")) return false;
          if (lowerError.includes("tawk")) return false;

          if (lowerError.includes("is not a function")) return true;
          if (lowerError.includes("is not defined")) return true;
          if (lowerError.includes("unexpected token")) return true;
          if (lowerError.includes("syntax error")) return true;

          return false;
        }
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // ProgramDisplay component tests (via /program/review)
  // These test the real ProgramDisplay component with real data.
  // Requires a valid userId + programId from the seeded database.
  // ─────────────────────────────────────────────────────────────

  test.describe("ProgramDisplay - unauthenticated preview via /program/review", () => {
    test.skip(
      true,
      `Requires a valid anonymous userId + programId to test the unauthenticated
       ProgramDisplay view via /program/review. Anonymous users have no email,
       so ProgramDisplay shows preview elements.

       To test manually:
       1. Go to /hi (unauthenticated)
       2. Complete the chat flow to generate a program
       3. After generation, you'll be redirected to /program/review?userId=X&programId=Y
       4. Verify: Preview banner with pulsing dot at top
       5. Verify: Value comparison card ("Preview includes" vs "Free signup unlocks")
       6. Verify: Phase 2+ tabs show lock emoji (🔒)
       7. Verify: Clicking locked tab scrolls to #unlock-program-section
       8. Verify: Combined locked phases section with blurred previews
       9. Verify: Email capture form (input + "Unlock Full Program" button)
       10. Verify: "100% free - No credit card" reassurance text
       11. Verify: "Keep My Program" button (not "Save & Share")
       12. Verify: Benefits pills (Unlock all phases, Personalized nutrition, etc.)

       To automate this test in the future:
       - Create a test fixture that generates a program for an anonymous user via API
       - Use the returned userId + programId to navigate to /program/review
       - Or: seed an anonymous user with a program in the test database`
    );

    test("placeholder - unauthenticated user sees preview banner and value comparison", async ({
      page,
    }) => {
      // This test body won't execute due to test.skip above
      // Kept as documentation of expected behavior
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Copy verification tests
  // Verify that Phase 3 copy changes are reflected across the app
  // ─────────────────────────────────────────────────────────────

  test.describe("Phase 3 copy changes", () => {
    test("'Save & Share' copy does NOT appear on /hi page", async ({
      page,
    }) => {
      // Navigate to /hi (public page, no auth needed)
      await page.goto("/hi");
      await page.waitForLoadState("networkidle");

      // "Save & Share" should not appear anywhere on the page
      // (replaced with "Keep My Program" in Phase 3)
      const saveShareText = page.locator("text=Save & Share");
      await expect(saveShareText).not.toBeVisible({ timeout: 5000 });
    });

    test("'Save & Share' copy does NOT appear on preview prototype", async ({
      page,
    }) => {
      await page.goto("/dev/preview-prototype");
      await page.waitForLoadState("networkidle");

      const saveShareText = page.locator("text=Save & Share");
      await expect(saveShareText).not.toBeVisible({ timeout: 5000 });
    });
  });
});
