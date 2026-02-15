/**
 * Nutrition Food Search and Logging Tests
 *
 * Tests for the food search and logging flow on the nutrition page.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * The flow involves:
 * 1. Clicking "Add" on a meal section to open inline search
 * 2. Typing a search query in the autocomplete input
 * 3. Selecting a food result from the dropdown
 * 4. Adjusting serving size in the ServingSizeSelector
 * 5. Confirming to add the food to the meal
 * 6. Verifying the food appears in the meal section
 * 7. Verifying macro bars update
 *
 * Covers:
 * - Opening inline search panel on a meal section
 * - Searching for foods via FoodSearchAutocomplete
 * - Viewing search results
 * - Selecting a result to open serving modal
 * - Adjusting serving size
 * - Adding food to meal
 * - Verifying food appears in meal section
 * - Verifying macro bars update
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getFreshNutritionPersona } from "../../fixtures/personas";
import { visibleLayout } from "../../fixtures/nutrition-helpers";

test.describe("Nutrition Food Search and Logging", () => {
  // Seed personas before all tests in this file

  test("should open inline search panel when clicking Add on a meal", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Click the Add button on Breakfast section
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    // Verify the inline search panel opens - should show search input
    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Should also show "Adding to Breakfast" indicator
    await expect(layout.locator("text=/adding to breakfast/i")).toBeVisible();
  });

  test("should show search results when typing in search box", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Open inline search on Breakfast
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    // Wait for search input
    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Type a search query
    await searchInput.fill("chicken");

    // Wait for search results to appear (debounced 300ms + API call)
    // Results appear in a listbox
    await page.waitForSelector('[role="listbox"], [id="food-search-results"]', { timeout: 10000 });

    // Verify results are displayed - should have at least one option
    const results = page.locator('[role="option"], [id="food-search-results"] li');
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    // Verify "chicken" appears in the results
    await expect(page.locator('[role="listbox"]')).toContainText(/chicken/i);
  });

  test("should open serving size selector when clicking a search result", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Open inline search
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search for a food
    await searchInput.fill("banana");

    // Wait for results
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });

    // Click on first result
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Verify serving size selector appears
    // ServingSizeSelector has a "Serving size (grams)" label
    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });

    // Should show the food name header
    await expect(page.locator("text=/banana/i").first()).toBeVisible();

    // Should have a Confirm button
    await expect(page.getByRole("button", { name: /confirm/i })).toBeVisible();
  });

  test("should allow adjusting serving size with quick amount buttons", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Open inline search
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search and select a food
    await searchInput.fill("rice");
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Wait for serving size selector
    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });

    // Quick amount buttons: 50g, 100g, 150g, 200g
    const button150g = page.getByRole("button", { name: "150g" });
    await expect(button150g).toBeVisible();
    await button150g.click();

    // Verify the input was updated to 150
    const servingInput = page.locator('input#grams-input, input[type="number"]').first();
    await expect(servingInput).toHaveValue("150");

    // Verify the calculated macros section shows "Nutrition for 150g"
    await expect(page.locator("text=Nutrition for 150g")).toBeVisible();
  });

  test("should add food to meal and show in meal section", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Open inline search for Lunch
    const addButtonLunch = layout.locator('[data-testid="add-food-lunch"]');
    await addButtonLunch.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search and select a food
    await searchInput.fill("salmon");
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Wait for serving size selector
    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });

    // Use default 100g and confirm
    const confirmButton = page.getByRole("button", { name: /confirm/i });
    await confirmButton.click();

    // Wait for the food to be added - search panel should close
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

    // Verify the food appears in the Lunch section
    // The meal section should now show the food item
    const lunchSection = layout.locator("div").filter({ hasText: /^Lunch/ }).first();
    await expect(lunchSection).toContainText(/salmon/i, { timeout: 5000 });

    // Verify meal totals updated (should show cal and P)
    await expect(lunchSection).toContainText(/cal/i);
    await expect(lunchSection).toContainText(/P$/i);
  });

  test("should update macro progress bars after adding food", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // First, set some nutrition targets so we have progress bars
    // Open targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    if (await setGoalsButton.isVisible().catch(() => false)) {
      await setGoalsButton.click();
      await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

      // Set manual targets: 2000 cal, 150g protein, 200g carbs, 65g fat
      await page.getByLabel(/daily calories/i).fill("2000");
      await page.getByLabel(/protein/i).fill("150");
      await page.getByLabel(/carbs/i).fill("200");
      await page.getByLabel(/fat/i).fill("65");

      // Save
      await page.getByRole("button", { name: /save targets/i }).click();
      await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible({ timeout: 5000 });
    }

    // Get initial calorie display (should be 0 or close to it)
    const calorieDisplay = layout.locator("text=/\\d+\\s*\\/\\s*\\d+\\s*cal/i").first();

    // Open inline search for Snack
    const addButtonSnack = layout.locator('[data-testid="add-food-snack"]');
    await addButtonSnack.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search and add a food with known macros
    await searchInput.fill("almonds");
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Wait for serving size selector and confirm with 50g
    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: "50g" }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    // Wait for food to be added
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

    // Verify that the calorie value is now > 0
    // The progress display should show consumed/target format
    // We look for any number greater than 0 in the calorie display
    await expect(layout.locator("text=/[1-9]\\d*\\s*\\/\\s*2000/i")).toBeVisible({ timeout: 5000 });
  });

  test("should handle empty search results gracefully", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Open inline search
    const addButton = layout.locator('[data-testid="add-food-dinner"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search for something unlikely to exist
    await searchInput.fill("xyzqwertynonexistent");

    // Wait for search to complete
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });

    // Should show "No foods found" message
    await expect(page.locator("text=/no foods found/i")).toBeVisible({ timeout: 3000 });

    // Should also show AI estimate option
    await expect(page.locator("text=/estimate with ai/i")).toBeVisible();
  });

  test("should close search panel when clicking Cancel", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Open inline search
    const addButton = layout.locator('[data-testid="add-food-breakfast"]');
    await addButton.click();

    const searchInput = layout.getByPlaceholder(/Search foods for/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Click Cancel button
    const cancelButton = layout.locator("button", { hasText: /cancel/i }).last();
    await cancelButton.click();

    // Search panel should close
    await expect(searchInput).not.toBeVisible({ timeout: 3000 });

    // The empty state should show again with "+ Add breakfast" text
    await expect(layout.locator("text=/add breakfast/i")).toBeVisible();
  });
});
