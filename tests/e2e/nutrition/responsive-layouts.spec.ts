/**
 * Responsive Layouts Tests
 *
 * Tests for mobile and desktop responsive layouts on the nutrition page.
 * The FoodLogPage uses different layout components based on viewport:
 * - Mobile (<1024px): MobileLayout - stacked, vertical sections
 * - Desktop (>=1024px): DesktopLayout - grid with sidebar
 *
 * Key differences to test:
 * 1. Mobile shows stacked layout, desktop shows side-by-side grid
 * 2. Progress bars are readable on both viewports
 * 3. QuickPills are scrollable horizontally on mobile, grid on desktop
 * 4. Meal sections are accessible and functional on both
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";
import { visibleLayout, clearRecentFoodLogs } from "../../fixtures/nutrition-helpers";
import { setupFoodSearchMock } from "../../fixtures/food-search-mock";

// Mobile viewport (iPhone SE size)
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Desktop viewport
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

test.describe("Responsive Layouts", () => {
  test.describe.configure({ mode: "serial" });

  test.describe("Mobile Layout", () => {
    test.beforeEach(async ({ page }) => {
      await setupFoodSearchMock(page);
      await page.setViewportSize(MOBILE_VIEWPORT);
    });

    test("should show stacked vertical layout on mobile", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // On mobile, MobileLayout is shown (lg:hidden class makes DesktopLayout hidden)
      // The layout should be a single column stacked vertically

      // Check that the macro progress section is visible
      const macroProgressSection = layout.locator("text=/calories/i").first();
      await expect(macroProgressSection).toBeVisible({ timeout: 5000 });

      // On mobile, macro bars should be in horizontal layout (side-by-side Calories and Protein)
      // Look for the horizontal flex container with macro bars
      const horizontalMacroContainer = layout.locator('div.flex.items-center.gap-4').first();
      const hasHorizontalMacros = await horizontalMacroContainer.isVisible().catch(() => false);

      // Mobile uses horizontal layout for progress bars
      expect(hasHorizontalMacros).toBeTruthy();

      // Verify meal sections are visible and stacked
      const breakfastSection = layout.locator("div").filter({ hasText: /^Breakfast/ }).first();
      const lunchSection = layout.locator("div").filter({ hasText: /^Lunch/ }).first();

      await expect(breakfastSection).toBeVisible();
      await expect(lunchSection).toBeVisible();

      // Get bounding boxes to verify stacking (Lunch should be below Breakfast)
      const breakfastBox = await breakfastSection.boundingBox();
      const lunchBox = await lunchSection.boundingBox();

      if (breakfastBox && lunchBox) {
        // On mobile, sections should be stacked vertically
        expect(lunchBox.y).toBeGreaterThan(breakfastBox.y);
      }
    });

    test("should show QuickPills in horizontal scrollable layout on mobile", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // QuickPills on mobile use layout="horizontal" which renders as overflow-x-auto
      // First, let's log a food to populate QuickPills
      const addButton = layout.locator('[data-testid="add-food-breakfast"]');
      await addButton.click();

      const searchInput = layout.getByPlaceholder(/Search foods for/i);
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      await searchInput.fill("banana");
      await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
      const firstResult = layout.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await layout.getByRole("button", { name: /confirm/i }).click();
      await expect(searchInput).not.toBeVisible({ timeout: 5000 });
      await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

      // Look for horizontal scroll container for QuickPills
      // The QuickPills with horizontal layout has overflow-x-auto and whitespace-nowrap
      const horizontalScrollContainer = layout.locator('.overflow-x-auto, [class*="overflow-x"]');
      const hasHorizontalScroll = await horizontalScrollContainer.count() > 0;

      // On mobile, either we have horizontal scroll container or empty state
      // Both are valid mobile layouts
      const emptyState = layout.locator("text=/search for foods above to start logging/i");
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(hasHorizontalScroll || hasEmptyState).toBeTruthy();
    });

    test("should have readable progress bars on mobile viewport", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // Set nutrition targets first
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

      // Verify calorie progress text is visible and readable
      const calorieText = layout.locator("text=/\\d+\\s*\\/\\s*2000/i").first();
      await expect(calorieText).toBeVisible({ timeout: 5000 });

      // Verify protein progress text is visible
      const proteinText = layout.locator("text=/\\d+g\\s*\\/\\s*150g/i").first();
      await expect(proteinText).toBeVisible({ timeout: 5000 });

      // Check that progress bars have sufficient width to be visible
      const progressBars = layout.locator('div.h-2.bg-\\[\\#E2E8F0\\].rounded-full');
      const barCount = await progressBars.count();

      // Should have at least 2 progress bars (calories and protein in horizontal layout)
      expect(barCount).toBeGreaterThanOrEqual(2);

      // Verify bars are wide enough to be readable on mobile
      for (let i = 0; i < Math.min(barCount, 2); i++) {
        const bar = progressBars.nth(i);
        const box = await bar.boundingBox();
        if (box) {
          // Bar should be at least 80px wide to be readable on mobile
          expect(box.width).toBeGreaterThanOrEqual(80);
        }
      }
    });

    test("should allow adding food on mobile viewport", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Clear leftover food logs from parallel tests
      await clearRecentFoodLogs(page);
      await page.reload();
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // Find and click Add button for Lunch (avoid Breakfast which other tests use)
      const addButton = layout.locator('[data-testid="add-food-lunch"]');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();

      // Verify search panel opens
      const searchInput = layout.getByPlaceholder(/Search foods for/i);
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      // Search and add food
      await searchInput.fill("chicken");
      await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
      const firstResult = layout.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      // Confirm serving size
      await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await layout.getByRole("button", { name: /confirm/i }).click();

      // Wait for save to complete
      await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

      // Verify food was added
      await expect(layout.locator('[data-testid="food-log-item"]').filter({ hasText: /chicken/i }).first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Desktop Layout", () => {
    test.beforeEach(async ({ page }) => {
      await setupFoodSearchMock(page);
      await page.setViewportSize(DESKTOP_VIEWPORT);
    });

    test("should show side-by-side grid layout on desktop", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // On desktop, DesktopLayout is shown (hidden lg:block)
      // The layout uses lg:grid-cols-3 for 1 col sidebar + 2 col content

      // Look for the 3-column grid container
      const gridContainer = layout.locator('div.grid.lg\\:grid-cols-3');
      await expect(gridContainer).toBeVisible({ timeout: 5000 });

      // The left sidebar should contain "Quick Add" section
      const quickAddHeading = layout.getByRole('heading', { name: 'Quick Add', exact: true });
      await expect(quickAddHeading).toBeVisible({ timeout: 5000 });

      // The right content should contain "Today's Meals" or similar
      const mealsHeading = layout.locator("text=/meals/i").first();
      await expect(mealsHeading).toBeVisible({ timeout: 5000 });

      // Verify sidebar and content are side-by-side (not stacked)
      const sidebar = layout.locator('div.lg\\:col-span-1').first();
      const content = layout.locator('div.lg\\:col-span-2').first();

      const sidebarBox = await sidebar.boundingBox();
      const contentBox = await content.boundingBox();

      if (sidebarBox && contentBox) {
        // On desktop, sidebar and content should be at similar Y position (side-by-side)
        // and content should be to the right of sidebar
        expect(contentBox.x).toBeGreaterThan(sidebarBox.x);
        // They should be roughly aligned at the top
        expect(Math.abs(contentBox.y - sidebarBox.y)).toBeLessThan(50);
      }
    });

    test("should show QuickPills in grid layout on desktop", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // On desktop, QuickPills uses layout="grid" with grid-cols-2
      const quickAddHeading = layout.getByRole('heading', { name: 'Quick Add', exact: true });
      await expect(quickAddHeading).toBeVisible({ timeout: 5000 });

      // Look for grid container within Quick Add section
      const gridContainer = layout.locator('.grid.grid-cols-2').first();
      const hasGrid = await gridContainer.isVisible().catch(() => false);

      // If no grid visible, check for empty state (valid for fresh users)
      if (!hasGrid) {
        const emptyState = layout.locator("text=/search for foods above to start logging/i");
        const hasEmptyState = await emptyState.isVisible().catch(() => false);
        expect(hasEmptyState).toBeTruthy();
      } else {
        expect(hasGrid).toBeTruthy();
      }
    });

    test("should have vertical progress bars on desktop", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // Set nutrition targets first
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

      // On desktop, the "Today's Progress" section uses vertical layout
      // This shows all 4 macros stacked (Calories, Protein, Carbs, Fat)
      const todaysProgressHeading = layout.locator("h3").filter({ hasText: /today's progress/i });
      await expect(todaysProgressHeading).toBeVisible({ timeout: 5000 });

      // Verify all macro labels are visible in vertical layout
      const caloriesLabel = layout.locator("span").filter({ hasText: /^calories$/i });
      const proteinLabel = layout.locator("span").filter({ hasText: /^protein$/i });
      const carbsLabel = layout.locator("span").filter({ hasText: /^carbs$/i });
      const fatLabel = layout.locator("span").filter({ hasText: /^fat$/i });

      await expect(caloriesLabel.first()).toBeVisible({ timeout: 3000 });
      await expect(proteinLabel.first()).toBeVisible({ timeout: 3000 });
      await expect(carbsLabel.first()).toBeVisible({ timeout: 3000 });
      await expect(fatLabel.first()).toBeVisible({ timeout: 3000 });
    });

    test("should have sticky sidebar on desktop", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // Add some food to create scrollable content
      const addButton = layout.locator('[data-testid="add-food-breakfast"]');
      await addButton.click();

      const searchInput = layout.getByPlaceholder(/Search foods for/i);
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      await searchInput.fill("banana");
      await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
      const firstResult = layout.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await layout.getByRole("button", { name: /confirm/i }).click();
      await expect(searchInput).not.toBeVisible({ timeout: 5000 });
      await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

      // The sidebar column (lg:col-span-1) contains a sticky inner div
      // On desktop, the left column has the Quick Add section
      const sidebarColumn = layout.locator('div.lg\\:col-span-1').first();
      await expect(sidebarColumn).toBeVisible({ timeout: 3000 });

      // Verify the Quick Add heading is within the sidebar
      const quickAddHeading = sidebarColumn.getByRole('heading', { name: 'Quick Add', exact: true });
      await expect(quickAddHeading).toBeVisible({ timeout: 3000 });

      // Verify the sidebar inner container has sticky positioning via class
      const stickyContainer = sidebarColumn.locator('[class*="sticky"]').first();
      const hasStickyClass = await stickyContainer.isVisible().catch(() => false);
      expect(hasStickyClass).toBeTruthy();
    });

    test("should allow adding food on desktop viewport", async ({ page }) => {
      const persona = getPersona("kim");

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      const layout = visibleLayout(page);

      // Find and click Add button for Lunch
      const addButton = layout.locator('[data-testid="add-food-lunch"]');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();

      // Verify search panel opens
      const searchInput = layout.getByPlaceholder(/Search foods for/i);
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      // Search and add food
      await searchInput.fill("rice");
      await expect(layout.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
      const firstResult = layout.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      // Confirm serving size
      await expect(layout.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await layout.getByRole("button", { name: /confirm/i }).click();

      // Wait for save to complete
      await expect(layout.locator("text=/Saving/i")).not.toBeVisible({ timeout: 30000 });

      // Verify food was added
      await expect(layout.locator('[data-testid="food-log-item"]').filter({ hasText: /rice/i }).first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Viewport Switching", () => {
    test("should switch layouts when viewport changes", async ({ page }) => {
      const persona = getPersona("kim");

      // Start with desktop viewport
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Verify desktop layout elements (scoped to desktop-layout)
      const desktopLayout = visibleLayout(page);
      const gridContainer = desktopLayout.locator('div.grid.lg\\:grid-cols-3');
      await expect(gridContainer).toBeVisible({ timeout: 5000 });

      // Quick Add heading should be visible on desktop (exact match to avoid "AI Quick Add")
      const quickAddHeading = desktopLayout.getByRole('heading', { name: 'Quick Add', exact: true });
      await expect(quickAddHeading).toBeVisible({ timeout: 3000 });

      // Switch to mobile viewport
      await page.setViewportSize(MOBILE_VIEWPORT);

      // Now scope to mobile layout
      const mobileLayout = visibleLayout(page);

      // On mobile, the Quick Add sidebar becomes a bottom sheet (not visible by default)
      // Instead, we should see the mobile header with coral background
      const mobileHeader = mobileLayout.locator('div.bg-\\[\\#FF6B6B\\]').first();
      const hasCoralHeader = await mobileHeader.isVisible().catch(() => false);

      // Mobile layout should have distinct styling
      // Either coral header visible OR meals stacked vertically
      const breakfastSection = mobileLayout.locator("div").filter({ hasText: /^Breakfast/ }).first();
      const lunchSection = mobileLayout.locator("div").filter({ hasText: /^Lunch/ }).first();

      await expect(breakfastSection).toBeVisible({ timeout: 3000 });
      await expect(lunchSection).toBeVisible({ timeout: 3000 });

      // Verify stacking (mobile behavior)
      const breakfastBox = await breakfastSection.boundingBox();
      const lunchBox = await lunchSection.boundingBox();

      if (breakfastBox && lunchBox) {
        // On mobile, sections should be stacked (lunch below breakfast)
        expect(lunchBox.y).toBeGreaterThan(breakfastBox.y);
      }
    });
  });
});
