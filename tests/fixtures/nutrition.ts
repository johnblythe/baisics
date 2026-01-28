import { Page, expect } from "@playwright/test";

/**
 * Navigate to the nutrition page and wait for it to load.
 *
 * @param page - Playwright Page object
 */
export async function navigateToNutrition(page: Page): Promise<void> {
  await page.goto("/nutrition");
  // Wait for the main nutrition page content to be visible
  await page.waitForSelector('[data-testid="nutrition-page"], .nutrition-page, main', { timeout: 10000 });
}

/**
 * Wait for nutrition targets modal to appear and be interactive.
 *
 * @param page - Playwright Page object
 */
export async function waitForTargetsModal(page: Page): Promise<void> {
  // Wait for modal to be visible
  await page.waitForSelector('[data-testid="nutrition-targets-modal"], [role="dialog"]', { timeout: 10000 });
}

/**
 * Close the nutrition targets modal if it's open.
 *
 * @param page - Playwright Page object
 */
export async function closeTargetsModal(page: Page): Promise<void> {
  const closeButton = page.getByRole("button", { name: /close|cancel|×/i });
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
    // Wait for modal to disappear
    await expect(page.locator('[data-testid="nutrition-targets-modal"], [role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  }
}

/**
 * Set nutrition targets manually via the modal.
 *
 * @param page - Playwright Page object
 * @param targets - Object with calories, protein, carbs, fat
 */
export async function setNutritionTargetsManually(
  page: Page,
  targets: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }
): Promise<void> {
  // Fill in each target field if provided
  if (targets.calories !== undefined) {
    const caloriesInput = page.locator('input[name="calories"], input[data-testid="calories-input"]');
    await caloriesInput.fill(targets.calories.toString());
  }
  if (targets.protein !== undefined) {
    const proteinInput = page.locator('input[name="protein"], input[data-testid="protein-input"]');
    await proteinInput.fill(targets.protein.toString());
  }
  if (targets.carbs !== undefined) {
    const carbsInput = page.locator('input[name="carbs"], input[data-testid="carbs-input"]');
    await carbsInput.fill(targets.carbs.toString());
  }
  if (targets.fat !== undefined) {
    const fatInput = page.locator('input[name="fat"], input[data-testid="fat-input"]');
    await fatInput.fill(targets.fat.toString());
  }
}

/**
 * Save nutrition targets by clicking the save button in the modal.
 *
 * @param page - Playwright Page object
 */
export async function saveNutritionTargets(page: Page): Promise<void> {
  const saveButton = page.getByRole("button", { name: /save|apply|confirm/i });
  await saveButton.click();
  // Wait for modal to close (indicates save completed)
  await expect(page.locator('[data-testid="nutrition-targets-modal"], [role="dialog"]')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Open the nutrition targets modal by clicking the banner/button.
 *
 * @param page - Playwright Page object
 */
export async function openTargetsModal(page: Page): Promise<void> {
  // Look for the "Set Goals" banner or button
  const targetsTrigger = page.getByRole("button", { name: /set goals|set targets|edit goals|edit targets/i });

  // If banner with CTA exists, click that
  if (await targetsTrigger.isVisible().catch(() => false)) {
    await targetsTrigger.click();
  } else {
    // Try clicking the goals banner if visible
    const goalsBanner = page.locator('[data-testid="goals-banner"], .goals-banner');
    if (await goalsBanner.isVisible().catch(() => false)) {
      await goalsBanner.click();
    }
  }

  await waitForTargetsModal(page);
}

/**
 * Search for a food using the search input.
 *
 * @param page - Playwright Page object
 * @param query - Search query string
 */
export async function searchForFood(page: Page, query: string): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[data-testid="food-search-input"]');
  await searchInput.fill(query);
  // Wait for search results to appear
  await page.waitForSelector('[data-testid="search-results"], .search-results, [role="listbox"]', { timeout: 10000 });
}

/**
 * Click on a search result by name.
 *
 * @param page - Playwright Page object
 * @param foodName - Partial food name to match
 */
export async function selectSearchResult(page: Page, foodName: string): Promise<void> {
  const result = page.locator('[data-testid="search-result"], .search-result, [role="option"]')
    .filter({ hasText: new RegExp(foodName, 'i') })
    .first();
  await result.click();
}

/**
 * Add food to a meal from the serving modal.
 *
 * @param page - Playwright Page object
 * @param options - Options for adding food
 */
export async function addFoodToMeal(
  page: Page,
  options?: {
    servingSize?: number;
    meal?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  }
): Promise<void> {
  // If serving size specified, update it
  if (options?.servingSize) {
    const servingInput = page.locator('input[name="servingSize"], input[data-testid="serving-size-input"]');
    await servingInput.fill(options.servingSize.toString());
  }

  // If meal specified, select it
  if (options?.meal) {
    const mealSelect = page.locator('select[name="meal"], [data-testid="meal-select"]');
    if (await mealSelect.isVisible().catch(() => false)) {
      await mealSelect.selectOption(options.meal);
    }
  }

  // Click add button
  const addButton = page.getByRole("button", { name: /add|log|save/i });
  await addButton.click();
}

/**
 * Get current macro values displayed in the UI.
 *
 * @param page - Playwright Page object
 * @returns Object with calories, protein, carbs, fat values
 */
export async function getCurrentMacros(page: Page): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  const getMacroValue = async (selector: string): Promise<number> => {
    const element = page.locator(selector).first();
    const text = await element.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  return {
    calories: await getMacroValue('[data-testid="calories-current"], .calories-value'),
    protein: await getMacroValue('[data-testid="protein-current"], .protein-value'),
    carbs: await getMacroValue('[data-testid="carbs-current"], .carbs-value'),
    fat: await getMacroValue('[data-testid="fat-current"], .fat-value'),
  };
}

/**
 * Navigate to a specific date using the date navigation arrows.
 *
 * @param page - Playwright Page object
 * @param direction - 'prev' or 'next' for navigation direction
 * @param days - Number of days to navigate (default 1)
 */
export async function navigateDate(
  page: Page,
  direction: 'prev' | 'next',
  days: number = 1
): Promise<void> {
  const arrowSelector = direction === 'prev'
    ? '[data-testid="prev-day"], button[aria-label*="previous" i]'
    : '[data-testid="next-day"], button[aria-label*="next" i]';

  const arrow = page.locator(arrowSelector).first();

  for (let i = 0; i < days; i++) {
    await arrow.click();
    // Brief wait for UI update
    await page.waitForTimeout(200);
  }
}

/**
 * Click the "Today" button to return to current date.
 *
 * @param page - Playwright Page object
 */
export async function goToToday(page: Page): Promise<void> {
  const todayButton = page.getByRole("button", { name: /today/i });
  await todayButton.click();
}

/**
 * Open the AI text parsing modal.
 *
 * @param page - Playwright Page object
 */
export async function openAiTextModal(page: Page): Promise<void> {
  // Look for the AI/sparkle button
  const aiButton = page.locator('[data-testid="ai-parse-button"], button[aria-label*="ai" i], .ai-sparkle-button');
  await aiButton.click();
  // Wait for modal to appear
  await page.waitForSelector('[data-testid="ai-parse-modal"], [role="dialog"]', { timeout: 10000 });
}

/**
 * Enter freeform text for AI parsing.
 *
 * @param page - Playwright Page object
 * @param text - Freeform text to parse (e.g., "chicken breast 6oz")
 */
export async function enterAiText(page: Page, text: string): Promise<void> {
  const textInput = page.locator('textarea[data-testid="ai-text-input"], textarea[placeholder*="describe" i], input[data-testid="ai-text-input"]');
  await textInput.fill(text);
}

/**
 * Confirm AI parsed result and add to log.
 *
 * @param page - Playwright Page object
 */
export async function confirmAiParsedFood(page: Page): Promise<void> {
  const confirmButton = page.getByRole("button", { name: /confirm|add|save/i });
  await confirmButton.click();
}

/**
 * Get food items displayed in a specific meal section.
 *
 * @param page - Playwright Page object
 * @param meal - Meal type to get foods from
 * @returns Locator for food items in the meal section
 */
export function getMealFoodItems(page: Page, meal: 'breakfast' | 'lunch' | 'dinner' | 'snacks') {
  const mealSection = page.locator(`[data-testid="${meal}-section"], [data-meal="${meal}"], .meal-section.${meal}`);
  return mealSection.locator('[data-testid="food-item"], .food-item');
}

/**
 * Edit a food entry in the log.
 *
 * @param page - Playwright Page object
 * @param foodName - Name of food to edit
 */
export async function clickEditFood(page: Page, foodName: string): Promise<void> {
  const foodItem = page.locator('[data-testid="food-item"], .food-item')
    .filter({ hasText: new RegExp(foodName, 'i') })
    .first();

  const editButton = foodItem.locator('button[aria-label*="edit" i], [data-testid="edit-button"]');
  await editButton.click();
}

/**
 * Delete a food entry from the log.
 *
 * @param page - Playwright Page object
 * @param foodName - Name of food to delete
 */
export async function clickDeleteFood(page: Page, foodName: string): Promise<void> {
  const foodItem = page.locator('[data-testid="food-item"], .food-item')
    .filter({ hasText: new RegExp(foodName, 'i') })
    .first();

  const deleteButton = foodItem.locator('button[aria-label*="delete" i], [data-testid="delete-button"]');
  await deleteButton.click();
}
