import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Phase 4: Post-Signup Success Modal
 *
 * The UpsellModal appears on program preview pages for unauthenticated users.
 * After submitting an email, the modal transitions from the signup form to a
 * SuccessView showing unlocked features and navigation CTAs.
 *
 * Full-flow tests require:
 * - A shareable program preview URL (unauthenticated access)
 * - UpsellModal trigger (locked phase click or "Keep My Program" CTA)
 * - Email submission via /api endpoint
 *
 * These tests are structured as skipped placeholders for the full flow,
 * plus a structural verification that reads the component source directly.
 */

test.describe("Post-Signup Success Modal", () => {
  test.describe.configure({ mode: "serial" });

  test.skip("shows success modal after email signup on preview page", async ({ page }) => {
    // PREREQUISITES:
    // - A program must exist with a shareable preview URL
    // - The URL format is: /hi?userId=<id>&programId=<id> (post-onboarding preview)
    //
    // MANUAL TEST STEPS:
    // 1. Navigate to a program preview page as unauthenticated user
    // 2. Scroll down to see locked phases or wait for UpsellModal auto-trigger
    // 3. Click "Keep My Program" or interact with locked phase to open UpsellModal
    // 4. Enter a valid test email (e.g., test-e2e-{timestamp}@test.baisics.app)
    // 5. Submit the form
    // 6. Wait for success state transition
    //
    // EXPECTED RESULTS:
    // - "You're In!" header appears (with celebration emoji in UI)
    // - Coral gradient header with CSS confetti animation
    // - Checkmark icon with pop-in animation
    // - "Your full program is now unlocked" subheader
    // - 5 unlocked features listed:
    //   1. All program phases unlocked
    //   2. Personalized nutrition plan
    //   3. Progress tracking dashboard
    //   4. PDF export
    //   5. Food logging & meal planning
    // - "Go to My Dashboard" link pointing to /dashboard
    // - "Continue viewing program" secondary link
    // - "Check your email for a welcome message at {email}" note
    //
    // VERIFY BEHAVIOR:
    // - Success view does NOT auto-close (user must click a CTA)
    // - No ReactConfetti canvas element (CSS-only confetti)
    // - Clicking "Go to My Dashboard" navigates to /dashboard
    // - Clicking "Continue viewing program" closes modal and reloads page
  });

  test.skip("Go to My Dashboard navigates to /dashboard from success view", async ({ page }) => {
    // PREREQUISITES: Same as above, success view is visible
    //
    // STEPS:
    // 1. Complete email signup flow to reach success view
    // 2. Click "Go to My Dashboard" link
    //
    // EXPECTED:
    // - Page navigates to /dashboard
    // - User is authenticated (email was captured)
    //
    // SELECTOR: page.getByRole("link", { name: /Go to My Dashboard/i })
  });

  test.skip("Continue viewing program closes modal and reloads", async ({ page }) => {
    // PREREQUISITES: Same as above, success view is visible
    //
    // STEPS:
    // 1. Complete email signup flow to reach success view
    // 2. Click "Continue viewing program"
    //
    // EXPECTED:
    // - Modal closes (overlay disappears)
    // - Page reloads (programs now unlocked for this user)
    // - User remains on the same preview page
    //
    // SELECTOR: page.getByRole("button", { name: /Continue viewing program/i })
  });

  test.skip("success view does not auto-close", async ({ page }) => {
    // PREREQUISITES: Same as above, success view is visible
    //
    // STEPS:
    // 1. Complete email signup flow to reach success view
    // 2. Wait 5 seconds without interacting
    //
    // EXPECTED:
    // - Success view remains visible after 5s (no auto-dismiss)
    // - Both CTAs ("Go to My Dashboard" and "Continue viewing program") still present
    //
    // This verifies the Phase 4 change that removed the 1.5s auto-close timer.
  });

  test("success view has no ReactConfetti dependency", async ({ page }) => {
    // Structural check: verify the UpsellModal component does not use
    // the react-confetti package (replaced with CSS-only confetti in Phase 4)
    //
    // This test reads the source file directly to confirm no regression.
    // No page navigation needed.
    const fs = await import("fs");
    const path = await import("path");

    const modalPath = path.resolve(
      process.cwd(),
      "src/app/components/UpsellModal.tsx"
    );
    const source = fs.readFileSync(modalPath, "utf-8");

    // Should NOT contain any react-confetti imports
    expect(source).not.toContain("react-confetti");
    expect(source).not.toContain("ReactConfetti");

    // Should contain CSS-based confetti animations instead
    expect(source).toContain("confettiFloat");
    expect(source).toContain("@keyframes confettiFloat");
  });

  test("success view component contains required content", async ({ page }) => {
    // Structural check: verify the SuccessView contains all required
    // text content, features, and navigation targets.
    const fs = await import("fs");
    const path = await import("path");

    const modalPath = path.resolve(
      process.cwd(),
      "src/app/components/UpsellModal.tsx"
    );
    const source = fs.readFileSync(modalPath, "utf-8");

    // Header content
    expect(source).toContain("You&apos;re In!");
    expect(source).toContain("Your full program is now unlocked");

    // All 5 unlocked features must be present
    const requiredFeatures = [
      "All program phases unlocked",
      "Personalized nutrition plan",
      "Progress tracking dashboard",
      "PDF export",
      "Food logging & meal planning",
    ];
    for (const feature of requiredFeatures) {
      expect(source).toContain(feature);
    }

    // Dashboard CTA
    expect(source).toContain('href="/dashboard"');
    expect(source).toContain("Go to My Dashboard");

    // Continue viewing secondary CTA
    expect(source).toContain("Continue viewing program");

    // Email confirmation note
    expect(source).toContain("Check your email for a welcome message");
  });

  test("success state management exists in UpsellModal", async ({ page }) => {
    // Structural check: verify the state management for showing
    // the success view is properly wired up.
    const fs = await import("fs");
    const path = await import("path");

    const modalPath = path.resolve(
      process.cwd(),
      "src/app/components/UpsellModal.tsx"
    );
    const source = fs.readFileSync(modalPath, "utf-8");

    // showSuccess state is declared
    expect(source).toContain("showSuccess");
    expect(source).toContain("setShowSuccess");

    // Success state set on successful submit
    expect(source).toContain("setShowSuccess(true)");

    // Reset on modal open
    expect(source).toContain("setShowSuccess(false)");

    // Conditional rendering
    expect(source).toContain("showSuccess ?");
    expect(source).toContain("<SuccessView");
  });
});
