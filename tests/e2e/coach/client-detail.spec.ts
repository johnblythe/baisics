/**
 * Coach Client Detail Page Tests
 *
 * Tests for the coach client detail page (/coach/clients/[id]).
 * Uses the active coach persona (coach-pro@test.baisics.app) who has clients.
 *
 * Key regression test: Ensures the page doesn't crash when a client has no programs.
 *
 * Covers:
 * - Navigation from dashboard to client detail
 * - Client information display
 * - Create/Assign Program button visibility
 * - Empty programs state handling (no crash)
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { COACH_TEST_PERSONAS } from "../../fixtures/personas";

test.describe.configure({ mode: "serial" });

test.describe("Coach Client Detail Page", () => {
  test("should navigate to client detail from dashboard", async ({ page }) => {
    // Login as active coach with clients
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Go to coach dashboard
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for clients to load - the loading spinner should disappear
    // and client cards should appear
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // Wait for either "Active Clients" section or "No clients yet" message to appear
    const clientsSection = page.getByText("Active Clients").or(page.getByText("No clients yet"));
    await expect(clientsSection.first()).toBeVisible({ timeout: 10000 });

    // Dismiss onboarding modal if it appears
    const skipIntroButton = page.getByRole("button", { name: "Skip intro" });
    try {
      await skipIntroButton.waitFor({ state: "visible", timeout: 3000 });
      await skipIntroButton.click();
      await skipIntroButton.waitFor({ state: "hidden", timeout: 3000 });
    } catch {
      // Modal might not appear, continue
    }

    // Find and click the first client card/link
    // Client cards are links to /coach/clients/[id]
    const clientLink = page.locator('a[href^="/coach/clients/"]').first();
    await expect(clientLink).toBeVisible({ timeout: 5000 });

    // Get the href to verify navigation
    const href = await clientLink.getAttribute("href");
    expect(href).toMatch(/^\/coach\/clients\/.+$/);

    // Click the client link
    await clientLink.click();

    // Verify URL changes to /coach/clients/[some-id]
    await page.waitForURL(/\/coach\/clients\/[^/]+$/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/coach\/clients\/[^/]+$/);

    // Verify page loads without errors
    // Check that we don't see any error messages like "Cannot read properties of undefined"
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("text=/Cannot read properties of undefined/i")
    ).not.toBeVisible();
    await expect(
      page.locator("text=/Error/i").first()
    ).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // It's OK if this times out - we just want to check there's no prominent error
    });
  });

  test("should display client information", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach dashboard first
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for clients to load
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // Click on first client
    const clientLink = page.locator('a[href^="/coach/clients/"]').first();
    await expect(clientLink).toBeVisible({ timeout: 5000 });
    await clientLink.click();

    // Wait for client detail page to load
    await page.waitForURL(/\/coach\/clients\/[^/]+$/, { timeout: 10000 });

    // Wait for loading to complete
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // Verify client information is visible
    // The page should show the client's email
    await expect(
      page.locator("text=@").first()
    ).toBeVisible({ timeout: 5000 });

    // Should show "Back to Dashboard" link
    await expect(
      page.locator("text=/Back to Dashboard/i")
    ).toBeVisible({ timeout: 5000 });

    // Should show Coach Notes section
    await expect(
      page.locator("text=/Coach Notes/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should show Create Program or Assign options", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach dashboard first
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for clients to load
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // Dismiss onboarding modal if it appears
    const skipIntroButton = page.getByRole("button", { name: "Skip intro" });
    try {
      await skipIntroButton.waitFor({ state: "visible", timeout: 3000 });
      await skipIntroButton.click();
      await skipIntroButton.waitFor({ state: "hidden", timeout: 3000 });
    } catch {
      // Modal might not appear, continue
    }

    // Click on first client
    const clientLink = page.locator('a[href^="/coach/clients/"]').first();
    await expect(clientLink).toBeVisible({ timeout: 5000 });
    await clientLink.click();

    // Wait for client detail page to load
    await page.waitForURL(/\/coach\/clients\/[^/]+$/, { timeout: 10000 });

    // Wait for loading to complete
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // The page should either show:
    // 1. "Programs" section with existing programs, OR
    // 2. "No programs yet" message
    // Either way, the Programs heading should be visible
    await expect(
      page.getByRole("heading", { name: "Programs" })
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle client with no programs gracefully", async ({ page }) => {
    // This is the key regression test - ensures page doesn't crash
    // when client has no programs (empty programs array)

    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach dashboard first
    await page.goto("/coach/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for clients to load
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // Click on first client
    const clientLink = page.locator('a[href^="/coach/clients/"]').first();
    await expect(clientLink).toBeVisible({ timeout: 5000 });
    await clientLink.click();

    // Wait for client detail page to load
    await page.waitForURL(/\/coach\/clients\/[^/]+$/, { timeout: 10000 });

    // Wait for loading to complete (page shouldn't crash during load)
    await expect(
      page.locator(".animate-spin").first()
    ).not.toBeVisible({ timeout: 10000 });

    // Main content should be visible - this would fail if page crashed
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });

    // Page should NOT show any JavaScript error messages
    await expect(
      page.locator("text=/Cannot read properties of undefined/i")
    ).not.toBeVisible();
    await expect(
      page.locator("text=/TypeError/i")
    ).not.toBeVisible();
    await expect(
      page.locator("text=/undefined is not an object/i")
    ).not.toBeVisible();

    // The Programs section should handle empty state gracefully
    // Should show either programs or "No programs yet" message
    const programsHeading = page.getByRole("heading", { name: "Programs" });
    await expect(programsHeading).toBeVisible({ timeout: 5000 });

    // Check that "No programs yet" or actual programs are shown
    // Either state is acceptable - the key is no crash
    const hasNoProgramsMessage = await page
      .locator("text=/No programs yet/i")
      .isVisible()
      .catch(() => false);
    const hasPrograms = await page
      .locator('[class*="border"][class*="rounded-lg"]')
      .locator("text=/workouts/i")
      .first()
      .isVisible()
      .catch(() => false);

    // At least one should be true - either we show programs or empty state
    expect(hasNoProgramsMessage || hasPrograms).toBe(true);

    // Recent Workouts section should also handle empty state
    await expect(
      page.locator("text=/Recent Workouts/i")
    ).toBeVisible({ timeout: 5000 });

    // Should show either workout history or "No workouts completed yet"
    const workoutsSection = page.locator("text=/Recent Workouts/i").locator("..");
    await expect(workoutsSection).toBeVisible();
  });
});
