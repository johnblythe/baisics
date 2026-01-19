import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona } from "../../fixtures/personas";

test.describe("Workout - complete workout updates status", () => {
  // Run tests serially to avoid seed race conditions
  test.describe.configure({ mode: "serial" });

  // Seed personas before all tests
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should complete workout, see completion response, and verify workout in Recent Activity", async ({
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

    // Navigate to workout page via Start Workout link
    // Could be in main area or Quick Log section depending on dashboard state
    let startWorkoutLink = page.getByRole("link", {
      name: "Start Workout",
      exact: true,
    });

    // If not found, try "Start workout" in Quick Log section
    if (!(await startWorkoutLink.isVisible().catch(() => false))) {
      startWorkoutLink = page.getByRole("link", {
        name: /Start workout/i,
      }).first();
    }

    // Or "Train anyway" button if showing rest day
    if (!(await startWorkoutLink.isVisible().catch(() => false))) {
      startWorkoutLink = page.getByRole("button", {
        name: /Train anyway/i,
      });
    }

    await expect(startWorkoutLink).toBeVisible({ timeout: 10000 });
    await startWorkoutLink.click();

    // Wait for workout page to load
    await page.waitForURL("**/workout/**", { timeout: 15000 });

    // Verify workout is loaded - "Exercise X of Y" should be visible
    const exerciseIndicator = page.getByText(/Exercise \d+ of \d+/);
    await expect(exerciseIndicator).toBeVisible({ timeout: 10000 });

    // Log at least one set for the first exercise
    // Find the weight input (first number input)
    const weightInput = page.locator('input[type="number"]').first();
    await expect(weightInput).toBeVisible({ timeout: 5000 });
    await weightInput.fill("185");

    // Find the reps input (second number input)
    const repsInput = page.locator('input[type="number"]').nth(1);
    await expect(repsInput).toBeVisible({ timeout: 5000 });
    await repsInput.fill("8");

    // Click "Complete Set" button
    const completeSetButton = page.getByRole("button", {
      name: /Complete Set \d+/,
    });
    await expect(completeSetButton).toBeVisible({ timeout: 5000 });
    await completeSetButton.click();

    // Verify set is logged - should see weight×reps display
    await expect(page.getByText("185×8")).toBeVisible({ timeout: 10000 });

    // Navigate to the last exercise to access "Complete Workout" button
    // Use the quick nav buttons or Next button to reach the last exercise
    // First, get the exercise count from the indicator
    const indicatorText = await exerciseIndicator.textContent();
    const match = indicatorText?.match(/Exercise \d+ of (\d+)/);
    const totalExercises = match ? parseInt(match[1], 10) : 1;

    // Navigate to last exercise by clicking the last quick nav button
    if (totalExercises > 1) {
      // Quick nav buttons are numbered - click the last one
      const quickNavButtons = page.locator(
        "button.w-10.h-10.rounded-lg"
      );
      const lastButton = quickNavButtons.nth(totalExercises - 1);
      await lastButton.click();

      // Wait for exercise indicator to update
      await page
        .getByText(`Exercise ${totalExercises} of ${totalExercises}`)
        .waitFor({ timeout: 5000 });
    }

    // Now we should see "Complete Workout" button instead of "Next"
    const completeWorkoutButton = page.getByRole("button", {
      name: /complete workout/i,
    });
    await expect(completeWorkoutButton).toBeVisible({ timeout: 10000 });

    // Click Complete Workout
    await completeWorkoutButton.click();

    // After completion, we should see either:
    // 1. Share modal (WorkoutShareCard) with workout stats
    // 2. Program completion celebration
    // 3. Redirect to dashboard (for first workout)

    // Wait for some completion indication
    // The share modal shows "Share your accomplishment" or similar
    // Or we might redirect to dashboard
    const shareModalOrDashboard = await Promise.race([
      // Share modal indication - look for "Skip" button which is in share modal
      page
        .getByRole("button", { name: /skip/i })
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => "share"),
      // Or redirect to dashboard
      page
        .waitForURL("**/dashboard/**", { timeout: 10000 })
        .then(() => "dashboard"),
      // Or celebration screen with "Program Complete" or "First Workout"
      page
        .getByText(/program complete|congratulations|first workout/i)
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => "celebration"),
    ]).catch(() => "timeout");

    // Verify we got some completion response
    expect(["share", "dashboard", "celebration"]).toContain(
      shareModalOrDashboard
    );

    // If share modal is showing, close it to navigate to dashboard
    if (shareModalOrDashboard === "share") {
      const skipButton = page.getByRole("button", { name: /skip/i });
      if (await skipButton.isVisible()) {
        await skipButton.click();
        // Wait for redirect to dashboard
        await page.waitForURL("**/dashboard/**", { timeout: 10000 });
      }
    } else if (shareModalOrDashboard === "celebration") {
      // If celebration screen, click the continue/close button
      const continueButton = page.getByRole("button", {
        name: /continue|close|done|back to dashboard/i,
      });
      if (await continueButton.isVisible()) {
        await continueButton.click();
      }
      await page.waitForURL("**/dashboard/**", { timeout: 10000 });
    }

    // Now on dashboard, should be on the program page
    expect(page.url()).toContain("/dashboard");

    // ===== PART 2: Verify workout appears in Recent Activity =====

    // Now verify workout appears in Recent Activity section
    // The Recent Activity section shows workout history with dates
    const recentActivityHeading = page.getByText("Recent Activity");
    await expect(recentActivityHeading).toBeVisible({ timeout: 10000 });

    // Recent activity items show the date (like "Jan 19") and workout info
    // Look for today's date in the activity list
    const today = new Date();
    const monthShort = today.toLocaleDateString("en-US", { month: "short" });
    const dayNum = today.getDate();
    const todayDisplay = `${monthShort} ${dayNum}`;

    // Look for the workout that was just completed - it should show today's date
    // Recent activity items include date and workout name
    const activityWithTodayDate = page.getByText(todayDisplay);

    // Verify at least one activity shows today's date (the workout we just completed)
    // This confirms the workout was recorded and shows in dashboard
    await expect(activityWithTodayDate.first()).toBeVisible({ timeout: 10000 });
  });
});
