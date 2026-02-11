import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { COACH_TEST_PERSONAS, getPersona } from "../../fixtures/personas";

test.describe("Coach/Personal Mode Toggle", () => {
  test.describe.configure({ mode: "serial" });

  test("should display mode toggle for coach users", async ({ page }) => {
    // Login as active coach (coach-pro@test.baisics.app)
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate explicitly to coach dashboard (login might go to /dashboard first)
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for the isCoach context to load by checking for dashboard heading
    await expect(page.getByRole("heading", { name: "Coach Dashboard" })).toBeVisible({ timeout: 10000 });

    // Verify mode toggle is visible in header (desktop view)
    // The toggle contains "Coach" and "Personal" buttons - wait for context to load
    const coachButton = page.getByRole("button", { name: "Coach" });
    const personalButton = page.getByRole("button", { name: "Personal" });

    await expect(coachButton).toBeVisible({ timeout: 15000 });
    await expect(personalButton).toBeVisible({ timeout: 10000 });
  });

  test("should NOT display mode toggle for non-coach users", async ({
    page,
  }) => {
    // Login as regular user (marcus - a paid user but not a coach)
    const marcus = getPersona("marcus");
    await loginAsUser(page, marcus.email);

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Dismiss any modal that might appear
    const dismissButton = page.getByText("Not today, remind me tomorrow");
    try {
      await dismissButton.waitFor({ state: "visible", timeout: 3000 });
      await dismissButton.click();
      await dismissButton.waitFor({ state: "hidden", timeout: 3000 });
    } catch {
      // Modal might not appear, continue
    }

    // Verify mode toggle buttons are NOT visible
    // Non-coach users should not see Coach/Personal toggle
    const coachButton = page.getByRole("button", { name: "Coach" });
    const personalButton = page.getByRole("button", { name: "Personal" });

    await expect(coachButton).not.toBeVisible({ timeout: 5000 });
    await expect(personalButton).not.toBeVisible({ timeout: 5000 });
  });

  test("should switch to Personal mode when clicked", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate explicitly to coach dashboard
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for the mode toggle to load
    const personalButton = page.getByRole("button", { name: "Personal" });
    await expect(personalButton).toBeVisible({ timeout: 15000 });
    await personalButton.scrollIntoViewIfNeeded();
    await personalButton.click({ timeout: 10000 });

    // Wait for navigation - mode switch should redirect to consumer dashboard
    // Need to wait for page to actually navigate, not just header update
    await page.waitForURL(/^(?!.*\/coach\/).*\/dashboard/, { timeout: 15000 });

    // Verify nav links changed to consumer links
    // Consumer mode should show "Library", "My Program", "Nutrition" instead of coach links
    // Use exact: true to avoid matching "Exercise Library" footer link
    const libraryLink = page.getByRole("link", { name: "Library", exact: true });
    const myProgramLink = page.getByRole("link", { name: "My Program", exact: true });
    const nutritionLink = page.getByRole("link", { name: "Nutrition", exact: true });

    await expect(libraryLink).toBeVisible({ timeout: 10000 });
    await expect(myProgramLink).toBeVisible({ timeout: 10000 });
    await expect(nutritionLink).toBeVisible({ timeout: 10000 });
  });

  test("should switch back to Coach mode", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate explicitly to consumer dashboard to start in Personal mode
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for mode toggle to load
    const coachButton = page.getByRole("button", { name: "Coach" });
    const personalButton = page.getByRole("button", { name: "Personal" });
    await expect(coachButton).toBeVisible({ timeout: 15000 });
    await expect(personalButton).toBeVisible({ timeout: 10000 });

    // Click "Coach" to switch to Coach mode
    await coachButton.scrollIntoViewIfNeeded();
    await coachButton.click({ timeout: 10000 });

    // Verify navigation to coach dashboard
    await page.waitForURL("**/coach/dashboard**", { timeout: 15000 });
    expect(page.url()).toContain("/coach/dashboard");

    // Verify nav links changed to coach links
    // Coach mode should show "Dashboard", "Programs", "Settings" (coach-specific)
    const dashboardLink = page.getByRole("link", { name: "Dashboard", exact: true });
    const programsLink = page.getByRole("link", { name: "Programs", exact: true });
    const settingsLink = page.getByRole("link", { name: "Settings", exact: true });

    await expect(dashboardLink).toBeVisible({ timeout: 10000 });
    await expect(programsLink).toBeVisible({ timeout: 10000 });
    await expect(settingsLink).toBeVisible({ timeout: 10000 });
  });

  test("should persist mode across page refresh", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Go to coach dashboard first and switch to Personal mode explicitly
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for mode toggle and click Personal
    const personalButton = page.getByRole("button", { name: "Personal" });
    await expect(personalButton).toBeVisible({ timeout: 15000 });
    await personalButton.scrollIntoViewIfNeeded();
    await personalButton.click({ timeout: 10000 });

    // Wait for navigation to consumer dashboard
    await page.waitForURL(/^(?!.*\/coach\/).*\/dashboard/, { timeout: 15000 });

    // Verify consumer nav links are visible
    const libraryLink = page.getByRole("link", { name: "Library", exact: true });
    await expect(libraryLink).toBeVisible({ timeout: 10000 });

    // Refresh the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify still in Personal mode after refresh (cookie persisted)
    // Should still be on consumer dashboard, not coach
    expect(page.url()).not.toContain("/coach/");

    // Verify consumer nav links are still visible (Personal mode persisted)
    await expect(libraryLink).toBeVisible({ timeout: 10000 });

    // Mode toggle should still show Personal as selected
    const personalButtonAfterRefresh = page.getByRole("button", {
      name: "Personal",
    });
    await expect(personalButtonAfterRefresh).toBeVisible({ timeout: 10000 });
  });
});
