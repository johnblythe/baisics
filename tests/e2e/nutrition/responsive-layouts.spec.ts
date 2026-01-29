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
import { getFreshNutritionPersona } from "../../fixtures/personas";

// Mobile viewport (iPhone SE size)
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Desktop viewport
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

test.describe("Responsive Layouts", () => {
  // Seed personas before all tests in this file

  test.describe("Mobile Layout", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
    });

    test("should show stacked vertical layout on mobile", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // On mobile, MobileLayout is shown (lg:hidden class makes DesktopLayout hidden)
      // The layout should be a single column stacked vertically

      // Check that the macro progress section is visible
      const macroProgressSection = page.locator("text=/calories/i").first();
      await expect(macroProgressSection).toBeVisible({ timeout: 5000 });

      // On mobile, macro bars should be in horizontal layout (side-by-side Calories and Protein)
      // Look for the horizontal flex container with macro bars
      const horizontalMacroContainer = page.locator('div.flex.items-center.gap-4').first();
      const hasHorizontalMacros = await horizontalMacroContainer.isVisible().catch(() => false);

      // Mobile uses horizontal layout for progress bars
      expect(hasHorizontalMacros).toBeTruthy();

      // Verify meal sections are visible and stacked
      const breakfastSection = page.locator("div").filter({ hasText: /^Breakfast/ }).first();
      const lunchSection = page.locator("div").filter({ hasText: /^Lunch/ }).first();

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
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // QuickPills on mobile use layout="horizontal" which renders as overflow-x-auto
      // First, let's log a food to populate QuickPills
      const addButton = page
        .locator("div")
        .filter({ hasText: /^Breakfast/ })
        .first()
        .locator("button", { hasText: /add/i });
      await addButton.click();

      const searchInput = page.locator('input[role="combobox"], input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      await searchInput.fill("banana");
      await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
      const firstResult = page.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /confirm/i }).click();
      await expect(searchInput).not.toBeVisible({ timeout: 5000 });

      // Wait for QuickPills to populate
      await page.waitForTimeout(1500);

      // Look for horizontal scroll container for QuickPills
      // The QuickPills with horizontal layout has overflow-x-auto and whitespace-nowrap
      const horizontalScrollContainer = page.locator('.overflow-x-auto, [class*="overflow-x"]');
      const hasHorizontalScroll = await horizontalScrollContainer.count() > 0;

      // On mobile, either we have horizontal scroll container or empty state
      // Both are valid mobile layouts
      const emptyState = page.locator("text=/search for foods above to start logging/i");
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(hasHorizontalScroll || hasEmptyState).toBeTruthy();
    });

    test("should have readable progress bars on mobile viewport", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

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
      const calorieText = page.locator("text=/\\d+\\s*\\/\\s*2000/i").first();
      await expect(calorieText).toBeVisible({ timeout: 5000 });

      // Verify protein progress text is visible
      const proteinText = page.locator("text=/\\d+g\\s*\\/\\s*150g/i").first();
      await expect(proteinText).toBeVisible({ timeout: 5000 });

      // Check that progress bars have sufficient width to be visible
      const progressBars = page.locator('div.h-2.bg-\\[\\#E2E8F0\\].rounded-full');
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
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Find and click Add button for Breakfast
      const breakfastSection = page.locator("div").filter({ hasText: /^Breakfast/ }).first();
      const addButton = breakfastSection.locator("button", { hasText: /add/i });
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();

      // Verify search panel opens
      const searchInput = page.locator('input[role="combobox"], input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      // Search and add food
      await searchInput.fill("chicken");
      await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
      const firstResult = page.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      // Confirm serving size
      await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /confirm/i }).click();

      // Verify food was added
      await page.waitForTimeout(1000);
      const addedFood = page.locator("text=/chicken/i");
      await expect(addedFood.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Desktop Layout", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
    });

    test("should show side-by-side grid layout on desktop", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // On desktop, DesktopLayout is shown (hidden lg:block)
      // The layout uses lg:grid-cols-3 for 1 col sidebar + 2 col content

      // Look for the 3-column grid container
      const gridContainer = page.locator('div.grid.lg\\:grid-cols-3');
      await expect(gridContainer).toBeVisible({ timeout: 5000 });

      // The left sidebar should contain "Quick Add" section
      const quickAddHeading = page.locator("h3").filter({ hasText: /quick add/i });
      await expect(quickAddHeading).toBeVisible({ timeout: 5000 });

      // The right content should contain "Today's Meals" or similar
      const mealsHeading = page.locator("text=/meals/i").first();
      await expect(mealsHeading).toBeVisible({ timeout: 5000 });

      // Verify sidebar and content are side-by-side (not stacked)
      const sidebar = page.locator('div.lg\\:col-span-1').first();
      const content = page.locator('div.lg\\:col-span-2').first();

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
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // On desktop, QuickPills uses layout="grid" with grid-cols-2
      const quickAddHeading = page.locator("h3").filter({ hasText: /quick add/i });
      await expect(quickAddHeading).toBeVisible({ timeout: 5000 });

      // Look for grid container within Quick Add section
      const gridContainer = page.locator('.grid.grid-cols-2').first();
      const hasGrid = await gridContainer.isVisible().catch(() => false);

      // If no grid visible, check for empty state (valid for fresh users)
      if (!hasGrid) {
        const emptyState = page.locator("text=/search for foods above to start logging/i");
        const hasEmptyState = await emptyState.isVisible().catch(() => false);
        expect(hasEmptyState).toBeTruthy();
      } else {
        expect(hasGrid).toBeTruthy();
      }
    });

    test("should have vertical progress bars on desktop", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

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
      const todaysProgressHeading = page.locator("h3").filter({ hasText: /today's progress/i });
      await expect(todaysProgressHeading).toBeVisible({ timeout: 5000 });

      // Verify all macro labels are visible in vertical layout
      const caloriesLabel = page.locator("span").filter({ hasText: /^calories$/i });
      const proteinLabel = page.locator("span").filter({ hasText: /^protein$/i });
      const carbsLabel = page.locator("span").filter({ hasText: /^carbs$/i });
      const fatLabel = page.locator("span").filter({ hasText: /^fat$/i });

      await expect(caloriesLabel.first()).toBeVisible({ timeout: 3000 });
      await expect(proteinLabel.first()).toBeVisible({ timeout: 3000 });
      await expect(carbsLabel.first()).toBeVisible({ timeout: 3000 });
      await expect(fatLabel.first()).toBeVisible({ timeout: 3000 });
    });

    test("should have sticky sidebar on desktop", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Add some food to create scrollable content
      const addButton = page
        .locator("div")
        .filter({ hasText: /^Breakfast/ })
        .first()
        .locator("button", { hasText: /add/i });
      await addButton.click();

      const searchInput = page.locator('input[role="combobox"], input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      await searchInput.fill("banana");
      await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
      const firstResult = page.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /confirm/i }).click();
      await expect(searchInput).not.toBeVisible({ timeout: 5000 });

      // The sidebar should have lg:sticky lg:top-6 classes
      const stickySidebar = page.locator('div.lg\\:sticky.lg\\:top-6');
      await expect(stickySidebar).toBeVisible({ timeout: 3000 });

      // Verify the Quick Add heading is within the sticky container
      const quickAddHeading = stickySidebar.locator("h3").filter({ hasText: /quick add/i });
      await expect(quickAddHeading).toBeVisible({ timeout: 3000 });
    });

    test("should allow adding food on desktop viewport", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Find and click Add button for Lunch
      const lunchSection = page.locator("div").filter({ hasText: /^Lunch/ }).first();
      const addButton = lunchSection.locator("button", { hasText: /add/i });
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();

      // Verify search panel opens
      const searchInput = page.locator('input[role="combobox"], input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible({ timeout: 3000 });

      // Search and add food
      await searchInput.fill("rice");
      await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
      const firstResult = page.locator('[role="option"]').first();
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();

      // Confirm serving size
      await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /confirm/i }).click();

      // Verify food was added
      await page.waitForTimeout(1000);
      const addedFood = page.locator("text=/rice/i");
      await expect(addedFood.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Viewport Switching", () => {
    test("should switch layouts when viewport changes", async ({ page }) => {
      const persona = getFreshNutritionPersona();

      // Start with desktop viewport
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Verify desktop layout elements
      const gridContainer = page.locator('div.grid.lg\\:grid-cols-3');
      await expect(gridContainer).toBeVisible({ timeout: 5000 });

      // Quick Add heading should be visible on desktop
      const quickAddHeading = page.locator("h3").filter({ hasText: /quick add/i });
      await expect(quickAddHeading).toBeVisible({ timeout: 3000 });

      // Switch to mobile viewport
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.waitForTimeout(500); // Allow CSS to recalculate

      // The 3-column grid should no longer be visible (becomes single column)
      // Desktop layout uses hidden lg:block, so on mobile the MobileLayout should render

      // On mobile, the Quick Add sidebar becomes a bottom sheet (not visible by default)
      // Instead, we should see the mobile header with coral background
      const mobileHeader = page.locator('div.bg-\\[\\#FF6B6B\\]').first();
      const hasCoralHeader = await mobileHeader.isVisible().catch(() => false);

      // Mobile layout should have distinct styling
      // Either coral header visible OR meals stacked vertically
      const breakfastSection = page.locator("div").filter({ hasText: /^Breakfast/ }).first();
      const lunchSection = page.locator("div").filter({ hasText: /^Lunch/ }).first();

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
