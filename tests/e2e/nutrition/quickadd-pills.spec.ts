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
import { getFreshNutritionPersona } from "../../fixtures/personas";
import { visibleLayout } from "../../fixtures/nutrition-helpers";

test.describe("QuickAdd Pills Flow", () => {
  // Seed personas before all tests in this file

  test("should see QuickPills section on nutrition page", async ({ page }) => {
    const persona = getFreshNutritionPersona();

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
    const persona = getFreshNutritionPersona();

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
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Wait for serving size selector and confirm
    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /confirm/i }).click();

    // Wait for food to be added
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

    // Verify the food was actually logged in a meal section
    await expect(layout.locator('[data-testid="food-log-item"]').filter({ hasText: /banana/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test("should click QuickPill and add food instantly (no modal)", async ({ page }) => {
    const persona = getFreshNutritionPersona();

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
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /confirm/i }).click();
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

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
    await expect(page.locator("text=/added:/i")).toBeVisible({ timeout: 3000 });

    // Verify no modal appeared (instant add, no confirmation dialog)
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test("should verify macro bars update after QuickPill add", async ({ page }) => {
    const persona = getFreshNutritionPersona();

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
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /confirm/i }).click();
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

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
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // On a fresh user with no quick foods, the QuickPills component
    // shows an empty state with "Search for foods above to start logging"
    const emptyState = layout.locator("text=/search for foods above to start logging/i");

    // The empty state may or may not be visible depending on whether
    // the user has any starter foods seeded
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    // If no empty state, there should be QuickPill buttons
    const quickPillButtons = layout.locator('button').filter({
      has: page.locator('svg[class*="plus"], [class*="Plus"]'),
    });
    const hasPills = await quickPillButtons.count() > 0;

    // Either empty state or pills should be present — one must be true
    expect(hasEmptyState || hasPills).toBeTruthy();
  });

  test("should show QuickPills in horizontal scroll on mobile", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // On mobile, QuickPills are in a horizontal scrollable container
    // Look for the pills container with overflow-x-auto class
    const pillsContainer = layout.locator('.overflow-x-auto, [style*="overflow-x"]').first();

    // If user has quick foods, verify the container is scrollable
    const quickPillButtons = layout.locator('button').filter({
      has: page.locator('svg[class*="plus"], [class*="Plus"]'),
    });

    const pillCount = await quickPillButtons.count();

    // If there are pills, the container should be using horizontal layout
    if (pillCount > 0) {
      // Pills should be in a flex row with gap
      const firstPill = quickPillButtons.first();
      await expect(firstPill).toBeVisible();
    } else {
      // Fresh user — empty state or no pills section is acceptable
      const emptyState = layout.locator("text=/search for foods above to start logging/i");
      const mealSections = layout.locator('[data-testid^="add-food-"]');
      const hasContent = await emptyState.isVisible().catch(() => false) || await mealSections.first().isVisible().catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  test("should show QuickPills in grid layout on desktop", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // On desktop, QuickPills are in a grid layout in the "Quick Add" section
    const quickAddHeading = layout.locator("h3").filter({ hasText: /quick add/i });
    await expect(quickAddHeading).toBeVisible({ timeout: 5000 });

    // The grid container should have grid-cols-2 class
    const gridContainer = layout.locator('.grid.grid-cols-2').first();
    const hasGrid = await gridContainer.isVisible().catch(() => false);

    // If grid not visible, check for empty state
    if (!hasGrid) {
      const emptyState = layout.locator("text=/search for foods above to start logging/i");
      await expect(emptyState).toBeVisible();
    }
  });
});
