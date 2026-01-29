/**
 * Nutrition Recipes Page E2E Tests
 *
 * Tests the /nutrition/recipes page:
 * - Page loads and renders correctly
 * - Navigation tabs work
 * - Empty state shows when no recipes
 * - Create recipe via modal
 * - Search/filter recipes
 * - Expand/collapse recipe cards
 * - Edit recipe
 * - Delete recipe
 * - Log recipe to food entries
 *
 * Uses alex persona (fresh user with no recipes).
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getFreshNutritionPersona } from "../../fixtures/personas";

test.describe("Nutrition Recipes Page", () => {
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test.describe("Page Load & Navigation", () => {
    test("should load /nutrition/recipes without errors", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      // Page title should be visible
      await expect(page.getByText("My Recipes")).toBeVisible({ timeout: 5000 });
    });

    test("should show Recipes tab as active", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      // Recipes tab should have active styling (bg-[#0F172A] text-white)
      const recipesTab = page.locator("a", { hasText: "Recipes" });
      await expect(recipesTab).toBeVisible();
      await expect(recipesTab).toHaveClass(/bg-\[#0F172A\]/);
    });

    test("should navigate to food log when clicking Log Food tab", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      const logTab = page.locator("a", { hasText: "Log Food" });
      await logTab.click();
      await page.waitForURL("**/nutrition", { timeout: 5000 });
    });
  });

  test.describe("Empty State", () => {
    test("should show empty state for user with no recipes", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });

      // Wait for loading to finish
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });

      // Should show empty state
      await expect(page.getByText("No recipes yet")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Create Your First Recipe")).toBeVisible();
    });

    test("should open create modal from empty state CTA", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });

      await page.getByText("Create Your First Recipe").click();

      // Modal should be visible
      await expect(page.getByText("Create Recipe").first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Create Recipe", () => {
    test("should open create modal from header button", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });

      // Click the header "Create New" button
      await page.locator("button", { hasText: "Create New" }).click();

      // Modal should appear
      await expect(page.getByText("Create Recipe").first()).toBeVisible({ timeout: 3000 });
    });

    test("should create a recipe with name and ingredients", async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);
      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });

      // Open create modal
      await page.locator("button", { hasText: "Create New" }).click();
      await expect(page.getByText("Create Recipe").first()).toBeVisible({ timeout: 3000 });

      // Fill recipe name
      const nameInput = page.locator('input[placeholder*="Recipe name" i], input[placeholder*="name" i]').first();
      await nameInput.fill("Test Chicken Bowl");

      // Look for ingredient name input and fill it
      const ingredientNameInput = page.locator('input[placeholder*="ingredient" i], input[placeholder*="name" i]').last();
      await ingredientNameInput.fill("Chicken Breast");

      // Fill calorie field for the ingredient
      const calInput = page.locator('input[type="number"]').first();
      await calInput.fill("165");

      // Save the recipe
      const saveButton = page.locator("button", { hasText: /save|create/i }).last();
      await saveButton.click();

      // Should see the recipe appear on the page (modal closes, list refreshes)
      await expect(page.getByText("Test Chicken Bowl")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Recipe Card Interactions", () => {
    // These tests depend on having at least one recipe - we create one first
    test.beforeEach(async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);

      // Create a recipe via API for test data
      const response = await page.request.post("/api/recipes", {
        data: {
          name: "E2E Test Recipe",
          emoji: "🍲",
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
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });
    });

    test("should display recipe card with name and macros", async ({ page }) => {
      await expect(page.getByText("E2E Test Recipe")).toBeVisible({ timeout: 5000 });
      // Should show macro info
      await expect(page.getByText(/500/)).toBeVisible();
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

      // Select Lunch
      await page.getByText("Lunch").last().click();

      // Should show success feedback (logged indicator or toast)
      // The usageCount should increment - we look for "1x" or similar
      await page.waitForTimeout(1000);

      // Verify by checking the food log page has the entry
      await page.goto("/nutrition");
      await page.waitForSelector("main", { timeout: 10000 });

      // The recipe should appear in Lunch section
      await expect(page.getByText("E2E Test Recipe")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Search & Filter", () => {
    test.beforeEach(async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);

      // Create multiple recipes via API
      await page.request.post("/api/recipes", {
        data: { name: "Grilled Chicken Salad", emoji: "🥗", calories: 350, protein: 40, carbs: 15, fat: 12, ingredients: [] },
      });
      await page.request.post("/api/recipes", {
        data: { name: "Protein Smoothie", emoji: "🥤", calories: 280, protein: 30, carbs: 35, fat: 5, ingredients: [] },
      });
      await page.request.post("/api/recipes", {
        data: { name: "Oatmeal Bowl", emoji: "🥣", calories: 400, protein: 15, carbs: 60, fat: 10, ingredients: [] },
      });

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });
    });

    test("should filter recipes by search query", async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search recipes"]');
      await searchInput.fill("Chicken");

      // Should show matching recipe
      await expect(page.getByText("Grilled Chicken Salad")).toBeVisible();
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
      await expect(page.getByText("Grilled Chicken Salad")).toBeVisible();
      await expect(page.getByText("Protein Smoothie")).toBeVisible();
      await expect(page.getByText("Oatmeal Bowl")).toBeVisible();
    });
  });

  test.describe("Edit Recipe", () => {
    test.beforeEach(async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);

      await page.request.post("/api/recipes", {
        data: {
          name: "Editable Recipe",
          emoji: "🍲",
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
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });
    });

    test("should enter edit mode when clicking Edit", async ({ page }) => {
      // Expand card
      await page.getByText("Editable Recipe").first().click();

      // Click Edit button
      await page.locator("button", { hasText: /edit/i }).click();

      // Should show editable name input
      const nameInput = page.locator('input[value="Editable Recipe"]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
    });

    test("should save edited recipe name", async ({ page }) => {
      // Expand and edit
      await page.getByText("Editable Recipe").first().click();
      await page.locator("button", { hasText: /edit/i }).click();

      // Change name
      const nameInput = page.locator('input[value="Editable Recipe"]');
      await nameInput.clear();
      await nameInput.fill("Updated Recipe Name");

      // Save
      const saveButton = page.locator("button", { hasText: /save/i });
      await saveButton.click();

      // Wait for save to complete
      await page.waitForTimeout(1000);

      // Should show updated name
      await expect(page.getByText("Updated Recipe Name")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Delete Recipe", () => {
    test.beforeEach(async ({ page }) => {
      const persona = getFreshNutritionPersona();
      await loginAsUser(page, persona.email);

      await page.request.post("/api/recipes", {
        data: {
          name: "Deletable Recipe",
          emoji: "🗑️",
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 8,
          ingredients: [],
        },
      });

      await page.goto("/nutrition/recipes");
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.locator(".animate-spin")).toBeHidden({ timeout: 5000 });
    });

    test("should delete recipe when clicking Delete and confirming", async ({ page }) => {
      // Expand card
      await page.getByText("Deletable Recipe").first().click();

      // Set up dialog handler for confirmation
      page.on("dialog", async (dialog) => {
        await dialog.accept();
      });

      // Click Delete
      await page.locator("button", { hasText: /delete/i }).click();

      // Recipe should be removed from the list
      await expect(page.getByText("Deletable Recipe")).toBeHidden({ timeout: 5000 });
    });
  });
});
