/**
 * Nutrition Goal Setting - Calculator Flow Tests
 *
 * Tests for the TDEE calculator flow in the NutritionTargetsModal.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * The calculator uses the Mifflin-St Jeor equation:
 * - BMR = 10*weight(kg) + 6.25*height(cm) - 5*age(years) + s
 *   where s = +5 for males, -161 for females
 * - TDEE = BMR * activity multiplier
 * - Target calories adjusted by goal (lose/maintain/gain)
 *
 * Covers:
 * - Opening the calculator section in the modal
 * - Entering age, weight, height, sex, activity level, goal
 * - Verifying calculated values appear in the input fields
 * - Applying calculated values
 * - Saving and verifying persistence
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getFreshNutritionPersona } from "../../fixtures/personas";

test.describe("Nutrition Goal Setting - Calculator Flow", () => {
  // Seed personas before all tests in this file
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should open calculator section in the modal", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open the targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Find and click the "Help me calculate" expandable section
    const calculatorToggle = page.getByRole("button", { name: /help me calculate/i });
    await expect(calculatorToggle).toBeVisible();
    await calculatorToggle.click();

    // Verify the calculator form expands and shows input fields
    // The form should have Height, Weight, Age, Sex, Activity Level, Goal
    await expect(page.getByLabel(/height/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByLabel(/weight/i)).toBeVisible();
    await expect(page.getByLabel(/age/i)).toBeVisible();
    await expect(page.getByLabel(/sex/i)).toBeVisible();
    await expect(page.getByLabel(/activity level/i)).toBeVisible();
    await expect(page.getByLabel(/goal/i)).toBeVisible();
  });

  test("should allow entering stats in the calculator", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Open calculator section
    const calculatorToggle = page.getByRole("button", { name: /help me calculate/i });
    await calculatorToggle.click();

    // Wait for calculator form to be visible
    await expect(page.getByLabel(/height/i)).toBeVisible({ timeout: 3000 });

    // Fill in the calculator form
    // Height: 5'10" (70 inches total)
    // The form has separate feet and inches inputs
    const feetInput = page.locator('input[placeholder="5"]').first();
    const inchesInput = page.locator('input[placeholder="8"]').first();

    await feetInput.fill("5");
    await inchesInput.fill("10");

    // Weight: 180 lbs
    const weightInput = page.locator('input[placeholder="165"]').first();
    await weightInput.fill("180");

    // Age: 30
    const ageInput = page.locator('input[placeholder="30"]').first();
    await ageInput.fill("30");

    // Sex: Male
    const sexSelect = page.getByLabel(/sex/i);
    await sexSelect.selectOption("male");

    // Activity Level: Moderate (3-5 days/week)
    const activitySelect = page.getByLabel(/activity level/i);
    await activitySelect.selectOption("moderate");

    // Goal: Maintain Weight
    const goalSelect = page.getByLabel(/goal/i);
    await goalSelect.selectOption("maintain");

    // Verify the values were entered
    await expect(feetInput).toHaveValue("5");
    await expect(inchesInput).toHaveValue("10");
    await expect(weightInput).toHaveValue("180");
    await expect(ageInput).toHaveValue("30");
    await expect(sexSelect).toHaveValue("male");
    await expect(activitySelect).toHaveValue("moderate");
    await expect(goalSelect).toHaveValue("maintain");
  });

  test("should calculate and display targets from stats", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Open calculator section
    const calculatorToggle = page.getByRole("button", { name: /help me calculate/i });
    await calculatorToggle.click();

    // Wait for calculator form
    await expect(page.getByLabel(/height/i)).toBeVisible({ timeout: 3000 });

    // Fill in stats (5'10", 180 lbs, 30 years, male, moderate, maintain)
    const feetInput = page.locator('input[placeholder="5"]').first();
    const inchesInput = page.locator('input[placeholder="8"]').first();
    const weightInput = page.locator('input[placeholder="165"]').first();
    const ageInput = page.locator('input[placeholder="30"]').first();

    await feetInput.fill("5");
    await inchesInput.fill("10");
    await weightInput.fill("180");
    await ageInput.fill("30");
    await page.getByLabel(/sex/i).selectOption("male");
    await page.getByLabel(/activity level/i).selectOption("moderate");
    await page.getByLabel(/goal/i).selectOption("maintain");

    // Click "Calculate My Targets" button
    const calculateButton = page.getByRole("button", { name: /calculate my targets/i });
    await expect(calculateButton).toBeEnabled();
    await calculateButton.click();

    // Wait for the API response and values to be populated
    // The calculated values should appear in the main modal inputs
    await page.waitForTimeout(1000); // Wait for API call and state update

    // The calculator form should collapse and the main inputs should now have values
    // Main inputs: Daily Calories, Protein (g), Carbs (g), Fat (g)
    const caloriesInput = page.getByLabel(/daily calories/i);
    const proteinInput = page.getByLabel(/protein/i);
    const carbsInput = page.getByLabel(/carbs/i);
    const fatInput = page.getByLabel(/fat/i);

    // Verify calculated values are populated (they should be non-empty numbers)
    // The exact values depend on the formula, but we verify they exist
    await expect(caloriesInput).not.toHaveValue("");
    await expect(proteinInput).not.toHaveValue("");
    await expect(carbsInput).not.toHaveValue("");
    await expect(fatInput).not.toHaveValue("");

    // The calorie value should be a reasonable number for a 30yo male 5'10" 180lbs moderate activity
    // Expected TDEE around 2600-2800 for maintenance
    const calorieValue = await caloriesInput.inputValue();
    const calories = parseInt(calorieValue, 10);
    expect(calories).toBeGreaterThan(2000);
    expect(calories).toBeLessThan(3500);
  });

  test("should apply calculated values and save", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Open calculator section
    const calculatorToggle = page.getByRole("button", { name: /help me calculate/i });
    await calculatorToggle.click();

    await expect(page.getByLabel(/height/i)).toBeVisible({ timeout: 3000 });

    // Fill in stats (5'8", 165 lbs, 25 years, female, light, lose weight)
    const feetInput = page.locator('input[placeholder="5"]').first();
    const inchesInput = page.locator('input[placeholder="8"]').first();
    const weightInput = page.locator('input[placeholder="165"]').first();
    const ageInput = page.locator('input[placeholder="30"]').first();

    await feetInput.fill("5");
    await inchesInput.fill("8");
    await weightInput.fill("165");
    await ageInput.fill("25");
    await page.getByLabel(/sex/i).selectOption("female");
    await page.getByLabel(/activity level/i).selectOption("light");
    await page.getByLabel(/goal/i).selectOption("lose");

    // Calculate targets
    const calculateButton = page.getByRole("button", { name: /calculate my targets/i });
    await calculateButton.click();

    // Wait for calculation
    await page.waitForTimeout(1000);

    // Get the calculated values
    const caloriesInput = page.getByLabel(/daily calories/i);
    const calculatedCalories = await caloriesInput.inputValue();

    // Save the targets
    const saveButton = page.getByRole("button", { name: /save targets/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for modal to close
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible({
      timeout: 5000,
    });

    // Wait for UI update
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload();
    await page.waitForSelector("main", { timeout: 10000 });

    // After reload, the "Set Goals" banner should not be visible (user has targets set)
    const setGoalsBannerAfter = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsBannerAfter).not.toBeVisible({ timeout: 5000 });
  });

  test("should show validation error when required fields are missing", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Open targets modal
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });
    await expect(setGoalsButton).toBeVisible({ timeout: 10000 });
    await setGoalsButton.click();

    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });

    // Open calculator section
    const calculatorToggle = page.getByRole("button", { name: /help me calculate/i });
    await calculatorToggle.click();

    await expect(page.getByLabel(/height/i)).toBeVisible({ timeout: 3000 });

    // Try to calculate without filling any fields
    const calculateButton = page.getByRole("button", { name: /calculate my targets/i });
    await calculateButton.click();

    // Should show validation error about missing fields
    // The error message should mention the missing required fields
    const errorMessage = page.locator("text=/please fill in/i");
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });
});
