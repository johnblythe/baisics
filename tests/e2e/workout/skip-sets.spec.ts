import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";

/**
 * E2E tests for the "Skip this movement" link on the workout page.
 *
 * When a user hasn't completed any sets for the current exercise,
 * a "Skip this movement" link appears (text-sm text-[#94A3B8]).
 * When some sets are completed, it changes to "Skip remaining N sets".
 *
 * The skip link only appears when:
 * - Not on the last exercise
 * - Not all sets are completed
 * - Not editing a completed set
 *
 * Related: PR #356
 */

test.describe("Workout - Skip sets", () => {
  test.describe.configure({ mode: "serial" });

  test("should show 'Skip this movement' link on workout page", async ({
    page,
  }) => {
    const marcus = getPersona("marcus");
    await loginAsUser(page, marcus.email);

    await page.waitForURL("**/dashboard/**", { timeout: 15000 });

    // Dismiss "Welcome back" modal if it appears
    const dismissButton = page.getByText("Not today, remind me tomorrow");
    try {
      await dismissButton.waitFor({ state: "visible", timeout: 5000 });
      await dismissButton.click();
      await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Modal might not appear
    }

    // Navigate to workout
    const startWorkoutLink = page.getByRole("link", {
      name: "Start Workout",
      exact: true,
    });
    await expect(startWorkoutLink).toBeVisible({ timeout: 10000 });
    await startWorkoutLink.click();

    await page.waitForURL("**/workout/**", { timeout: 15000 });

    // Wait for workout to load
    const exerciseIndicator = page.getByText(/Exercise \d+ of \d+/);
    await expect(exerciseIndicator).toBeVisible({ timeout: 10000 });

    // Extract the total number of exercises
    const indicatorText = await exerciseIndicator.textContent();
    const totalMatch = indicatorText?.match(/Exercise \d+ of (\d+)/);
    const totalExercises = totalMatch ? parseInt(totalMatch[1], 10) : 1;

    // The skip link should be visible on the first exercise (if not the only exercise)
    if (totalExercises > 1) {
      // Look for "Skip this movement" button
      const skipLink = page.getByRole("button", {
        name: /skip this movement/i,
      });
      await expect(skipLink).toBeVisible({ timeout: 10000 });

      // Verify it has the expected gray styling (text-[#94A3B8])
      const skipElement = page.locator("button.text-\\[\\#94A3B8\\]").filter({
        hasText: /skip/i,
      });
      await expect(skipElement).toBeVisible({ timeout: 5000 });
    } else {
      // Only one exercise - skip link should NOT appear (it's the last exercise)
      const skipLink = page.getByRole("button", {
        name: /skip this movement/i,
      });
      await expect(skipLink).not.toBeVisible({ timeout: 3000 });
    }
  });

  test("should not show skip link on the last exercise", async ({ page }) => {
    const marcus = getPersona("marcus");
    await loginAsUser(page, marcus.email);

    await page.waitForURL("**/dashboard/**", { timeout: 15000 });

    // Dismiss modal if present
    const dismissButton = page.getByText("Not today, remind me tomorrow");
    try {
      await dismissButton.waitFor({ state: "visible", timeout: 5000 });
      await dismissButton.click();
      await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Modal might not appear
    }

    // Navigate to workout
    const startWorkoutLink = page.getByRole("link", {
      name: "Start Workout",
      exact: true,
    });
    await expect(startWorkoutLink).toBeVisible({ timeout: 10000 });
    await startWorkoutLink.click();

    await page.waitForURL("**/workout/**", { timeout: 15000 });

    // Wait for workout to load
    const exerciseIndicator = page.getByText(/Exercise \d+ of \d+/);
    await expect(exerciseIndicator).toBeVisible({ timeout: 10000 });

    // Extract total exercises
    const indicatorText = await exerciseIndicator.textContent();
    const totalMatch = indicatorText?.match(/Exercise \d+ of (\d+)/);
    const totalExercises = totalMatch ? parseInt(totalMatch[1], 10) : 1;

    if (totalExercises <= 1) {
      // Only one exercise, skip link should never appear
      const skipLink = page.getByRole("button", {
        name: /skip this movement/i,
      });
      await expect(skipLink).not.toBeVisible({ timeout: 3000 });
      return;
    }

    // Navigate to the last exercise
    for (let i = 0; i < totalExercises - 1; i++) {
      const nextButton = page.getByRole("button", { name: /next/i });
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }

    // Verify we're on the last exercise
    const lastExerciseIndicator = page.getByText(
      `Exercise ${totalExercises} of ${totalExercises}`
    );
    await expect(lastExerciseIndicator).toBeVisible({ timeout: 5000 });

    // "Complete Workout" button should be visible instead of "Next"
    const completeButton = page.getByRole("button", {
      name: /complete workout/i,
    });
    await expect(completeButton).toBeVisible({ timeout: 5000 });

    // Skip link should NOT be visible on the last exercise
    const skipLink = page.getByRole("button", {
      name: /skip this movement/i,
    });
    await expect(skipLink).not.toBeVisible({ timeout: 3000 });
  });
});
