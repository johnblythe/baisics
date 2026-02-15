/**
 * Library Page CTA Copy Tests (#348)
 *
 * Verifies the updated CTA copy on /library:
 * - "Chat with AI to build yours" (was "Create Custom Program")
 * - CTA links to /hi
 *
 * @see #348 - Library copy update
 */

import { test, expect } from "@playwright/test";

test.describe("/library CTA", () => {
  test("should show updated CTA copy 'Chat with AI to build yours'", async ({ page }) => {
    await page.goto("/library");
    await page.waitForLoadState("networkidle");

    // The CTA section at the bottom of the page
    const ctaLink = page.getByRole("link", { name: /chat with ai to build yours/i });
    await expect(ctaLink).toBeVisible({ timeout: 10000 });
  });

  test("CTA should link to /hi", async ({ page }) => {
    await page.goto("/library");
    await page.waitForLoadState("networkidle");

    const ctaLink = page.getByRole("link", { name: /chat with ai to build yours/i });
    await expect(ctaLink).toBeVisible({ timeout: 10000 });
    await expect(ctaLink).toHaveAttribute("href", "/hi");
  });

  test("should show 'Don't see what you need?' heading above CTA", async ({ page }) => {
    await page.goto("/library");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { name: /don.*t see what you need/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});
