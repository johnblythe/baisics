/**
 * Settings Page E2E Tests
 *
 * Basic smoke tests for the settings page.
 * Verifies the page loads, renders key sections, and handles interactions.
 *
 * Lower priority - settings is less critical path than nutrition/workout.
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona } from "../../fixtures/personas";

test.describe("Settings Page", () => {
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should load /settings without errors", async ({ page }) => {
    const persona = getPersona("marcus"); // paid user with full data
    await loginAsUser(page, persona.email);
    await page.goto("/settings");
    await page.waitForSelector("main", { timeout: 10000 });

    // Page should render without crashing
    // Look for common settings page elements
    const heading = page.locator("h1, h2").filter({ hasText: /settings|profile|account/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test("should display user profile section", async ({ page }) => {
    const persona = getPersona("marcus");
    await loginAsUser(page, persona.email);
    await page.goto("/settings");
    await page.waitForSelector("main", { timeout: 10000 });

    // Should show the user's email somewhere on the page
    await expect(page.getByText(persona.email)).toBeVisible({ timeout: 5000 });
  });

  test("should be accessible from protected route (requires auth)", async ({ page }) => {
    // Try to access settings without login
    await page.goto("/settings");

    // Should redirect to signin
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
  });
});
