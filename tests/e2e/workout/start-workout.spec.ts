import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona } from "../../fixtures/personas";

test.describe("Workout - start workout loads exercises", () => {
  // Run tests serially to avoid seed race conditions
  test.describe.configure({ mode: "serial" });

  // Seed personas before all tests
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should navigate from dashboard to workout page and see exercises", async ({
    page,
  }) => {
    // Get marcus persona (has program, paid tier, has workouts)
    const marcus = getPersona("marcus");

    // Login as marcus
    await loginAsUser(page, marcus.email);

    // Wait for dashboard to load
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");

    // Dismiss "Welcome back" modal if it appears
    const dismissButton = page.getByText("Not today, remind me tomorrow");
    try {
      await dismissButton.waitFor({ state: "visible", timeout: 5000 });
      await dismissButton.click();
      await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Modal might not appear
    }

    // Find and click the "Start Workout" button on dashboard
    // Use exact: true to avoid matching multiple elements
    const startWorkoutLink = page.getByRole("link", {
      name: "Start Workout",
      exact: true,
    });
    await expect(startWorkoutLink).toBeVisible({ timeout: 10000 });
    await startWorkoutLink.click();

    // Verify redirect to workout page
    await page.waitForURL("**/workout/**", { timeout: 15000 });
    expect(page.url()).toContain("/workout/");
  });

  test("should show at least one exercise on workout page", async ({ page }) => {
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

    // Verify "Exercise X of Y" indicator is visible (workout is loaded)
    const exerciseIndicator = page.getByText(/Exercise \d+ of \d+/);
    await expect(exerciseIndicator).toBeVisible({ timeout: 10000 });

    // Verify at least one exercise name is visible
    // Exercise names appear in h3 tags
    const exerciseNameHeading = page.locator("h3.text-2xl");
    await expect(exerciseNameHeading).toBeVisible({ timeout: 10000 });
    const exerciseNameText = await exerciseNameHeading.textContent();
    expect(exerciseNameText?.length).toBeGreaterThan(0);
  });

  test("should show workout progress bar in active state", async ({ page }) => {
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

    // Verify "Workout in Progress" text is visible (workout mode is active)
    const workoutInProgress = page.getByText("Workout in Progress");
    await expect(workoutInProgress).toBeVisible({ timeout: 10000 });

    // Verify sets progress is shown (e.g., "X of Y sets complete")
    const setsComplete = page.getByText(/\d+ of \d+ sets complete/);
    await expect(setsComplete).toBeVisible({ timeout: 10000 });

    // Verify the progress percentage is visible
    const progressPercent = page.getByText(/%$/);
    await expect(progressPercent).toBeVisible({ timeout: 10000 });
  });

  test("should show navigation buttons on workout page", async ({ page }) => {
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

    // Verify Previous and Next buttons exist (workout navigation is active)
    const previousButton = page.getByRole("button", { name: /previous/i });
    await expect(previousButton).toBeVisible({ timeout: 10000 });

    // Next button OR "Complete Workout" button should be visible
    // (depending on which exercise we're on)
    const nextButton = page.getByRole("button", { name: /next/i });
    const completeWorkoutButton = page.getByRole("button", {
      name: /complete workout/i,
    });

    // At least one of these should be visible
    const hasNextOrComplete =
      (await nextButton.isVisible()) || (await completeWorkoutButton.isVisible());
    expect(hasNextOrComplete).toBe(true);
  });
});
