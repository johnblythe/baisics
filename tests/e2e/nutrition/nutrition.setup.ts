/**
 * Nutrition E2E Test Setup
 *
 * This file contains shared setup and utilities for all nutrition E2E tests.
 * Import from here to get consistent test environment configuration.
 */

import { test as base, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona, getFreshNutritionPersona, NUTRITION_TEST_PERSONAS } from "../../fixtures/personas";
import {
  navigateToNutrition,
  openTargetsModal,
  closeTargetsModal,
  setNutritionTargetsManually,
  saveNutritionTargets,
  searchForFood,
  selectSearchResult,
  addFoodToMeal,
  getCurrentMacros,
  navigateDate,
  goToToday,
  openAiTextModal,
  enterAiText,
  confirmAiParsedFood,
  getMealFoodItems,
  clickEditFood,
  clickDeleteFood,
} from "../../fixtures/nutrition";

/**
 * Extended test fixture with nutrition helpers pre-loaded.
 */
export const test = base.extend<{
  nutritionPage: {
    navigate: () => Promise<void>;
    openTargets: () => Promise<void>;
    closeTargets: () => Promise<void>;
    setTargets: (targets: { calories?: number; protein?: number; carbs?: number; fat?: number }) => Promise<void>;
    saveTargets: () => Promise<void>;
    search: (query: string) => Promise<void>;
    selectResult: (foodName: string) => Promise<void>;
    addFood: (options?: { servingSize?: number; meal?: "breakfast" | "lunch" | "dinner" | "snacks" }) => Promise<void>;
    getMacros: () => Promise<{ calories: number; protein: number; carbs: number; fat: number }>;
    prevDay: (days?: number) => Promise<void>;
    nextDay: (days?: number) => Promise<void>;
    today: () => Promise<void>;
    openAi: () => Promise<void>;
    enterAiText: (text: string) => Promise<void>;
    confirmAi: () => Promise<void>;
    getMealItems: (meal: "breakfast" | "lunch" | "dinner" | "snacks") => ReturnType<typeof getMealFoodItems>;
    editFood: (foodName: string) => Promise<void>;
    deleteFood: (foodName: string) => Promise<void>;
  };
}>({
  nutritionPage: async ({ page }, use) => {
    await use({
      navigate: () => navigateToNutrition(page),
      openTargets: () => openTargetsModal(page),
      closeTargets: () => closeTargetsModal(page),
      setTargets: (targets) => setNutritionTargetsManually(page, targets),
      saveTargets: () => saveNutritionTargets(page),
      search: (query) => searchForFood(page, query),
      selectResult: (foodName) => selectSearchResult(page, foodName),
      addFood: (options) => addFoodToMeal(page, options),
      getMacros: () => getCurrentMacros(page),
      prevDay: (days) => navigateDate(page, "prev", days),
      nextDay: (days) => navigateDate(page, "next", days),
      today: () => goToToday(page),
      openAi: () => openAiTextModal(page),
      enterAiText: (text) => enterAiText(page, text),
      confirmAi: () => confirmAiParsedFood(page),
      getMealItems: (meal) => getMealFoodItems(page, meal),
      editFood: (foodName) => clickEditFood(page, foodName),
      deleteFood: (foodName) => clickDeleteFood(page, foodName),
    });
  },
});

// Re-export commonly used items
export { expect };
export {
  loginAsUser,
  seedPersonas,
  getPersona,
  getFreshNutritionPersona,
  NUTRITION_TEST_PERSONAS,
};

// Re-export all nutrition helpers for tests that need direct access
export * from "../../fixtures/nutrition";
export * from "../../fixtures/nutrition-mocks";
