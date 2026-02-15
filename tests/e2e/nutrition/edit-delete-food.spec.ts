/**
 * Nutrition Edit and Delete Food Tests
 *
 * Tests for editing and deleting food entries on the nutrition page.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * The edit flow involves:
 * 1. Adding a food first (prerequisite)
 * 2. Hovering over the food item to reveal edit/delete buttons
 * 3. Clicking edit to open FoodEditModal
 * 4. Modifying name, macros, serving, or meal
 * 5. Saving and verifying changes persist
 *
 * The delete flow involves:
 * 1. Having a food logged
 * 2. Hovering to reveal delete button
 * 3. Clicking delete and confirming
 * 4. Verifying food is removed from UI
 *
 * Covers:
 * - Clicking edit on a food item opens modal
 * - Modifying name, macros, serving size
 * - Changing meal assignment via dropdown
 * - Saving changes and verifying persistence
 * - Deleting food entries
 * - Verifying UI updates after delete
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getFreshNutritionPersona } from "../../fixtures/personas";

test.describe("Nutrition Edit and Delete Food", () => {
  // Seed personas before all tests in this file

  /**
   * Helper to add a food item to Lunch section.
   * Returns the name of the food added for verification.
   */
  async function addFoodToMeal(page: import("@playwright/test").Page, mealName: string, searchTerm: string): Promise<string> {
    // Open inline search for the meal
    const addButton = page.locator(`[data-testid="add-food-${mealName.toLowerCase()}"]`).first();
    await addButton.click();

    // Wait for search input
    const searchInput = page.locator('input[role="combobox"], input[placeholder*="search" i]');
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Search and select a food
    await searchInput.fill(searchTerm);
    await page.waitForSelector('[role="listbox"]', { timeout: 10000 });

    // Get the first result text for verification
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    const foodName = await firstResult.textContent() || searchTerm;
    await firstResult.click();

    // Wait for serving size selector and confirm
    await expect(page.getByLabel(/serving size/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /confirm/i }).click();

    // Wait for food to be added - search panel should close
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });

    return foodName;
  }

  test("should show edit and delete buttons on food item hover", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food first
    await addFoodToMeal(page, "Lunch", "chicken");

    // Wait for the food to appear in Lunch section
    const lunchSection = page.locator("div").filter({ hasText: /^Lunch/ }).first();
    await expect(lunchSection).toContainText(/chicken/i, { timeout: 5000 });

    // Find the food item row (FoodLogItem component)
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /chicken/i }).first();
    await expect(foodItem).toBeVisible();

    // Hover over the food item to reveal action buttons
    await foodItem.hover();

    // Edit button should appear (with Pencil icon, aria-label "Edit [food name]")
    const editButton = foodItem.locator('button[aria-label*="Edit"]');
    await expect(editButton).toBeVisible({ timeout: 2000 });

    // Delete button should appear (with Trash icon, aria-label "Delete [food name]")
    const deleteButton = foodItem.locator('button[aria-label*="Delete"]');
    await expect(deleteButton).toBeVisible({ timeout: 2000 });
  });

  test("should open edit modal when clicking edit button", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food first
    await addFoodToMeal(page, "Breakfast", "banana");

    // Wait for the food to appear
    const breakfastSection = page.locator("div").filter({ hasText: /^Breakfast/ }).first();
    await expect(breakfastSection).toContainText(/banana/i, { timeout: 5000 });

    // Find and hover over the food item
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /banana/i }).first();
    await foodItem.hover();

    // Click the edit button
    const editButton = foodItem.locator('button[aria-label*="Edit"]');
    await expect(editButton).toBeVisible({ timeout: 2000 });
    await editButton.click();

    // Verify edit modal opens (FoodEditModal)
    // Modal has "Edit Food" heading
    await expect(page.locator('text="Edit Food"')).toBeVisible({ timeout: 3000 });

    // Modal should have name input pre-filled
    const nameInput = page.locator('#food-name');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(/banana/i);

    // Modal should have macros inputs
    await expect(page.locator('#calories')).toBeVisible();
    await expect(page.locator('#protein')).toBeVisible();
    await expect(page.locator('#carbs')).toBeVisible();
    await expect(page.locator('#fat')).toBeVisible();

    // Modal should have meal dropdown
    await expect(page.locator('#meal')).toBeVisible();

    // Modal should have serving size inputs
    await expect(page.locator('#serving-size')).toBeVisible();
    await expect(page.locator('#serving-unit')).toBeVisible();

    // Modal should have Save Changes button
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
  });

  test("should allow modifying food name and macros", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food first
    await addFoodToMeal(page, "Dinner", "rice");

    // Wait for the food to appear
    const dinnerSection = page.locator("div").filter({ hasText: /^Dinner/ }).first();
    await expect(dinnerSection).toContainText(/rice/i, { timeout: 5000 });

    // Find and click edit
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /rice/i }).first();
    await foodItem.hover();
    const editButton = foodItem.locator('button[aria-label*="Edit"]');
    await editButton.click();

    // Wait for modal
    await expect(page.locator('text="Edit Food"')).toBeVisible({ timeout: 3000 });

    // Modify the name
    const nameInput = page.locator('#food-name');
    await nameInput.clear();
    await nameInput.fill("Brown Rice - Custom");

    // Modify calories
    const caloriesInput = page.locator('#calories');
    await caloriesInput.clear();
    await caloriesInput.fill("250");

    // Modify protein
    const proteinInput = page.locator('#protein');
    await proteinInput.clear();
    await proteinInput.fill("6");

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click();

    // Modal should close
    await expect(page.locator('text="Edit Food"')).not.toBeVisible({ timeout: 3000 });

    // Verify the updated food appears with new name
    await expect(dinnerSection).toContainText(/Brown Rice - Custom/i, { timeout: 5000 });

    // Verify updated calories show (250 cal)
    await expect(dinnerSection).toContainText(/250 cal/i, { timeout: 3000 });
  });

  test("should allow changing meal assignment via dropdown", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food to Snack
    await addFoodToMeal(page, "Snack", "almonds");

    // Wait for the food to appear in Snack section
    const snackSection = page.locator("div").filter({ hasText: /^Snack/ }).first();
    await expect(snackSection).toContainText(/almond/i, { timeout: 5000 });

    // Find and click edit on the almond item
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /almond/i }).first();
    await foodItem.hover();
    const editButton = foodItem.locator('button[aria-label*="Edit"]');
    await editButton.click();

    // Wait for modal
    await expect(page.locator('text="Edit Food"')).toBeVisible({ timeout: 3000 });

    // Change meal from SNACK to BREAKFAST
    const mealSelect = page.locator('#meal');
    await mealSelect.selectOption("BREAKFAST");

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click();

    // Modal should close
    await expect(page.locator('text="Edit Food"')).not.toBeVisible({ timeout: 3000 });

    // Verify the food now appears in Breakfast section, not Snack
    const breakfastSection = page.locator("div").filter({ hasText: /^Breakfast/ }).first();
    await expect(breakfastSection).toContainText(/almond/i, { timeout: 5000 });
  });

  test("should save changes and verify persistence on reload", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food
    await addFoodToMeal(page, "Lunch", "salmon");

    // Wait for the food to appear
    const lunchSection = page.locator("div").filter({ hasText: /^Lunch/ }).first();
    await expect(lunchSection).toContainText(/salmon/i, { timeout: 5000 });

    // Edit the food
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /salmon/i }).first();
    await foodItem.hover();
    const editButton = foodItem.locator('button[aria-label*="Edit"]');
    await editButton.click();

    // Wait for modal
    await expect(page.locator('text="Edit Food"')).toBeVisible({ timeout: 3000 });

    // Change name to something unique we can verify after reload
    const nameInput = page.locator('#food-name');
    await nameInput.clear();
    await nameInput.fill("Edited Salmon Entry");

    // Save
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.locator('text="Edit Food"')).not.toBeVisible({ timeout: 3000 });

    // Verify change appears
    await expect(lunchSection).toContainText(/Edited Salmon Entry/i, { timeout: 5000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector("main", { timeout: 10000 });

    // Verify the change persisted
    const lunchSectionAfterReload = page.locator("div").filter({ hasText: /^Lunch/ }).first();
    await expect(lunchSectionAfterReload).toContainText(/Edited Salmon Entry/i, { timeout: 5000 });
  });

  test("should delete food entry after confirmation", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food to delete
    await addFoodToMeal(page, "Dinner", "beef");

    // Wait for the food to appear
    const dinnerSection = page.locator("div").filter({ hasText: /^Dinner/ }).first();
    await expect(dinnerSection).toContainText(/beef/i, { timeout: 5000 });

    // Set up dialog handler for the confirm prompt
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete');
      await dialog.accept();
    });

    // Find and click delete
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /beef/i }).first();
    await foodItem.hover();
    const deleteButton = foodItem.locator('button[aria-label*="Delete"]');
    await expect(deleteButton).toBeVisible({ timeout: 2000 });
    await deleteButton.click();

    // Verify beef no longer appears in dinner section
    await expect(async () => {
      const dinnerText = await dinnerSection.textContent();
      expect(dinnerText?.toLowerCase()).not.toContain('beef');
    }).toPass({ timeout: 5000 });
  });

  test("should update macro totals after deleting food", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // First, set nutrition targets so we have progress bars to track
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
      await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible({ timeout: 5000 });
    }

    // Add two foods
    await addFoodToMeal(page, "Lunch", "chicken");
    await expect(page.locator('[data-testid="food-log-item"]').filter({ hasText: /chicken/i }).first()).toBeVisible({ timeout: 5000 });
    await addFoodToMeal(page, "Lunch", "rice");

    // Wait for both foods to appear
    const lunchSection = page.locator("div").filter({ hasText: /^Lunch/ }).first();
    await expect(lunchSection).toContainText(/chicken/i, { timeout: 5000 });
    await expect(lunchSection).toContainText(/rice/i, { timeout: 5000 });

    // Get the initial calorie display value
    const calorieDisplayBefore = page.locator("text=/\\d+\\s*\\/\\s*2000/i").first();
    const beforeText = await calorieDisplayBefore.textContent() || "0";
    const beforeMatch = beforeText.match(/(\d+)/);
    const beforeCalories = beforeMatch ? parseInt(beforeMatch[1], 10) : 0;

    // Set up dialog handler
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Delete the chicken entry
    const chickenItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /chicken/i }).first();
    await chickenItem.hover();
    const deleteButton = chickenItem.locator('button[aria-label*="Delete"]');
    await expect(deleteButton).toBeVisible({ timeout: 2000 });
    await deleteButton.click();

    // Calories should have decreased after deletion
    await expect(async () => {
      const afterText = await page.locator("text=/\\d+\\s*\\/\\s*2000/i").first().textContent() || "0";
      const afterMatch = afterText.match(/(\d+)/);
      const afterCalories = afterMatch ? parseInt(afterMatch[1], 10) : 0;
      expect(afterCalories).toBeLessThan(beforeCalories);
    }).toPass({ timeout: 5000 });
  });

  test("should cancel edit modal without saving changes", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Add a food
    await addFoodToMeal(page, "Breakfast", "eggs");

    // Wait for the food to appear
    const breakfastSection = page.locator("div").filter({ hasText: /^Breakfast/ }).first();
    await expect(breakfastSection).toContainText(/egg/i, { timeout: 5000 });

    // Open edit modal
    const foodItem = page.locator('[data-testid="food-log-item"]').filter({ hasText: /egg/i }).first();
    await foodItem.hover();
    const editButton = foodItem.locator('button[aria-label*="Edit"]');
    await editButton.click();

    // Wait for modal
    await expect(page.locator('text="Edit Food"')).toBeVisible({ timeout: 3000 });

    // Make a change but don't save
    const nameInput = page.locator('#food-name');
    await nameInput.clear();
    await nameInput.fill("Should Not Appear");

    // Click Cancel
    await page.getByRole("button", { name: /cancel/i }).click();

    // Modal should close
    await expect(page.locator('text="Edit Food"')).not.toBeVisible({ timeout: 3000 });

    // Original food name should still be there, not the edited one
    await expect(breakfastSection).toContainText(/egg/i);
    await expect(breakfastSection).not.toContainText(/Should Not Appear/i);
  });
});
