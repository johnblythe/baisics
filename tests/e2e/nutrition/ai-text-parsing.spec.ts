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
import { getPersona } from "../../fixtures/personas";
import { visibleLayout, clearRecentFoodLogs } from "../../fixtures/nutrition-helpers";

test.describe("Nutrition AI Text Parsing", () => {
  test.describe.configure({ mode: "serial" });

  test("should see AI Quick Add section with sparkle button", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Look for AI Quick Add section
    await expect(layout.getByRole('heading', { name: 'AI Quick Add' })).toBeVisible({ timeout: 5000 });

    // Look for the QuickInput component - it has a text input with placeholder
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await expect(quickInput).toBeVisible({ timeout: 3000 });

    // Look for the sparkles button (AI submit button)
    // The sparkles button is a button containing an SVG with Sparkles icon
    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await expect(sparklesButton).toBeVisible();
  });

  test("should enter freeform text in AI input", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Find the QuickInput component input
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await expect(quickInput).toBeVisible({ timeout: 3000 });

    // Enter freeform text
    await quickInput.fill("chicken breast 6oz");

    // Verify text was entered
    await expect(quickInput).toHaveValue("chicken breast 6oz");
  });

  test("should show parsed result modal after clicking AI button", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Find and fill the QuickInput
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await expect(quickInput).toBeVisible({ timeout: 3000 });
    await quickInput.fill("chicken breast 6oz");

    // Click the sparkles button to trigger AI parsing
    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for loading to complete and result modal to appear
    // The AIParseResult component shows up as a fixed positioned modal
    // It has "Add to Log" button and shows the parsed food
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Verify the original text is shown in the modal (quoted)
    await expect(page.locator('text=/chicken breast 6oz/i').first()).toBeVisible();

    // Verify confidence indicator is shown
    await expect(page.locator("text=/confidence/i")).toBeVisible();
  });

  test("should show parsed food details with calories and macros", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Enter freeform text and parse
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("2 eggs scrambled");

    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Verify parsed food details are shown within the AI result modal
    // The modal is a fixed-position element with z-50
    const modal = page.locator('.fixed.z-50').filter({ has: page.getByRole('button', { name: /add to log/i }) });
    await expect(modal).toBeVisible({ timeout: 3000 });

    // Verify food name and calories are shown
    await expect(modal.locator("text=/egg/i").first()).toBeVisible();
    await expect(modal.locator("text=/\\d+\\s*cal/i").first()).toBeVisible();

    // Verify macro totals section (P, C, F)
    await expect(modal.locator("text=/g P/i").first()).toBeVisible();
    await expect(modal.locator("text=/g C/i").first()).toBeVisible();
    await expect(modal.locator("text=/g F/i").first()).toBeVisible();
  });

  test("should add food to log when clicking Add to Log button", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await clearRecentFoodLogs(page);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Enter freeform text and parse
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("banana");

    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    const modal = page.locator('.fixed.z-50').filter({ has: page.getByRole('button', { name: /add to log/i }) });
    await expect(modal).toBeVisible({ timeout: 15000 });

    // Click Add to Log
    await modal.getByRole("button", { name: /add to log/i }).click();

    // Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify food appears in one of the meal sections
    await expect(layout.locator("text=/banana/i").first()).toBeVisible({ timeout: 5000 });
  });

  test("should close parsed result modal when clicking Edit", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Enter freeform text and parse
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("salmon 4oz");

    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
    await sparklesButton.click();

    // Wait for result modal
    await expect(page.locator("text=/add to log/i")).toBeVisible({ timeout: 15000 });

    // Click Edit button to close/cancel
    const editButton = page.getByRole("button", { name: /^edit$/i });
    await editButton.click();

    // Modal should close
    await expect(page.locator("text=/add to log/i")).not.toBeVisible({ timeout: 3000 });

    // Food should NOT be added (no salmon in meal sections)
    await expect(layout.locator("div").filter({ hasText: /^(Breakfast|Lunch|Dinner|Snack)/ }).locator("text=/salmon/i")).not.toBeVisible();
  });

  test("should parse multiple foods from single text input", async ({ page }) => {
    const persona = getPersona("priya");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Enter multiple foods in freeform text
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("2 eggs and toast with butter");

    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });
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

  test("should handle nonsense input gracefully", async ({ page }) => {
    const persona = getPersona("priya");

    // Mock the AI parse endpoint to return empty result for nonsense input
    await page.route("**/api/food-log/parse-text", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ foods: [], message: "Could not parse any foods from input" }),
      });
    });

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });
    const layout = visibleLayout(page);

    // Find the QuickInput and enter nonsense text
    const quickInput = layout.locator('input[placeholder*="chicken breast"]');
    await quickInput.fill("xyz");

    const sparklesButton = layout.locator("button").filter({ has: page.locator('svg.lucide-sparkles') });

    // Set up response listener before clicking to avoid race condition
    const parseResponse = page.waitForResponse(
      (res) => res.url().includes("/api/food-log/parse-text"),
      { timeout: 5000 }
    );

    await sparklesButton.click();

    // After clicking sparkles, QuickInput clears the input immediately and
    // calls onSubmit. The parent then processes asynchronously via the AI API.
    // Verify the input was cleared (submit happened successfully)
    await expect(quickInput).toHaveValue("", { timeout: 3000 });

    // The mocked AI returns empty result quickly — wait for it to be processed
    await parseResponse;

    // Page should still be functional
    await expect(page.locator("main")).toBeVisible();
  });
});
