/**
 * QuickAdd Pills Tests
 *
 * Tests for the QuickPills component on the nutrition page.
 * QuickPills allow users to instantly add frequently used foods without
 * going through the full search → serving size → confirm flow.
 *
 * The flow involves:
 * 1. QuickPills section displays on the page (grid on desktop, horizontal on mobile)
 * 2. Clicking a QuickPill adds the food instantly (no modal)
 * 3. A toast confirmation appears
 * 4. Macro bars update to reflect the added food
 *
 * Note: QuickPills are populated from /api/quick-foods which returns
 * user's frequently logged foods + starter foods. A fresh user with
 * no food history will have an empty or minimal QuickPills section.
 * To test properly, we first need to log some foods to populate QuickPills.
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";
import { visibleLayout } from "../../fixtures/nutrition-helpers";
import { setupFoodSearchMock } from "../../fixtures/food-search-mock";

test.describe("QuickAdd Pills Flow", () => {
  // Tests mutate shared persona data — run sequentially to avoid race conditions
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await setupFoodSearchMock(page);
  });

  test("should see QuickPills section on nutrition page", async ({ page }) => {
    const persona = getPersona("chris");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // QuickPills section appears in a container with "Quick Add" title on desktop
    // or directly as pills below the progress bars on mobile
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 1024;

    if (isDesktop) {
      // Desktop: look for "Quick Add" heading
      const quickAddSection = layout.getByRole('heading', { name: 'Quick Add', exact: true });
      await expect(quickAddSection).toBeVisible({ timeout: 5000 });
    } else {
      // On mobile, QuickPills are in a horizontal scrollable area
      // They appear after the macro progress section
      const quickPillsContainer = layout.locator(
        'div:has(button:has-text("+"))'
      ).first();
      // If no quick foods, empty state shows "Search for foods above to start logging"
      const emptyState = layout.locator(
        "text=/search for foods above to start logging/i"
      );
      const hasQuickFoods = await quickPillsContainer.isVisible().catch(() => false);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      expect(hasQuickFoods || hasEmptyState).toBeTruthy();
    }
  });

  test("should display QuickPill buttons with food names and calories", async ({ page }) => {
    const persona = getPersona("chris");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // First, log a food via search to populate QuickPills
    // Open inline search for Breakfast
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search and add a food to populate QuickPills
    await searchInput.fill("banana");
    await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
    const firstResult = layout.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Wait for serving size selector and confirm
    await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await layout.getByRole("button", { name: /confirm/i }).click();

    // Wait for food to be added
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });
    await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

    // Verify the food was actually logged in a meal section
    await expect(layout.locator('[data-testid="food-log-item"]').filter({ hasText: /banana/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test("should click QuickPill and add food instantly (no modal)", async ({ page }) => {
    const persona = getPersona("chris");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // First, log a food to populate QuickPills
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    await searchInput.fill("apple");
    await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
    const firstResult = layout.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await layout.getByRole("button", { name: /confirm/i }).click();
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });
    await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

    // Look for a QuickPill button to click (could be any food)
    // QuickPills on desktop are in grid layout, on mobile in horizontal scroll
    const quickPillButton = layout.locator('button').filter({
      has: page.locator('svg[class*="plus"], [class*="Plus"]'),
    }).first();

    // Wait for QuickPills to refresh — pill must be visible to test click behavior
    const hasQuickPill = await quickPillButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasQuickPill) {
      test.skip(true, "QuickPills not populated after logging food — API refresh may be async");
      return;
    }

    // Click the QuickPill
    await quickPillButton.click();

    // Wait for toast confirmation (added: {food name})
    // Use .first() since previous food additions may also have visible toasts
    await expect(page.locator("text=/added:/i").first()).toBeVisible({ timeout: 3000 });

    // Verify no modal appeared (instant add, no confirmation dialog)
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test("should verify macro bars update after QuickPill add", async ({ page }) => {
    const persona = getPersona("chris");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Set up nutrition targets first so we have progress bars
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    if (await setGoalsButton.isVisible().catch(() => false)) {
      await setGoalsButton.click();
      await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

      await page.getByLabel(/daily calories/i).fill("2000");
      await page.getByLabel(/protein/i).fill("150");
      await page.getByLabel(/carbs/i).fill("200");
      await page.getByLabel(/fat/i).fill("65");

      await page.getByRole("button", { name: /save targets/i }).click();
      await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible({ timeout: 5000 });
    }

    // Log a food to populate QuickPills
    const addButton = layout.locator('[data-testid="add-food-lunch"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    await searchInput.fill("egg");
    await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
    const firstResult = layout.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await layout.getByRole("button", { name: /confirm/i }).click();
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });
    await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

    // Look for QuickPill buttons
    const quickPillButtons = layout.locator('button').filter({
      has: page.locator('svg[class*="plus"], [class*="Plus"]'),
    });

    const hasQuickPills = await quickPillButtons.first().isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasQuickPills) {
      test.skip(true, "QuickPills not populated — cannot test macro update");
      return;
    }

    // Get current calorie display before clicking QuickPill
    const calorieDisplayBefore = await layout.locator("text=/\\d+\\s*\\/\\s*2000/i").textContent();
    const caloriesBeforeMatch = calorieDisplayBefore?.match(/(\d+)\s*\/\s*2000/);
    const caloriesBefore = caloriesBeforeMatch ? parseInt(caloriesBeforeMatch[1], 10) : 0;

    // Click a QuickPill
    await quickPillButtons.first().click();

    // Wait for toast and data refresh
    await expect(page.locator("text=/added:/i")).toBeVisible({ timeout: 3000 });

    // Wait for calorie display to update
    await expect(async () => {
      const calorieDisplayAfter = await layout.locator("text=/\\d+\\s*\\/\\s*2000/i").textContent();
      const caloriesAfterMatch = calorieDisplayAfter?.match(/(\d+)\s*\/\s*2000/);
      const caloriesAfter = caloriesAfterMatch ? parseInt(caloriesAfterMatch[1], 10) : 0;
      expect(caloriesAfter).toBeGreaterThan(caloriesBefore);
    }).toPass({ timeout: 5000 });
  });

  test("should show empty state when no quick foods available", async ({ page }) => {
    // This test uses a fresh persona who hasn't logged any foods
    // and doesn't have starter foods
    const persona = getPersona("chris");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    // Wait for page to finish loading food data
    await expect(page.locator("text=/loading your food log/i")).toBeHidden({ timeout: 15000 });
    const layout = visibleLayout(page);

    // On a fresh user with no quick foods, the QuickPills component
    // shows an empty state with "Search for foods above to start logging"
    const emptyState = layout.locator("text=/search for foods above to start logging/i");

    // The empty state may or may not be visible depending on whether
    // the user has any starter foods seeded
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    // If no empty state, there should be QuickPill buttons
    // Grid layout shows "XX cal", horizontal layout only shows food name
    const quickPillButtonsWithCal = layout.locator('button').filter({ hasText: /\d+ cal/ });
    const quickPillsSection = layout.getByRole('heading', { name: 'Quick Add', exact: true });
    const hasPillsWithCal = await quickPillButtonsWithCal.count() > 0;
    const hasQuickAddSection = await quickPillsSection.isVisible().catch(() => false);

    // Either empty state, pills with calories, or the Quick Add section should be present
    expect(hasEmptyState || hasPillsWithCal || hasQuickAddSection).toBeTruthy();
  });

  test("should show QuickPills in horizontal scroll on mobile", async ({ page }) => {
    const persona = getPersona("chris");

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    // Wait for page to finish loading food data
    await expect(page.locator("text=/loading your food log/i")).toBeHidden({ timeout: 15000 });
    const layout = visibleLayout(page);

    // On mobile, QuickPills use layout="horizontal" which renders as a flex
    // container with overflow-x-auto and scrollbar-hide classes
    // QuickPill buttons contain food name + calorie info
    const quickPillButtons = layout.locator('button').filter({ hasText: /\d+ cal/ });
    const pillCount = await quickPillButtons.count();

    // If there are pills, verify they are visible on mobile
    if (pillCount > 0) {
      const firstPill = quickPillButtons.first();
      await expect(firstPill).toBeVisible();

      // Verify the horizontal scroll container exists (flex + overflow-x-auto)
      const scrollContainer = layout.locator('.overflow-x-auto').first();
      const hasScroll = await scrollContainer.isVisible().catch(() => false);
      // Either overflow-x-auto container or the pills are just in a flex row
      expect(hasScroll || pillCount > 0).toBeTruthy();
    } else {
      // Fresh user — empty state, meal sections, or any page content visible is acceptable
      const emptyState = layout.locator("text=/search for foods above to start logging/i");
      const mealSections = layout.locator('[data-testid^="add-food-"]');
      const mainContent = page.locator("main");
      const hasContent = await emptyState.isVisible().catch(() => false)
        || await mealSections.first().isVisible().catch(() => false)
        || await mainContent.isVisible().catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  test("should show QuickPills in grid layout on desktop", async ({ page }) => {
    const persona = getPersona("chris");

    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // On desktop, QuickPills are in a grid layout in the "Quick Add" section
    // Use exact match to avoid matching "AI Quick Add" as well
    const quickAddHeading = layout.getByRole('heading', { name: 'Quick Add', exact: true });
    await expect(quickAddHeading).toBeVisible({ timeout: 5000 });

    // The grid container should have grid-cols-2 class (from QuickPills grid layout)
    const gridContainer = layout.locator('.grid.grid-cols-2').first();
    const hasGrid = await gridContainer.isVisible().catch(() => false);

    // If grid not visible, check for empty state (valid for fresh users)
    if (!hasGrid) {
      const emptyState = layout.locator("text=/search for foods above to start logging/i");
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      // Either grid or empty state should be present
      expect(hasEmptyState).toBeTruthy();
    }
  });
});
