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
