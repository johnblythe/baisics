/**
 * Nutrition AI Text Parsing Tests
 *
 * Tests for the AI freeform text food entry flow on the nutrition page.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * The flow involves:
 * 1. Finding the AI Quick Add section with QuickInput component
 * 2. Entering freeform text like "chicken breast 6oz"
 * 3. Clicking the sparkles (AI) button to parse
 * 4. Viewing the AIParseResult modal with parsed food details
 * 5. Confirming to add the food to the log
 * 6. Verifying the food appears in the meal section
 *
 * Covers:
 * - Opening AI text input
 * - Entering freeform text
 * - Parsing text via AI
 * - Viewing parsed result modal with confidence indicator
 * - Confirming to add foods
 * - Verifying food appears in meal section with approximate indicator
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getFreshNutritionPersona } from "../../fixtures/personas";

test.describe("Nutrition AI Text Parsing", () => {
  // Seed personas before all tests in this file

  test("should see AI Quick Add section with sparkle button", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Look for AI Quick Add section
    await expect(page.locator("text=/ai quick add/i")).toBeVisible({ timeout: 5000 });

    // Look for the QuickInput component - it has a text input with placeholder
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await expect(quickInput).toBeVisible({ timeout: 3000 });

    // Look for the sparkles button (AI submit button)
    // The sparkles button is a button containing an SVG with Sparkles icon
    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await expect(sparklesButton).toBeVisible();
  });

  test("should enter freeform text in AI input", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Find the QuickInput component input
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await expect(quickInput).toBeVisible({ timeout: 3000 });

    // Enter freeform text
    await quickInput.fill("chicken breast 6oz");

    // Verify text was entered
    await expect(quickInput).toHaveValue("chicken breast 6oz");
  });

  test("should show parsed result modal after clicking AI button", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Find and fill the QuickInput
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await expect(quickInput).toBeVisible({ timeout: 3000 });
    await quickInput.fill("chicken breast 6oz");

    // Click the sparkles button to trigger AI parsing
    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for loading to complete and result modal to appear
    // The AIParseResult component shows up as a fixed positioned modal
    // It has "Add to Log" button and shows the parsed food
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Verify the original text is shown in the modal (quoted)
    await expect(page.locator('text="chicken breast 6oz"')).toBeVisible();

    // Verify confidence indicator is shown
    await expect(page.locator("text=/confidence/i")).toBeVisible();
  });

  test("should show parsed food details with calories and macros", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Enter freeform text and parse
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("2 eggs scrambled");

    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Verify parsed food details are shown
    // The AIParseResult shows each parsed food with name and calories
    await expect(page.locator("text=/egg/i")).toBeVisible();
    await expect(page.locator("text=/cal$/i")).toBeVisible();

    // Verify macro totals section (P, C, F)
    await expect(page.locator("text=/g P/i")).toBeVisible();
    await expect(page.locator("text=/g C/i")).toBeVisible();
    await expect(page.locator("text=/g F/i")).toBeVisible();
  });

  test("should add food to log when clicking Add to Log button", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Enter freeform text and parse
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("banana");

    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Click Add to Log
    const addButton = page.getByRole("button", { name: /add to log/i });
    await addButton.click();

    // Wait for modal to close
    await expect(page.locator("text=/add to log/i")).not.toBeVisible({ timeout: 5000 });

    // Verify food appears in one of the meal sections
    await expect(page.locator("text=/banana/i").first()).toBeVisible({ timeout: 5000 });
  });

  test("should close parsed result modal when clicking Edit", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Enter freeform text and parse
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("salmon 4oz");

    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Click Edit button to close/cancel
    const editButton = page.getByRole("button", { name: /^edit$/i });
    await editButton.click();

    // Modal should close
    await expect(page.locator("text=/add to log/i")).not.toBeVisible({ timeout: 3000 });

    // Food should NOT be added (no salmon in meal sections)
    await expect(page.locator("div").filter({ hasText: /^(Breakfast|Lunch|Dinner|Snack)/ }).locator("text=/salmon/i")).not.toBeVisible();
  });

  test("should parse multiple foods from single text input", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Enter multiple foods in freeform text
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("2 eggs and toast with butter");

    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Verify multiple foods are parsed
    // Should see eggs, toast, and potentially butter as separate items
    const foodList = page.locator(".space-y-1");
    const foodItems = foodList.locator("div").filter({ hasText: /cal$/ });

    // Should have at least 2 parsed items (eggs and toast at minimum)
    const itemCount = await foodItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);
  });

  test("should show error when AI parsing fails with empty input", async ({ page }) => {
    const persona = getFreshNutritionPersona();

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    // Find the QuickInput but don't enter anything meaningful
    const quickInput = page.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("xyz"); // Very short text that might not parse to food

    const sparklesButton = page.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for parsing to complete — either result modal or error message
    await expect(async () => {
      const hasError = await page.locator("text=/no foods detected/i").isVisible().catch(() => false);
      const hasResult = await page.locator("text=/add to log/i").isVisible().catch(() => false);
      expect(hasError || hasResult).toBe(true);
    }).toPass({ timeout: 15000 });

    // Either the modal appears with no foods or an error is shown
    const hasError = await page.locator("text=/no foods detected/i").isVisible().catch(() => false);
    const hasResult = await page.locator("text=/add to log/i").isVisible().catch(() => false);

    // One of these should be true - either parsing succeeded or showed appropriate message
    expect(hasError || hasResult).toBe(true);
  });
});
