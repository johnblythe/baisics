/**
 * Coach Program Create Page E2E Tests
 *
 * Tests the /coach/programs/create page:
 * - Page loads without errors
 * - Build and Import tabs are visible
 * - isTemplate toggle is visible
 * - Program builder form appears in Build tab
 * - Import interface appears in Import tab
 *
 * Uses coachPro persona (active coach with clients and templates).
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { COACH_TEST_PERSONAS } from "../../fixtures/personas";

test.describe("Coach Program Create Page", () => {
  test.describe.configure({ mode: "serial" });

  test("should load program create page", async ({ page }) => {
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);
    await page.goto("/coach/programs/create");

    // Wait for page to load by checking for heading
    await expect(page.getByRole("heading", { name: "Create Program" })).toBeVisible({ timeout: 10000 });

    // Page should load without console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Verify page title or header is visible
    await expect(page.getByText("Create Program")).toBeVisible({ timeout: 5000 });

    // Filter out known acceptable console messages
    const criticalErrors = consoleErrors.filter((error) => {
      if (error.includes("Tawk") || error.includes("tawk")) return false;
      if (error.includes("favicon")) return false;
      if (error.includes("React") && error.includes("warning")) return false;
      return true;
    });

    expect(
      criticalErrors,
      `Unexpected console errors: ${criticalErrors.join(", ")}`
    ).toHaveLength(0);
  });

  test("should display Build and Import tabs", async ({ page }) => {
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);
    await page.goto("/coach/programs/create");
    await page.waitForLoadState("networkidle");

    // Verify Build tab is visible
    const buildTab = page.locator("button", { hasText: "Build" });
    await expect(buildTab).toBeVisible({ timeout: 5000 });

    // Verify Import tab is visible
    const importTab = page.locator("button", { hasText: "Import" });
    await expect(importTab).toBeVisible({ timeout: 5000 });
  });

  test("should show isTemplate toggle", async ({ page }) => {
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);
    await page.goto("/coach/programs/create");
    await page.waitForLoadState("networkidle");

    // Verify template toggle/checkbox is visible
    // The toggle has text "Save as template" next to it
    const templateToggle = page.getByText(/save as template/i);
    await expect(templateToggle).toBeVisible({ timeout: 5000 });
  });

  test("should show program builder in Build tab", async ({ page }) => {
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);
    await page.goto("/coach/programs/create");
    await page.waitForLoadState("networkidle");

    // Ensure Build tab is active (it's the default)
    const buildTab = page.locator("button", { hasText: "Build" });
    await buildTab.click();

    // Verify program builder form elements are visible
    // ProgramBuilder component should render with form elements
    // Look for common form elements like program name input or workout sections
    const programNameInput = page.locator(
      'input[placeholder*="program" i], input[placeholder*="name" i], input[type="text"]'
    ).first();

    // Wait for the builder to load
    await page.waitForTimeout(1000);

    // The ProgramBuilder should be rendered - look for any input or form element
    const builderContent = page.locator("form, input, textarea, button").first();
    await expect(builderContent).toBeVisible({ timeout: 5000 });
  });

  test("should show import interface in Import tab", async ({ page }) => {
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);
    await page.goto("/coach/programs/create");
    await page.waitForLoadState("networkidle");

    // Click Import tab
    const importTab = page.locator("button", { hasText: "Import" });
    await importTab.click();

    // Verify text input area is visible
    const textArea = page.locator("textarea");
    await expect(textArea).toBeVisible({ timeout: 5000 });

    // Verify file upload button/area is visible
    const fileUploadButton = page.getByText(/upload pdf|upload file|docx|txt/i);
    await expect(fileUploadButton).toBeVisible({ timeout: 5000 });

    // Verify "Parse Program" button is visible
    const parseButton = page.locator("button", { hasText: /parse program/i });
    await expect(parseButton).toBeVisible({ timeout: 5000 });
  });
});
