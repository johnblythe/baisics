import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";

test.describe("Dashboard - main dashboard loads with all components", () => {
  // Run tests in this file serially to avoid seed race conditions
  test.describe.configure({ mode: "serial" });

  // Seed personas before all tests in this file

  test("should display all key dashboard sections for user with program", async ({
    page,
  }) => {
    // Get marcus persona (has program, paid tier)
    const marcus = getPersona("marcus");

    // Login as marcus using the auth fixture
    await loginAsUser(page, marcus.email);

    // Verify redirect to dashboard
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");

    // Dismiss the "Welcome back" modal if it appears
    const dismissButton = page.getByText("Not today, remind me tomorrow");
    try {
      await dismissButton.waitFor({ state: "visible", timeout: 5000 });
      await dismissButton.click();
      await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Modal might not appear, continue
    }

    // 1. Verify program name is visible
    // Marcus has "PPL Hypertrophy Program"
    const programName = page.getByText("PPL Hypertrophy Program");
    await expect(programName).toBeVisible({ timeout: 10000 });

    // 2. Verify workout selector/list is visible
    // The dashboard shows "Today's Workout" section with workout name (e.g., "Day X: Push")
    const todaysWorkoutSection = page.getByText("Today's Workout");
    await expect(todaysWorkoutSection).toBeVisible({ timeout: 10000 });

    // Verify there's a workout visible (either Day N: Name or a workout button)
    // The workout selector shows "Day {dayNumber}: {workoutName}"
    const workoutSelector = page.locator("button").filter({
      hasText: /Day \d+:/i,
    });
    await expect(workoutSelector).toBeVisible({ timeout: 10000 });

    // 3. Verify stats section shows workout count
    // The dashboard shows "workouts" text in stats area
    const workoutsText = page.getByText(/\d+\s*\/\s*\d+/).first();
    await expect(workoutsText).toBeVisible({ timeout: 10000 });

    // Also verify the "workouts" label exists
    const workoutsLabel = page.getByText("workouts", { exact: true }).first();
    await expect(workoutsLabel).toBeVisible({ timeout: 10000 });

    // 4. Check for console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Reload to capture any page load errors
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Filter out known acceptable console messages
    const criticalErrors = consoleErrors.filter((error) => {
      // Allow Tawk.to related errors (third-party chat widget)
      if (error.includes("Tawk") || error.includes("tawk")) return false;
      // Allow favicon errors
      if (error.includes("favicon")) return false;
      // Allow React dev mode warnings
      if (error.includes("React") && error.includes("warning")) return false;
      return true;
    });

    // Assert no critical console errors
    expect(
      criticalErrors,
      `Unexpected console errors: ${criticalErrors.join(", ")}`
    ).toHaveLength(0);
  });

  test("should display Weekly Progress section", async ({ page }) => {
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

    // Verify Weekly Progress section
    const weeklyProgressSection = page.getByText("Weekly Progress");
    await expect(weeklyProgressSection).toBeVisible({ timeout: 10000 });

    // Verify streak indicator is visible (shows "streak" text)
    const streakIndicator = page.getByText("streak").first();
    await expect(streakIndicator).toBeVisible({ timeout: 10000 });
  });

  test("should display Quick Log section with action buttons", async ({
    page,
  }) => {
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

    // Verify Quick Log section
    const quickLogSection = page.getByText("Quick Log");
    await expect(quickLogSection).toBeVisible({ timeout: 10000 });

    // Verify quick action buttons are visible
    const logFoodButton = page.getByText("Log food");
    await expect(logFoodButton).toBeVisible({ timeout: 10000 });

    const logWeightButton = page.getByText("Log weight");
    await expect(logWeightButton).toBeVisible({ timeout: 10000 });
  });

  test("should display Recent Activity section", async ({ page }) => {
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

    // Verify Recent Activity section
    const recentActivitySection = page.getByText("Recent Activity");
    await expect(recentActivitySection).toBeVisible({ timeout: 10000 });
  });
});
