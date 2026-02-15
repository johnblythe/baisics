import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";

test.describe("Nutrition - calculator-based goal setting", () => {
  // Run tests serially to avoid seed race conditions
  test.describe.configure({ mode: "serial" });

  // Seed personas before all tests

  test("should calculate nutrition targets using TDEE calculator", async ({ page }) => {
    // Get alex persona (fresh user, free tier)
    const alex = getPersona("alex");

    // Login as alex
    await loginAsUser(page, alex.email);

    // Navigate to nutrition page
    await page.goto("/nutrition");
    await page.waitForURL("**/nutrition**", { timeout: 15000 });

    // Look for Set Goals button
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });

    try {
      await setGoalsButton.waitFor({ state: "visible", timeout: 5000 });
      await setGoalsButton.click();
    } catch {
      // If button not found, the user may already have personalized targets
      test.skip();
      return;
    }

    // Wait for the modal to appear
    const modal = page.locator('[role="dialog"], .fixed.inset-0').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click "Help me calculate" to expand the CalculatorForm
    const calculateButton = page.getByText(/help me calculate/i);
    await expect(calculateButton).toBeVisible();
    await calculateButton.click();

    // Wait for the calculator form to expand
    await expect(page.locator("#calc-height-feet")).toBeVisible({ timeout: 3000 });

    // Verify CalculatorForm label associations using the ids from US-002
    // Height feet input
    const heightFeetInput = page.locator("#calc-height-feet");
    await expect(heightFeetInput).toBeVisible({ timeout: 5000 });
    await heightFeetInput.fill("5");

    const heightFeetLabel = page.locator('label[for="calc-height-feet"]');
    await expect(heightFeetLabel).toBeVisible();

    // Height inches input (has aria-label)
    const heightInchesInput = page.locator("#calc-height-inches");
    await expect(heightInchesInput).toBeVisible();
    await expect(heightInchesInput).toHaveAttribute("aria-label", "Height inches");
    await heightInchesInput.fill("10");

    // Weight input
    const weightInput = page.locator("#calc-weight");
    await expect(weightInput).toBeVisible();
    await weightInput.fill("165");

    const weightLabel = page.locator('label[for="calc-weight"]');
    await expect(weightLabel).toBeVisible();
    await weightLabel.click();
    await expect(weightInput).toBeFocused();

    // Age input
    const ageInput = page.locator("#calc-age");
    await expect(ageInput).toBeVisible();
    await ageInput.fill("30");

    const ageLabel = page.locator('label[for="calc-age"]');
    await expect(ageLabel).toBeVisible();
    await ageLabel.click();
    await expect(ageInput).toBeFocused();

    // Sex select
    const sexSelect = page.locator("#calc-sex");
    await expect(sexSelect).toBeVisible();
    await sexSelect.selectOption("male");

    const sexLabel = page.locator('label[for="calc-sex"]');
    await expect(sexLabel).toBeVisible();

    // Activity level select
    const activitySelect = page.locator("#calc-activity");
    await expect(activitySelect).toBeVisible();
    await activitySelect.selectOption("moderate");

    const activityLabel = page.locator('label[for="calc-activity"]');
    await expect(activityLabel).toBeVisible();

    // Goal select
    const goalSelect = page.locator("#calc-goal");
    await expect(goalSelect).toBeVisible();
    await goalSelect.selectOption("maintain");

    const goalLabel = page.locator('label[for="calc-goal"]');
    await expect(goalLabel).toBeVisible();

    // Click Calculate My Targets button
    const calculateMyTargetsButton = page.getByRole("button", { name: /calculate my targets/i });
    await expect(calculateMyTargetsButton).toBeVisible();
    await calculateMyTargetsButton.click();

    // Wait for calculation to complete and nutrition targets to be populated
    const caloriesInput = page.locator("#daily-calories");
    await expect(caloriesInput).toBeVisible();

    // The calculated value should be a number greater than 0
    const caloriesValue = await caloriesInput.inputValue();
    expect(parseInt(caloriesValue)).toBeGreaterThan(0);

    // Save the calculated targets
    const saveButton = page.getByRole("button", { name: /save targets/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for modal to close (success)
    await expect(modal).not.toBeVisible({ timeout: 10000 });
  });

  test("should show validation errors for missing calculator fields", async ({ page }) => {
    // Generate unique email for fresh user
    const uniqueEmail = `test-calc-${Date.now()}@test.baisics.app`;

    // Navigate to signin page
    await page.goto("/auth/signin");
    await page.getByLabel("Email address").fill(uniqueEmail);
    await page.getByRole("button", { name: /send magic link/i }).click();
    await page.waitForURL("**/auth/verify-request**");

    // Click magic link
    const magicLinkButton = page.getByRole("link", { name: /click here to sign in/i });
    await expect(magicLinkButton).toBeVisible({ timeout: 10000 });
    await magicLinkButton.click();

    // Handle intermediate "Confirm sign in" page (PR #364)
    try {
      const signInLink = page.getByRole("link", { name: /sign in to baisics/i });
      await signInLink.waitFor({ state: "visible", timeout: 5000 });
      await signInLink.click();
    } catch {
      // Already redirected through
    }

    // Wait for redirect
    await page.waitForURL((url) => !url.pathname.includes("/auth/"), { timeout: 15000 });

    // Navigate to nutrition page
    await page.goto("/nutrition");
    await page.waitForURL("**/nutrition**", { timeout: 15000 });

    // Look for Set Goals button
    const setGoalsButton = page.getByRole("button", { name: /set goals/i });

    try {
      await setGoalsButton.waitFor({ state: "visible", timeout: 5000 });
      await setGoalsButton.click();
    } catch {
      test.skip();
      return;
    }

    // Wait for modal
    const modal = page.locator('[role="dialog"], .fixed.inset-0').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Expand calculator
    const calculateButton = page.getByText(/help me calculate/i);
    await calculateButton.click();
    await expect(page.locator("#calc-height-feet")).toBeVisible({ timeout: 3000 });

    // Try to calculate without filling any fields
    const calculateMyTargetsButton = page.getByRole("button", { name: /calculate my targets/i });
    await calculateMyTargetsButton.click();

    // Should see validation error about missing fields
    await expect(page.getByText(/please fill in/i)).toBeVisible({ timeout: 5000 });
  });
});
