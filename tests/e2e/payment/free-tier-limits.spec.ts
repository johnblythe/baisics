import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona } from "../../fixtures/personas";

test.describe("Free tier limits - upgrade prompt on 2nd program", () => {
  // Use serial mode to avoid seed race conditions
  test.describe.configure({ mode: "serial" });

  // Seed personas before all tests in this file
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should show upgrade prompt when free user tries to claim a second program", async ({
    page,
  }) => {
    // Get sarah persona (free tier, has 1 program)
    const sarah = getPersona("sarah");
    expect(sarah.tier).toBe("free");
    expect(sarah.hasProgram).toBe(true);

    // Login as sarah
    await loginAsUser(page, sarah.email);

    // Wait for dashboard to load
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });

    // Navigate to the library page
    await page.goto("/library");
    await page.waitForLoadState("networkidle");

    // Click Templates tab to ensure we see claimable programs
    await page.getByRole("button", { name: /Templates/i }).click();

    // Wait for programs to load
    await page.waitForLoadState("networkidle");

    // Find and click a "Claim Program" button on any template
    const claimButton = page.getByRole("button", { name: /Claim Program/i }).first();
    await expect(claimButton).toBeVisible({ timeout: 10000 });
    await claimButton.click();

    // Verify upgrade prompt/modal appears
    // The UpgradeModal has "Ready for More?" title for program_limit context
    const upgradeModalTitle = page.getByRole("heading", { name: /Ready for More/i });
    await expect(upgradeModalTitle).toBeVisible({ timeout: 10000 });

    // Verify the upgrade subtitle mentions free accounts limitation
    const limitText = page.getByText(/Free accounts are limited to one active program/i);
    await expect(limitText).toBeVisible();

    // Verify 'Upgrade Now' button is visible
    const upgradeButton = page.getByRole("button", { name: /Upgrade Now/i });
    await expect(upgradeButton).toBeVisible();

    // Verify 'Maybe later' dismiss option is present
    const dismissButton = page.getByRole("button", { name: /Maybe later/i });
    await expect(dismissButton).toBeVisible();
  });

  test("should close upgrade modal when clicking Maybe later", async ({
    page,
  }) => {
    // Get sarah persona (free tier, has 1 program)
    const sarah = getPersona("sarah");

    // Login as sarah
    await loginAsUser(page, sarah.email);

    // Wait for dashboard to load
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });

    // Navigate to the library page
    await page.goto("/library");
    await page.waitForLoadState("networkidle");

    // Click Templates tab
    await page.getByRole("button", { name: /Templates/i }).click();
    await page.waitForLoadState("networkidle");

    // Click a "Claim Program" button
    const claimButton = page.getByRole("button", { name: /Claim Program/i }).first();
    await expect(claimButton).toBeVisible({ timeout: 10000 });
    await claimButton.click();

    // Verify upgrade modal appears
    const upgradeModalTitle = page.getByRole("heading", { name: /Ready for More/i });
    await expect(upgradeModalTitle).toBeVisible({ timeout: 10000 });

    // Click "Maybe later" to dismiss
    const dismissButton = page.getByRole("button", { name: /Maybe later/i });
    await dismissButton.click();

    // Verify modal is closed (title should not be visible)
    await expect(upgradeModalTitle).not.toBeVisible({ timeout: 5000 });

    // Verify we're still on the library page
    expect(page.url()).toContain("/library");
  });
});
