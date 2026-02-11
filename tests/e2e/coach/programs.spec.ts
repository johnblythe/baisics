import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { COACH_TEST_PERSONAS } from "../../fixtures/personas";

test.describe("Coach Programs List Page", () => {
  test.describe.configure({ mode: "serial" });

  test("should load programs list page", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach programs page
    await page.goto("/coach/programs");

    // Verify page loads without errors
    await page.waitForLoadState("networkidle");

    // Verify "Create Program" button is visible
    const createProgramButton = page.getByRole("link", {
      name: /create program/i,
    });
    await expect(createProgramButton).toBeVisible({ timeout: 10000 });
  });

  test("should display filter pills", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach programs page
    await page.goto("/coach/programs");
    await page.waitForLoadState("networkidle");

    // Verify "All", "Templates", "Assigned" filter buttons are visible
    const allFilter = page.getByRole("button", { name: /^all$/i });
    const templatesFilter = page.getByRole("button", { name: /^templates$/i });
    const assignedFilter = page.getByRole("button", { name: /^assigned$/i });

    await expect(allFilter).toBeVisible({ timeout: 10000 });
    await expect(templatesFilter).toBeVisible({ timeout: 10000 });
    await expect(assignedFilter).toBeVisible({ timeout: 10000 });
  });

  test("should show templates for active coach", async ({ page }) => {
    // Login as active coach (coach-pro has 3 templates)
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach programs page
    await page.goto("/coach/programs");
    await page.waitForLoadState("networkidle");

    // Wait for loading to complete (loader should disappear)
    const loader = page.locator(".animate-spin");
    try {
      await loader.waitFor({ state: "hidden", timeout: 10000 });
    } catch {
      // Loader might have already disappeared
    }

    // Verify at least one program card is visible
    // Program cards are in a grid with bg-white and rounded-xl classes
    const programCards = page.locator(
      'div.grid > div.bg-white.rounded-xl'
    );
    await expect(programCards.first()).toBeVisible({ timeout: 10000 });

    // Verify we have at least one program (coach-pro has 3 templates)
    const count = await programCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should show empty state for new coach", async ({ page }) => {
    // Login as new coach (no clients or templates)
    await loginAsUser(page, COACH_TEST_PERSONAS.empty.email);

    // Navigate to coach programs page
    await page.goto("/coach/programs");
    await page.waitForLoadState("networkidle");

    // Wait for loading to complete
    const loader = page.locator(".animate-spin");
    try {
      await loader.waitFor({ state: "hidden", timeout: 10000 });
    } catch {
      // Loader might have already disappeared
    }

    // Verify empty state message or "Create your first program" message
    // The empty state shows "No programs yet" or similar messaging
    const emptyStateText = page.getByText(/no (programs|templates) yet/i);
    const createFirstText = page.getByText(/create your first program/i);

    // Either the empty state text or the create first message should be visible
    const isEmptyStateVisible = await emptyStateText.isVisible().catch(() => false);
    const isCreateFirstVisible = await createFirstText.isVisible().catch(() => false);

    expect(isEmptyStateVisible || isCreateFirstVisible).toBe(true);
  });

  test("should filter by Templates", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Navigate to coach programs page
    await page.goto("/coach/programs");
    await page.waitForLoadState("networkidle");

    // Wait for initial load
    const loader = page.locator(".animate-spin");
    try {
      await loader.waitFor({ state: "hidden", timeout: 10000 });
    } catch {
      // Loader might have already disappeared
    }

    // Click "Templates" filter pill
    const templatesFilter = page.getByRole("button", { name: /^templates$/i });
    await expect(templatesFilter).toBeVisible({ timeout: 10000 });
    await templatesFilter.click();

    // Wait for the filter to apply (loading spinner may appear briefly)
    try {
      await loader.waitFor({ state: "visible", timeout: 2000 });
      await loader.waitFor({ state: "hidden", timeout: 10000 });
    } catch {
      // Quick filter - no visible loader
    }

    // Verify the Templates filter is now active (has coral background)
    // Active filter has bg-[#FF6B6B] class
    await expect(templatesFilter).toHaveClass(/bg-\[#FF6B6B\]/);
  });
});
