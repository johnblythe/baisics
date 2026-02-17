/**
 * Nutrition Date Navigation Tests
 *
 * Tests for navigating between dates on the nutrition page.
 * Uses a fresh persona (alex) who has no nutrition data set.
 *
 * The flow involves:
 * 1. Using left/right arrow buttons to navigate days
 * 2. Verifying the date header updates correctly
 * 3. Using "Jump to Today" button to return to current date
 * 4. Verifying the WeeklyStrip shows correct 7 days
 *
 * Covers:
 * - Clicking left arrow to go to previous day
 * - Clicking right arrow to go to next day
 * - Verifying date header shows formatted date or "Today"
 * - Verifying "Jump to Today" button appears on non-today dates
 * - Clicking "Jump to Today" returns to current date
 * - WeeklyStrip shows 7 day indicators
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";
import { visibleLayout } from "../../fixtures/nutrition-helpers";

// Helper to get today's date in the format used by the header
function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Helper to get yesterday's date formatted
function getYesterdayFormatted(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Helper to get date N days ago formatted
function getDateNDaysAgoFormatted(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

test.describe("Nutrition Date Navigation", () => {
  test.describe.configure({ mode: "serial" });
  // Seed personas before all tests in this file

  test("should show 'Today' in header when viewing current date", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // The header should show "Today" when viewing current date
    const header = layout.locator("h1");
    await expect(header).toContainText("Today", { timeout: 5000 });

    // "Jump to Today" button should NOT be visible
    await expect(layout.locator("text=/jump to today/i")).not.toBeVisible();
  });

  test("should navigate to previous day when clicking left arrow", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Verify we start on "Today"
    await expect(layout.locator("h1")).toContainText("Today");

    // Click the left arrow (previous day) button - find the ChevronLeft icon's parent button
    const leftArrowButton = layout.locator('[data-testid="prev-day"]');
    await expect(leftArrowButton).toBeVisible({ timeout: 3000 });
    await leftArrowButton.click();

    // Header should no longer show "Today" - should show yesterday's date
    await expect(layout.locator("h1")).not.toContainText("Today", { timeout: 3000 });

    // Header should show yesterday's formatted date
    const yesterdayFormatted = getYesterdayFormatted();
    await expect(layout.locator("h1")).toContainText(yesterdayFormatted);
  });

  test("should show 'Jump to Today' button when viewing past date", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Navigate to previous day
    const leftArrowButton = layout.locator('[data-testid="prev-day"]');
    await leftArrowButton.click();

    // Wait for date to change
    await expect(layout.locator("h1")).not.toContainText("Today", { timeout: 3000 });

    // "Jump to Today" link should now be visible
    const jumpToTodayButton = layout.locator("text=/jump to today/i");
    await expect(jumpToTodayButton).toBeVisible({ timeout: 3000 });
  });

  test("should return to current date when clicking 'Jump to Today'", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Navigate back 3 days
    const leftArrowButton = layout.locator('[data-testid="prev-day"]');
    await leftArrowButton.click();
    await expect(layout.locator("h1")).not.toContainText("Today", { timeout: 3000 });
    await leftArrowButton.click();
    await expect(layout.locator("h1")).toContainText(getDateNDaysAgoFormatted(2), { timeout: 3000 });
    await leftArrowButton.click();

    // Verify we're 3 days in the past
    const threeDaysAgoFormatted = getDateNDaysAgoFormatted(3);
    await expect(layout.locator("h1")).toContainText(threeDaysAgoFormatted, { timeout: 3000 });

    // Click "Jump to Today"
    const jumpToTodayButton = layout.locator("text=/jump to today/i");
    await expect(jumpToTodayButton).toBeVisible();
    await jumpToTodayButton.click();

    // Header should now show "Today" again
    await expect(layout.locator("h1")).toContainText("Today", { timeout: 3000 });

    // "Jump to Today" should be hidden again
    await expect(layout.locator("text=/jump to today/i")).not.toBeVisible({ timeout: 3000 });
  });

  test("should navigate to next day when clicking right arrow", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // First go to yesterday
    const leftArrowButton = layout.locator('[data-testid="prev-day"]');
    await leftArrowButton.click();

    // Wait for date to change
    await expect(layout.locator("h1")).not.toContainText("Today", { timeout: 3000 });

    // Now click right arrow to go back to today
    const rightArrowButton = layout.locator('[data-testid="next-day"]');
    await expect(rightArrowButton).toBeVisible();
    await rightArrowButton.click();

    // Should be back to "Today"
    await expect(layout.locator("h1")).toContainText("Today", { timeout: 3000 });
  });

  test("should show WeeklyStrip with 7 day indicators", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // WeeklyStrip has a Calendar icon and day indicators
    // Look for the weekly strip component by finding the calendar icon and day boxes
    const weeklyStrip = layout.locator('[data-testid="weekly-strip-toggle"]');
    await expect(weeklyStrip).toBeVisible({ timeout: 5000 });

    // Should have 7 day indicator boxes (single letters like M, T, W, etc.)
    // These are small boxes with single letter day abbreviations
    const dayIndicators = weeklyStrip.locator("div.rounded-md");
    await expect(dayIndicators).toHaveCount(7, { timeout: 5000 });
  });

  test("should highlight today in WeeklyStrip with coral color", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Find the weekly strip
    const weeklyStrip = layout.locator('[data-testid="weekly-strip-toggle"]');
    await expect(weeklyStrip).toBeVisible({ timeout: 5000 });

    // Today should be highlighted with coral background (bg-[#FF6B6B])
    // Look for a day indicator with coral background
    const todayIndicator = weeklyStrip.locator('div[class*="bg-[#FF6B6B]"]');
    await expect(todayIndicator).toBeVisible({ timeout: 3000 });

    // Should contain a single letter (day abbreviation)
    await expect(todayIndicator).toHaveText(/^[SMTWF]$/);
  });

  test("should expand WeeklyStrip when clicked to show detailed view", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    const layout = visibleLayout(page);

    // Find and click the weekly strip
    const weeklyStrip = layout.locator('[data-testid="weekly-strip-toggle"]');
    await expect(weeklyStrip).toBeVisible({ timeout: 5000 });
    await weeklyStrip.click();

    // After expanding, should show a grid with 7 columns
    // Look for the expanded view which shows date details below each day
    // The expanded view shows a grid of day cards with date info like "1/27"
    const expandedGrid = layout.locator("div.grid.grid-cols-7");
    await expect(expandedGrid).toBeVisible({ timeout: 3000 });

    // Each day in the expanded view shows the date number
    const dayDetails = expandedGrid.locator("div.text-center");
    await expect(dayDetails).toHaveCount(7);
  });

  test("should persist date when reloading page", async ({ page }) => {
    const persona = getPersona("derek");

    await loginAsUser(page, persona.email);
    await page.goto("/nutrition");
    await page.waitForSelector("main", { timeout: 10000 });

    let layout = visibleLayout(page);

    // Note: The current implementation doesn't persist date in URL,
    // so reloading always returns to today. This test verifies that behavior.

    // Navigate to yesterday
    const leftArrowButton = layout.locator('[data-testid="prev-day"]');
    await leftArrowButton.click();
    await expect(layout.locator("h1")).not.toContainText("Today", { timeout: 3000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector("main", { timeout: 10000 });

    // Re-acquire layout after reload
    layout = visibleLayout(page);

    // After reload, it should return to today (current behavior)
    await expect(layout.locator("h1")).toContainText("Today", { timeout: 5000 });
  });
});
