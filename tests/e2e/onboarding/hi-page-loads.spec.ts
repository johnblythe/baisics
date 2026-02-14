/**
 * /hi Onboarding Page Load Tests
 *
 * Regression tests to ensure the /hi page loads without client/server import errors.
 * This prevents PrismaClient from being bundled in the browser.
 *
 * Covers:
 * - Page loads without console errors about PrismaClient
 * - No "unable to run in browser" errors
 * - Chat interface renders correctly (hero layout with prominent textarea)
 * - Quick start pill buttons render
 * - "or" divider separates chat input from quick starts
 * - DIY text links render
 * - Page is interactive (can type in input)
 *
 * @see US-011
 * @see #351 - /hi onboarding layout update
 */

import { test, expect } from "@playwright/test";

test.describe("/hi Onboarding Page", () => {
  test("should load /hi without PrismaClient errors", async ({ page }) => {
    // Collect console errors during page load
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // Check for PrismaClient-related errors
    const prismaErrors = consoleErrors.filter(
      (error) =>
        error.toLowerCase().includes("prisma") ||
        error.toLowerCase().includes("prismaclient")
    );

    // Assert no PrismaClient errors
    expect(prismaErrors).toHaveLength(0);
  });

  test("should load /hi without 'unable to run in browser' errors", async ({
    page,
  }) => {
    // Collect console errors during page load
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // Check for "unable to run in browser" or "cannot run in the browser" errors
    const browserErrors = consoleErrors.filter(
      (error) =>
        error.toLowerCase().includes("unable to run in browser") ||
        error.toLowerCase().includes("cannot run in the browser") ||
        error.toLowerCase().includes("can't run in the browser")
    );

    // Assert no browser-related module errors
    expect(browserErrors).toHaveLength(0);
  });

  test("should render hero heading and textarea", async ({ page }) => {
    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to load past the loading spinner
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait for initial typing indicator to finish and welcome message to appear
    await page.waitForTimeout(1500);

    // 1. Hero heading "Let's Build Your Program"
    const heading = page.getByRole("heading", {
      name: /let.*s build your program/i,
    });
    await expect(heading).toBeVisible({ timeout: 10000 });

    // 2. Textarea for user input (hero form - large and prominent)
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
  });

  test("should show hero form with prominent textarea before conversation starts", async ({ page }) => {
    await page.goto("/hi");
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait for welcome message
    await page.waitForTimeout(1500);

    // Hero textarea should have larger styling (text-lg class, p-6 padding, border-2)
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // The hero textarea has specific classes: text-lg, p-6, border-2, rounded-2xl
    await expect(textarea).toHaveClass(/text-lg/);
    await expect(textarea).toHaveClass(/rounded-2xl/);

    // "Start chatting" submit button should be present
    const submitButton = page.getByRole("button", { name: /start chatting/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
  });

  test("should show welcome message bubble", async ({ page }) => {
    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to load
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait for typing indicator to finish and message to appear
    // The welcome message appears after a 1 second typing delay
    await page.waitForTimeout(1500);

    // Welcome message should appear in a navy bubble (bg-[#0F172A])
    // In the new layout, it's rendered inline above the hero form, not in a .messages-container
    const welcomeBubble = page.locator('[class*="bg-[#0F172A]"]').first();
    await expect(welcomeBubble).toBeVisible({ timeout: 5000 });
  });

  test("should show 'or' divider between chat input and quick starts", async ({ page }) => {
    await page.goto("/hi");
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait for welcome message to load
    await page.waitForTimeout(1500);

    // The "or" divider text should be visible
    const orDivider = page.getByText("or", { exact: true });
    await expect(orDivider).toBeVisible({ timeout: 5000 });
  });

  test("should allow typing in chat input", async ({ page }) => {
    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to load
    await page.waitForSelector("main", { timeout: 10000 });

    // Find the textarea
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // Type a test message
    const testMessage = "I want to build muscle";
    await textarea.fill(testMessage);

    // Verify the input value
    await expect(textarea).toHaveValue(testMessage);
  });

  test("should show Quick Start pill buttons", async ({ page }) => {
    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to load
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait for initial content to render
    await page.waitForTimeout(1500);

    // Quick start buttons (pill-style, below "or" divider)
    // Labels are: "Lose weight", "Build muscle", "Get stronger", "General fitness"
    const loseWeightBtn = page.getByRole("button", { name: /lose weight/i });
    await expect(loseWeightBtn).toBeVisible({ timeout: 5000 });

    const buildMuscleBtn = page.getByRole("button", { name: /build muscle/i });
    await expect(buildMuscleBtn).toBeVisible();

    const getStrongerBtn = page.getByRole("button", { name: /get stronger/i });
    await expect(getStrongerBtn).toBeVisible();

    const generalFitnessBtn = page.getByRole("button", {
      name: /general fitness/i,
    });
    await expect(generalFitnessBtn).toBeVisible();
  });

  test("should show DIY text links", async ({ page }) => {
    await page.goto("/hi");
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait for initial content to render
    await page.waitForTimeout(1500);

    // DIY links: "Browse templates" and "I have a program"
    const browseTemplates = page.getByRole("link", { name: /browse templates/i });
    await expect(browseTemplates).toBeVisible({ timeout: 5000 });
    await expect(browseTemplates).toHaveAttribute("href", "/templates");

    const haveProgram = page.getByRole("link", { name: /i have a program/i });
    await expect(haveProgram).toBeVisible({ timeout: 5000 });
    await expect(haveProgram).toHaveAttribute("href", "/create");
  });

  test("should have no critical JavaScript errors on load", async ({
    page,
  }) => {
    // Collect ALL console errors during page load
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to /hi
    await page.goto("/hi");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Filter for critical errors (excluding common acceptable errors)
    const criticalErrors = [...consoleErrors, ...pageErrors].filter((error) => {
      const lowerError = error.toLowerCase();
      // Ignore known non-critical errors
      if (lowerError.includes("favicon")) return false;
      if (lowerError.includes("hydration")) return false; // Minor hydration warnings
      if (lowerError.includes("failed to fetch")) return false; // Network issues in test
      if (lowerError.includes("third-party")) return false; // Third party script issues

      // These ARE critical - should never happen
      if (lowerError.includes("prisma")) return true;
      if (lowerError.includes("unable to run")) return true;
      if (lowerError.includes("cannot run in the browser")) return true;
      if (lowerError.includes("is not a function")) return true;
      if (lowerError.includes("is not defined")) return true;
      if (lowerError.includes("unexpected token")) return true;
      if (lowerError.includes("syntax error")) return true;

      return false;
    });

    // Assert no critical errors
    expect(criticalErrors).toHaveLength(0);
  });
});
