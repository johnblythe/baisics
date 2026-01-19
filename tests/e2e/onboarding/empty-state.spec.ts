import { test, expect } from "@playwright/test";

test.describe("Empty state dashboard - CTAs for new users", () => {
  /**
   * Tests that users with no programs see the empty state dashboard
   * with proper CTAs for creating their first program.
   *
   * Note: Using a unique email instead of alex@test.baisics.app because
   * alex has a seeded program in test data. Fresh signup users see the true empty state.
   */
  test("should show all three CTAs on empty state dashboard", async ({
    page,
  }) => {
    // Generate unique email with timestamp to ensure new user with no programs
    const uniqueEmail = `test-empty-${Date.now()}@test.baisics.app`;

    // Navigate to signin page
    await page.goto("/auth/signin");

    // Fill in the unique email address
    await page.getByLabel("Email address").fill(uniqueEmail);

    // Click the send magic link button
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Wait for redirect to verify-request page
    await page.waitForURL("**/auth/verify-request**");

    // In dev mode, click the magic link
    const magicLinkButton = page.getByRole("link", {
      name: /click here to sign in/i,
    });
    await expect(magicLinkButton).toBeVisible({ timeout: 10000 });
    await magicLinkButton.click();

    // New user is redirected to /dashboard with empty state
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Verify we're on the dashboard
    expect(page.url()).toContain("/dashboard");

    // Verify "No active program" heading is visible (confirms empty state)
    await expect(
      page.getByRole("heading", { name: /no active program/i })
    ).toBeVisible();

    // Test 1: Verify "Create with AI" CTA is visible and links to /hi
    const createWithAiLink = page.getByRole("link", { name: /create with ai/i });
    await expect(createWithAiLink).toBeVisible();
    await expect(createWithAiLink).toHaveAttribute("href", "/hi");

    // Test 2: Verify "Browse Templates" CTA is visible and links to /templates
    const browseTemplatesLink = page.getByRole("link", { name: /browse templates/i });
    await expect(browseTemplatesLink).toBeVisible();
    await expect(browseTemplatesLink).toHaveAttribute("href", "/templates");

    // Test 3: Verify "Import your own" CTA is visible and links to /create
    const importOwnLink = page.getByRole("link", { name: /import your own/i });
    await expect(importOwnLink).toBeVisible();
    await expect(importOwnLink).toHaveAttribute("href", "/create");
  });
});
