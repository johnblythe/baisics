import { Page, Locator } from "@playwright/test";

/**
 * Returns a locator scoped to the visible layout container.
 *
 * FoodLogPage renders both MobileLayout and DesktopLayout simultaneously,
 * hidden/shown via CSS breakpoints (lg: = 1024px). This helper scopes
 * locators to the correct one so `.first()` doesn't grab hidden elements.
 */
export function visibleLayout(page: Page): Locator {
  const width = page.viewportSize()?.width ?? 1280;
  return width >= 1024
    ? page.locator('[data-testid="desktop-layout"]')
    : page.locator('[data-testid="mobile-layout"]');
}

/**
 * Format a date as YYYY-MM-DD in local timezone.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Clear all food log entries for a given date (defaults to today).
 * Call after login to ensure a clean state for tests.
 */
export async function clearFoodLogForDate(
  page: Page,
  daysOffset = 0
): Promise<void> {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const dateStr = formatDate(date);
  await page.request.delete(`/api/food-log?date=${dateStr}`);
}

/**
 * Clear food log entries for today and yesterday.
 * Use at the start of tests that need a completely clean nutrition state.
 */
export async function clearRecentFoodLogs(page: Page): Promise<void> {
  await Promise.all([
    clearFoodLogForDate(page, 0),   // today
    clearFoodLogForDate(page, -1),  // yesterday
    clearFoodLogForDate(page, -2),  // 2 days ago (for copy-from-yesterday tests that navigate)
  ]);
}
