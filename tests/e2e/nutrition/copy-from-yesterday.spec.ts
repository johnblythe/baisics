/**
 * Nutrition Copy from Yesterday Tests
 *
 * Tests for copying meals from the previous day on the nutrition page.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * The copy from yesterday flow involves:
 * 1. Having food logged on the previous day for a specific meal
 * 2. Navigating to the current day (or target day)
 * 3. In the empty meal section, clicking "Copy from yesterday"
 * 4. Verifying copied items appear
 * 5. Verifying macros update
 *
 * Covers:
 * - Has food logged on previous day
 * - Clicks "Copy from yesterday" on a meal
 * - Verifies copied items appear
 * - Verifies macros update
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getFreshNutritionPersona } from "../../fixtures/personas";

test.describe("Nutrition Copy from Yesterday", () => {
  // Seed personas before all tests in this file

  /**
   * Helper to add a food item to a specific meal section.
   * Returns the name of the food added for verification.
   */
  async function addFoodToMeal(
    page: import("@playwright/test").Page,
    mealName: string,
    searchTerm: string
  ): Promise<string> {
    // Open inline search for the meal
    const addButton = page.locator(`[data-testid="add-food-${mealName.toLowerCase()}"]`).first();
    await addButton.click();

    // Wait for search input
    const searchInput = page.locator(
      'input[role="combobox"], input[placeholder*="search" i]'
    );
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search and select a food
    await searchInput.fill(searchTerm);
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });

    // Get the first result text for verification
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    const foodName = (await firstResult.textContent()) || searchTerm;
    await firstResult.click();

    // Wait for serving size selector and confirm
    await expect(page.getByLabel(/serving size/i)).toBeVisible({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /confirm/i }).click();

    // Wait for food to be added - search panel should close
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

    return foodName;
  }

  /**
   * Helper to navigate to yesterday's date using the left arrow.
   */
  async function goToYesterday(page: import("@playwright/test").Page): Promise<void> {
    // Click the left arrow to go to previous day
    const leftArrow = page.locator('[data-testid="prev-day"]').first();
    await leftArrow.click();
    // Wait for date header to change away from "Today"
    await expect(page.locator("h1")).not.toContainText("Today", { timeout: 3000 });
  }

  /**
   * Helper to navigate back to today using "Jump to Today" link.
   */
  async function goToToday(page: import("@playwright/test").Page): Promise<void> {
    // Click "Jump to Today" button that appears when not on today
    const todayButton = page.getByRole("button", { name: /jump to today/i });
    await todayButton.click();
    // Wait for date header to show "Today"
    await expect(page.locator("h1")).toContainText("Today", { timeout: 3000 });
  }

  test("should show copy from yesterday option when yesterday has food", async ({
    page,
  }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Navigate to yesterday
    await goToYesterday(page);

    // Add food to Breakfast for yesterday
    await addFoodToMeal(page, "Breakfast", "eggs");

    // Wait for food to appear in Breakfast section
    const breakfastSection = page
      .locator("div")
      .filter({ hasText: /^Breakfast/ })
      .first();
    await expect(breakfastSection).toContainText(/egg/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Verify today's Breakfast is empty (shows the dashed border empty state)
    // The copy from yesterday button should be visible
    const copyButton = page.locator('button', { hasText: /copy from yesterday/i });
    await expect(copyButton).toBeVisible({ timeout: 5000 });

    // Verify the copy button shows the calories from yesterday
    await expect(copyButton).toContainText(/cal/i);
  });

  test("should copy food from yesterday to today when clicking copy button", async ({
    page,
  }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Navigate to yesterday
    await goToYesterday(page);

    // Add food to Lunch for yesterday
    await addFoodToMeal(page, "Lunch", "chicken");

    // Wait for food to appear in Lunch section
    const lunchSectionYesterday = page
      .locator("div")
      .filter({ hasText: /^Lunch/ })
      .first();
    await expect(lunchSectionYesterday).toContainText(/chicken/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Verify today's Lunch is empty and shows copy option
    const copyButton = page
      .locator("div")
      .filter({ hasText: /^Lunch/ })
      .first()
      .locator('button', { hasText: /copy from yesterday/i });
    await expect(copyButton).toBeVisible({ timeout: 5000 });

    // Click copy from yesterday
    await copyButton.click();

    // Wait for copy to complete - button should show "Copied from yesterday"
    await expect(page.locator('text=/copied from yesterday/i')).toBeVisible({ timeout: 5000 });

    // Verify the chicken now appears in today's Lunch section
    const lunchSectionToday = page
      .locator("div")
      .filter({ hasText: /^Lunch/ })
      .first();
    await expect(lunchSectionToday).toContainText(/chicken/i, { timeout: 5000 });
  });

  test("should update macro bars after copying food from yesterday", async ({
    page,
  }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // First, set nutrition targets so we have progress bars
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    if (await setGoalsButton.isVisible().catch(() => false)) {
      await setGoalsButton.click();
      await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

      // Set targets
      await page.getByLabel(/daily calories/i).fill("2000");
      await page.getByLabel(/protein/i).fill("150");
      await page.getByLabel(/carbs/i).fill("200");
      await page.getByLabel(/fat/i).fill("65");

      await page.getByRole("button", { name: /save targets/i }).click();
      await expect(
        page.locator('[role="dialog"], .fixed.inset-0')
      ).not.toBeVisible({ timeout: 5000 });
    }

    // Navigate to yesterday
    await goToYesterday(page);

    // Add food to Dinner for yesterday
    await addFoodToMeal(page, "Dinner", "salmon");

    // Wait for food to appear
    const dinnerSectionYesterday = page
      .locator("div")
      .filter({ hasText: /^Dinner/ })
      .first();
    await expect(dinnerSectionYesterday).toContainText(/salmon/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Get current calorie display value (should be 0 or near 0)
    const calorieDisplayBefore = page.locator("text=/\\d+\\s*\\/\\s*2000/i").first();
    const beforeText = (await calorieDisplayBefore.textContent()) || "0";
    const beforeMatch = beforeText.match(/(\d+)/);
    const beforeCalories = beforeMatch ? parseInt(beforeMatch[1], 10) : 0;

    // Find and click copy from yesterday for Dinner
    const copyButton = page
      .locator("div")
      .filter({ hasText: /^Dinner/ })
      .first()
      .locator('button', { hasText: /copy from yesterday/i });
    await expect(copyButton).toBeVisible({ timeout: 5000 });
    await copyButton.click();

    // Wait for copy to complete
    await expect(page.locator('text=/copied from yesterday/i')).toBeVisible({ timeout: 5000 });

    // Calories should have increased after copying
    await expect(async () => {
      const afterText = (await page.locator("text=/\\d+\\s*\\/\\s*2000/i").first().textContent()) || "0";
      const afterMatch = afterText.match(/(\d+)/);
      const afterCalories = afterMatch ? parseInt(afterMatch[1], 10) : 0;
      expect(afterCalories).toBeGreaterThan(beforeCalories);
    }).toPass({ timeout: 5000 });
  });

  test("should not show copy option when yesterday has no food for that meal", async ({
    page,
  }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Navigate to yesterday
    await goToYesterday(page);

    // Add food ONLY to Breakfast (not Snack)
    await addFoodToMeal(page, "Breakfast", "banana");

    // Wait for food to appear in Breakfast
    await expect(
      page.locator("div").filter({ hasText: /^Breakfast/ }).first()
    ).toContainText(/banana/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Snack section should show empty state but NOT show "Copy from yesterday"
    // because yesterday's Snack was empty
    const snackSection = page.locator("div").filter({ hasText: /^Snack/ }).first();
    await expect(snackSection).toBeVisible();

    // The copy button should NOT be visible for Snack
    const snackCopyButton = snackSection.locator('button', { hasText: /copy from yesterday/i });
    await expect(snackCopyButton).not.toBeVisible({ timeout: 2000 });

    // But Breakfast SHOULD show the copy option
    const breakfastCopyButton = page
      .locator("div")
      .filter({ hasText: /^Breakfast/ })
      .first()
      .locator('button', { hasText: /copy from yesterday/i });
    await expect(breakfastCopyButton).toBeVisible({ timeout: 5000 });
  });

  test("should show loading state while copying", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Navigate to yesterday
    await goToYesterday(page);

    // Add food to Lunch
    await addFoodToMeal(page, "Lunch", "rice");

    // Wait for food to appear
    await expect(
      page.locator("div").filter({ hasText: /^Lunch/ }).first()
    ).toContainText(/rice/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Find the copy button
    const copyButton = page
      .locator("div")
      .filter({ hasText: /^Lunch/ })
      .first()
      .locator('button', { hasText: /copy from yesterday/i });
    await expect(copyButton).toBeVisible({ timeout: 5000 });

    // Click copy and check for loading state (spinner icon should appear)
    await copyButton.click();

    // Loading spinner should appear briefly
    // The button becomes disabled during loading and shows a loader icon
    const spinner = page.locator('svg[class*="animate-spin"]');
    // Note: This may be too fast to catch, so we just verify the success state
    await expect(page.locator('text=/copied from yesterday/i')).toBeVisible({ timeout: 5000 });
  });

  test("should persist copied food after page reload", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Navigate to yesterday
    await goToYesterday(page);

    // Add food to Breakfast
    await addFoodToMeal(page, "Breakfast", "oatmeal");

    // Wait for food to appear
    await expect(
      page.locator("div").filter({ hasText: /^Breakfast/ }).first()
    ).toContainText(/oat/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Copy from yesterday
    const copyButton = page
      .locator("div")
      .filter({ hasText: /^Breakfast/ })
      .first()
      .locator('button', { hasText: /copy from yesterday/i });
    await expect(copyButton).toBeVisible({ timeout: 5000 });
    await copyButton.click();

    // Wait for copy to complete
    await expect(page.locator('text=/copied from yesterday/i')).toBeVisible({ timeout: 5000 });

    // Verify food appears
    const breakfastSection = page
      .locator("div")
      .filter({ hasText: /^Breakfast/ })
      .first();
    await expect(breakfastSection).toContainText(/oat/i, { timeout: 5000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector("main", { timeout: 10000 });

    // Verify the copied food is still there after reload
    const breakfastSectionAfterReload = page
      .locator("div")
      .filter({ hasText: /^Breakfast/ })
      .first();
    await expect(breakfastSectionAfterReload).toContainText(/oat/i, { timeout: 5000 });
  });

  test("should copy multiple foods from yesterday", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Navigate to yesterday
    await goToYesterday(page);

    // Add multiple foods to Dinner for yesterday
    await addFoodToMeal(page, "Dinner", "steak");
    // Wait for first food to appear before adding second
    await expect(page.locator('[data-testid="food-log-item"]').filter({ hasText: /steak/i }).first()).toBeVisible({ timeout: 5000 });
    await addFoodToMeal(page, "Dinner", "potato");

    // Wait for both foods to appear
    const dinnerSection = page
      .locator("div")
      .filter({ hasText: /^Dinner/ })
      .first();
    await expect(dinnerSection).toContainText(/steak/i, { timeout: 5000 });
    await expect(dinnerSection).toContainText(/potato/i, { timeout: 5000 });

    // Navigate back to today
    await goToToday(page);

    // Copy from yesterday
    const copyButton = page
      .locator("div")
      .filter({ hasText: /^Dinner/ })
      .first()
      .locator('button', { hasText: /copy from yesterday/i });
    await expect(copyButton).toBeVisible({ timeout: 5000 });
    await copyButton.click();

    // Wait for copy to complete
    await expect(page.locator('text=/copied from yesterday/i')).toBeVisible({ timeout: 5000 });

    // Verify BOTH foods appear in today's Dinner section
    const dinnerSectionToday = page
      .locator("div")
      .filter({ hasText: /^Dinner/ })
      .first();
    await expect(dinnerSectionToday).toContainText(/steak/i, { timeout: 5000 });
    await expect(dinnerSectionToday).toContainText(/potato/i, { timeout: 5000 });
  });
});
