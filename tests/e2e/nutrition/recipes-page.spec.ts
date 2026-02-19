/**
 * Nutrition Recipes Page E2E Tests
 *
 * Tests the /nutrition/recipes page:
 * - Page loads and renders correctly
 * - Navigation tabs work
 * - Page shows recipes or empty state appropriately
 * - Create recipe modal opens
 * - Search/filter recipes
 * - Expand/collapse recipe cards
 * - Edit recipe
 * - Delete recipe
 * - Log recipe to food entries
 *
 * Uses alex persona (fresh user). Note: alex may have seeded recipes
 * and accumulated test-created recipes, so tests account for existing data.
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";
import { visibleLayout } from "../../fixtures/nutrition-helpers";

/**
 * Delete all recipes for the logged-in user via the API.
 * Fetches the list then deletes each one. Ensures a clean slate.
 */
async function deleteAllUserRecipes(page: import("@playwright/test").Page): Promise<void> {
  const res = await page.request.get("/api/recipes");
  if (!res.ok()) return;
  const recipes: { id: string }[] = await res.json();
  // Delete in parallel to avoid timeouts with many accumulated recipes
  await Promise.all(recipes.map(r => page.request.delete(`/api/recipes/${r.id}`)));
}

test.describe("Nutrition Recipes Page", () => {
  // Tests create/delete recipes for the same persona — run sequentially
  test.describe.configure({ mode: "serial" });

  test.describe("Page Load & Navigation", () => {
    test("should load /nutrition/recipes without errors", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      // Page title should be visible
      await expect(page.getByText("My Recipes")).toBeVisible({ timeout: 5000 });
    });

    test("should show Recipes tab as active", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      // Recipes tab should have active styling (bg-[#0F172A] text-white)
      const recipesTab = page.locator("a", { hasText: "Recipes" }).first();
      await expect(recipesTab).toBeVisible();
      await expect(recipesTab).toHaveClass(/bg-\[#0F172A\]/);
    });

    test("should navigate to food log when clicking Log Food tab", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      const logTab = page.locator("a", { hasText: "Log Food" }).first();
      await logTab.click();
      await page.waitForURL("**/nutrition", { timeout: 5000 });
    });
  });

  test.describe("Empty State", () => {
    test("should show empty state when user has no recipes", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);

      // Delete all existing recipes to guarantee empty state
      await deleteAllUserRecipes(page);

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      // Wait for loading to finish
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });

      // Should show empty state
      await expect(page.getByText("No recipes yet")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Create Your First Recipe")).toBeVisible();
    });

    test("should open create modal from empty state CTA", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);

      // Delete all existing recipes to guarantee empty state
      await deleteAllUserRecipes(page);

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });

      await page.getByText("Create Your First Recipe").click();

      // Modal should be visible
      await expect(page.getByText("Create Recipe").first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Create Recipe", () => {
    test("should open create modal from header button", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });

      // Click the header "Create New" button
      await page.locator("button", { hasText: "Create New" }).first().click();

      // Modal should appear with "Create Recipe" header
      await expect(page.getByText("Create Recipe").first()).toBeVisible({ timeout: 3000 });
    });

    test("should show create modal with name input and ingredient search", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });

      // Open create modal
      await page.locator("button", { hasText: "Create New" }).first().click();
      await expect(page.getByText("Create Recipe").first()).toBeVisible({ timeout: 3000 });

      // Should have a recipe name input
      const nameInput = page.locator('input[placeholder="Recipe name"]');
      await expect(nameInput).toBeVisible();

      // Should have ingredient search
      await expect(page.getByText("Ingredients", { exact: true })).toBeVisible();
      await expect(page.locator('input[placeholder*="Search to add ingredient"]')).toBeVisible();

      // Save button should be disabled (no name or ingredients)
      const saveButton = page.locator("button", { hasText: "Save Recipe" });
      await expect(saveButton).toBeDisabled();
    });
  });

  test.describe("Recipe Card Interactions", () => {
    // Clean up and create a known recipe before each test
    test.beforeEach(async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);

      // Delete all existing recipes to avoid duplicate name issues
      await deleteAllUserRecipes(page);

      // Create a recipe via API for test data
      const response = await page.request.post("/api/recipes", {
        data: {
          name: "E2E Test Recipe",
          emoji: "\ud83c\udf72",
          calories: 500,
          protein: 35,
          carbs: 45,
          fat: 15,
          servingSize: 1,
          servingUnit: "serving",
          ingredients: [
            { name: "Chicken", servingSize: 150, servingUnit: "g", calories: 250, protein: 30, carbs: 0, fat: 5 },
            { name: "Rice", servingSize: 200, servingUnit: "g", calories: 250, protein: 5, carbs: 45, fat: 10 },
          ],
        },
      });
      expect(response.status()).toBe(201);

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });
    });

    test("should display recipe card with name and macros", async ({ page }) => {
      // After cleanup there should be exactly one "E2E Test Recipe"
      await expect(page.getByText("E2E Test Recipe").first()).toBeVisible({ timeout: 5000 });
      // Should show macro info (500 cal)
      await expect(page.getByText(/500/).first()).toBeVisible();
    });

    test("should expand recipe card to show ingredients", async ({ page }) => {
      // Click on the recipe card to expand
      const recipeCard = page.getByText("E2E Test Recipe").first();
      await recipeCard.click();

      // Should show ingredients
      await expect(page.getByText("Chicken")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Rice")).toBeVisible({ timeout: 3000 });
    });

    test("should show Log It button when expanded", async ({ page }) => {
      // Expand the card
      const recipeCard = page.getByText("E2E Test Recipe").first();
      await recipeCard.click();

      // Should show action buttons
      await expect(page.getByText("Log It")).toBeVisible({ timeout: 3000 });
    });

    test("should show meal selector when clicking Log It", async ({ page }) => {
      // Expand the card
      await page.getByText("E2E Test Recipe").first().click();

      // Click Log It
      await page.getByText("Log It").click();

      // Should show meal options
      await expect(page.getByText("Breakfast").last()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Lunch").last()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Dinner").last()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Snack").last()).toBeVisible({ timeout: 3000 });
    });

    test("should log recipe to food entries when selecting a meal", async ({ page }) => {
      // Expand the card
      await page.getByText("E2E Test Recipe").first().click();

      // Click Log It
      await page.getByText("Log It").click();

      // Select Lunch — triggers the log API call
      await page.getByText("Lunch").last().click();

      // Wait for the log API call to complete before navigating away
      await page.waitForLoadState("networkidle");

      // Verify by checking the food log page has the entry
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // Scope to the visible layout to avoid dual-layout issue
      const layout = visibleLayout(page);

      // The recipe should appear in Lunch section
      await expect(layout.getByText("E2E Test Recipe")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Search & Filter", () => {
    test.beforeEach(async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);

      // Delete all existing recipes to avoid duplicates
      await deleteAllUserRecipes(page);

      // Create multiple recipes via API
      await page.request.post("/api/recipes", {
        data: { name: "Grilled Chicken Salad", emoji: "\ud83e\udd57", calories: 350, protein: 40, carbs: 15, fat: 12, ingredients: [] },
      });
      await page.request.post("/api/recipes", {
        data: { name: "Protein Smoothie", emoji: "\ud83e\udd64", calories: 280, protein: 30, carbs: 35, fat: 5, ingredients: [] },
      });
      await page.request.post("/api/recipes", {
        data: { name: "Oatmeal Bowl", emoji: "\ud83e\udd63", calories: 400, protein: 15, carbs: 60, fat: 10, ingredients: [] },
      });

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });
    });

    test("should filter recipes by search query", async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search recipes"]');
      await searchInput.fill("Chicken");

      // Should show matching recipe
      await expect(page.getByText("Grilled Chicken Salad").first()).toBeVisible();
      // Should hide non-matching
      await expect(page.getByText("Protein Smoothie")).toBeHidden();
      await expect(page.getByText("Oatmeal Bowl")).toBeHidden();
    });

    test("should show no results message for unmatched search", async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search recipes"]');
      await searchInput.fill("nonexistent recipe xyz");

      await expect(page.getByText(/No recipes match/)).toBeVisible({ timeout: 3000 });
    });

    test("should show all recipes when search is cleared", async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search recipes"]');

      // Filter first
      await searchInput.fill("Chicken");
      await expect(page.getByText("Protein Smoothie")).toBeHidden();

      // Clear search
      await searchInput.clear();

      // All should be visible again
      await expect(page.getByText("Grilled Chicken Salad").first()).toBeVisible();
      await expect(page.getByText("Protein Smoothie").first()).toBeVisible();
      await expect(page.getByText("Oatmeal Bowl").first()).toBeVisible();
    });
  });

  test.describe("Edit Recipe", () => {
    test.beforeEach(async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);

      // Delete all existing recipes to avoid duplicates
      await deleteAllUserRecipes(page);

      await page.request.post("/api/recipes", {
        data: {
          name: "Editable Recipe",
          emoji: "\ud83c\udf72",
          calories: 400,
          protein: 30,
          carbs: 40,
          fat: 10,
          ingredients: [
            { name: "Ingredient A", servingSize: 100, servingUnit: "g", calories: 200, protein: 15, carbs: 20, fat: 5 },
            { name: "Ingredient B", servingSize: 50, servingUnit: "g", calories: 200, protein: 15, carbs: 20, fat: 5 },
          ],
        },
      });

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });
    });

    test("should enter edit mode when clicking Edit", async ({ page }) => {
      // Expand card
      await page.getByText("Editable Recipe").first().click();

      // Click Edit button
      await page.locator("button", { hasText: /^Edit$/ }).first().click();

      // Should show editable name input with current value
      const nameInput = page.locator('input[value="Editable Recipe"]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
    });

    test("should save edited recipe name", async ({ page }) => {
      // Expand and edit
      await page.getByText("Editable Recipe").first().click();
      await page.locator("button", { hasText: /^Edit$/ }).first().click();

      // Change name — find the recipe name input (controlled input, can't use [value] attribute)
      const nameInput = page.locator('input[type="text"][placeholder="Recipe name"]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
      await nameInput.clear();
      await nameInput.fill("Updated Recipe Name");

      // Save
      const saveButton = page.locator("button", { hasText: /Save/ }).first();
      await saveButton.click();

      // Should show updated name
      await expect(page.getByText("Updated Recipe Name")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Delete Recipe", () => {
    test.beforeEach(async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);

      // Delete all existing recipes to avoid duplicates
      await deleteAllUserRecipes(page);

      await page.request.post("/api/recipes", {
        data: {
          name: "Deletable Recipe",
          emoji: "\ud83d\uddd1\ufe0f",
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 8,
          ingredients: [],
        },
      });

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 10000 });
    });

    test("should delete recipe when clicking Delete and confirming", async ({ page }) => {
      // Expand card
      await page.getByText("Deletable Recipe").first().click();

      // Set up dialog handler for confirmation
      page.on("dialog", async (dialog) => {
        await dialog.accept();
      });

      // Click Delete
      await page.locator("button", { hasText: /Delete/ }).first().click();

      // Recipe should be removed from the list
      await expect(page.getByText("Deletable Recipe")).toBeHidden({ timeout: 5000 });
    });
  });
});
