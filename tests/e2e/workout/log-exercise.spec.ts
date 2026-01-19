import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona } from "../../fixtures/personas";

test.describe("Workout - log exercise set", () => {
  // Run tests serially to avoid seed race conditions
  test.describe.configure({ mode: "serial" });

  // Seed personas before all tests
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should log weight and reps for a set and see it marked as completed", async ({
    page,
  }) => {
    // Get marcus persona (has program, paid tier)
    const marcus = getPersona("marcus");

    // Login as marcus
    await loginAsUser(page, marcus.email);

    // Wait for dashboard to load
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

    // Navigate to workout page
    const startWorkoutLink = page.getByRole("link", {
      name: "Start Workout",
      exact: true,
    });
    await expect(startWorkoutLink).toBeVisible({ timeout: 10000 });
    await startWorkoutLink.click();

    // Wait for workout page to load
    await page.waitForURL("**/workout/**", { timeout: 15000 });

    // Verify workout is loaded - "Exercise X of Y" should be visible
    const exerciseIndicator = page.getByText(/Exercise \d+ of \d+/);
    await expect(exerciseIndicator).toBeVisible({ timeout: 10000 });

    // Verify BigSetInputCard is visible - look for "Logging Set" text
    const loggingSetText = page.getByText("Logging Set");
    await expect(loggingSetText).toBeVisible({ timeout: 10000 });

    // Find the weight input (has label "Weight (lbs)")
    const weightInput = page.locator('input[type="number"]').first();
    await expect(weightInput).toBeVisible({ timeout: 5000 });

    // Enter weight value (e.g., 185)
    await weightInput.fill("185");

    // Find the reps input (second number input)
    const repsInput = page.locator('input[type="number"]').nth(1);
    await expect(repsInput).toBeVisible({ timeout: 5000 });

    // Enter reps value (e.g., 8)
    await repsInput.fill("8");

    // Find and click the "Complete Set 1" button
    const completeSetButton = page.getByRole("button", {
      name: /Complete Set \d+/,
    });
    await expect(completeSetButton).toBeVisible({ timeout: 5000 });
    await completeSetButton.click();

    // Verify set is marked as completed
    // After completion, the SetProgressGrid should show the completed set with weight×reps
    // Completed sets display as "185×8" format in the grid
    const completedSetDisplay = page.getByText("185×8");
    await expect(completedSetDisplay).toBeVisible({ timeout: 10000 });

    // Also verify a green checkmark indicator appears (completed set badge)
    // The completed set button has a green background
    const completedSetCard = page.locator("button").filter({
      hasText: "185×8",
    });
    await expect(completedSetCard).toBeVisible({ timeout: 5000 });
  });

  test("should allow logging multiple sets in sequence", async ({ page }) => {
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
    await page.getByText(/Exercise \d+ of \d+/).waitFor({ timeout: 10000 });

    // Log first set
    let weightInput = page.locator('input[type="number"]').first();
    let repsInput = page.locator('input[type="number"]').nth(1);

    await weightInput.fill("135");
    await repsInput.fill("10");

    let completeSetButton = page.getByRole("button", {
      name: /Complete Set 1/,
    });
    await completeSetButton.click();

    // Verify first set is logged
    await expect(page.getByText("135×10")).toBeVisible({ timeout: 10000 });

    // Now the card should show "Logging Set 2" for the next set
    // Wait for the UI to update - look for Complete Set 2 button
    const completeSet2Button = page.getByRole("button", {
      name: /Complete Set 2/,
    });
    await expect(completeSet2Button).toBeVisible({ timeout: 10000 });

    // Fill second set
    weightInput = page.locator('input[type="number"]').first();
    repsInput = page.locator('input[type="number"]').nth(1);

    await weightInput.fill("140");
    await repsInput.fill("8");
    await completeSet2Button.click();

    // Verify second set is logged
    await expect(page.getByText("140×8")).toBeVisible({ timeout: 10000 });

    // Verify progress updated (should show at least 2 sets complete)
    const progressText = page.getByText(/\d+ of \d+ sets complete/);
    await expect(progressText).toBeVisible({ timeout: 5000 });
    const progressContent = await progressText.textContent();
    // Extract the number of completed sets
    const match = progressContent?.match(/(\d+) of \d+ sets complete/);
    expect(match).toBeTruthy();
    expect(Number(match![1])).toBeGreaterThanOrEqual(2);
  });
});
