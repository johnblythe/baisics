/**
 * Nutrition Goal Setting - Manual Entry Tests
 *
 * Tests for the manual target setting flow in the NutritionTargetsModal.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * Covers:
 * - Opening the modal from the "Set Goals" banner
 * - Entering calories and macros manually
 * - Verifying auto-calculation (macros → kcal)
 * - Saving and verifying targets persist on reload
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getFreshNutritionPersona } from "../../fixtures/personas";

test.describe("Nutrition Goal Setting - Manual Entry", () => {
  // Seed personas before all tests in this file
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should open targets modal from Set Goals banner", async ({ page }) => {
    // Get fresh persona (alex) who has no nutrition targets set
    const persona = getFreshNutritionPersona();

    // Login and navigate to nutrition page
    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");

    // Wait for the page to load
    await page.waitForSelector("main", { timeout: 10000 });

    // Look for the "Set Goals" banner (appears when user has default/no targets)
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });

    // The banner should be visible for a fresh user
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });

    // Click the "Set Goals" button
    await setGoalsButton.click();

    // Verify the modal opens
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify modal header text
    const modalHeader = page.getByRole("heading", { name: /nutrition targets/i });
    await expect(modalHeader).toBeVisible();
  });

  test("should allow entering calories and macros manually", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open the targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    // Wait for modal to be visible
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Find the input fields
    // The modal has: Daily Calories, Protein (g), Carbs (g), Fat (g)
    const caloriesInput = page.getByLabel(/daily calories/i);
    const proteinInput = page.getByLabel(/protein/i);
    const carbsInput = page.getByLabel(/carbs/i);
    const fatInput = page.getByLabel(/fat/i);

    // Enter values manually
    await caloriesInput.fill("2500");
    await proteinInput.fill("150");
    await carbsInput.fill("250");
    await fatInput.fill("80");

    // Verify the values are in the inputs
    await expect(caloriesInput).toHaveValue("2500");
    await expect(proteinInput).toHaveValue("150");
    await expect(carbsInput).toHaveValue("250");
    await expect(fatInput).toHaveValue("80");
  });

  test("should auto-calculate calories from macros (P*4 + C*4 + F*9)", async ({
    page,
  }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open the targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Find the input fields
    const caloriesInput = page.getByLabel(/daily calories/i);
    const proteinInput = page.getByLabel(/protein/i);
    const carbsInput = page.getByLabel(/carbs/i);
    const fatInput = page.getByLabel(/fat/i);

    // Enter macros first (this should auto-calculate calories)
    // Formula: protein * 4 + carbs * 4 + fat * 9
    // 150 * 4 = 600
    // 200 * 4 = 800
    // 70 * 9 = 630
    // Total = 2030
    await proteinInput.fill("150");
    await carbsInput.fill("200");
    await fatInput.fill("70");

    // Wait for auto-calculation
    await page.waitForTimeout(200);

    // Verify calories was auto-calculated
    // Expected: 150*4 + 200*4 + 70*9 = 600 + 800 + 630 = 2030
    await expect(caloriesInput).toHaveValue("2030");
  });

  test("should save targets and persist on reload", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open the targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Find the input fields
    const caloriesInput = page.getByLabel(/daily calories/i);
    const proteinInput = page.getByLabel(/protein/i);
    const carbsInput = page.getByLabel(/carbs/i);
    const fatInput = page.getByLabel(/fat/i);

    // Enter specific values that we can verify later
    await proteinInput.fill("180");
    await carbsInput.fill("220");
    await fatInput.fill("65");

    // Wait for auto-calc
    await page.waitForTimeout(200);

    // Calculate expected calories: 180*4 + 220*4 + 65*9 = 720 + 880 + 585 = 2185
    const expectedCalories = "2185";
    await expect(caloriesInput).toHaveValue(expectedCalories);

    // Click Save Targets button
    const saveButton = page.getByRole("button", { name: /save targets/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for modal to close (indicates save completed)
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible({
      timeout: 5000,
    });

    // Wait a moment for UI to update
    await page.waitForTimeout(500);

    // Reload the page to verify persistence
    await page.reload();
    await page.waitForSelector("main", { timeout: 10000 });

    // The "Set Goals" banner should no longer appear (user now has custom targets)
    // Instead, look for the macro progress bars which show the targets
    // Wait for the page to fully load
    await page.waitForTimeout(1000);

    // The banner with "Set Goals" should NOT be visible anymore
    // because the user now has personalized targets
    const setGoalsBannerAfter = page.getByRole("button", { name: /set goals/i });

    // Should not be visible after setting targets
    await expect(setGoalsBannerAfter).not.toBeVisible({ timeout: 5000 });
  });

  test("should clear macros when editing calories directly", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open the targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Find the input fields
    const caloriesInput = page.getByLabel(/daily calories/i);
    const proteinInput = page.getByLabel(/protein/i);
    const carbsInput = page.getByLabel(/carbs/i);
    const fatInput = page.getByLabel(/fat/i);

    // First enter macros
    await proteinInput.fill("150");
    await carbsInput.fill("200");
    await fatInput.fill("70");

    // Wait for auto-calc
    await page.waitForTimeout(200);

    // Verify macros are set
    await expect(proteinInput).toHaveValue("150");
    await expect(carbsInput).toHaveValue("200");
    await expect(fatInput).toHaveValue("70");

    // Now edit calories directly (should clear macros - kcal-only mode)
    await caloriesInput.fill("3000");

    // Wait for update
    await page.waitForTimeout(200);

    // Macros should be cleared when calories edited directly
    await expect(proteinInput).toHaveValue("");
    await expect(carbsInput).toHaveValue("");
    await expect(fatInput).toHaveValue("");
    await expect(caloriesInput).toHaveValue("3000");
  });
});
