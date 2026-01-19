import { test, expect } from "@playwright/test";

test.describe("Magic link signup - new user", () => {
  test("should redirect new user to onboarding after signup", async ({
    page,
  }) => {
    // Generate unique email with timestamp to ensure new user
    const uniqueEmail = `test-${Date.now()}@test.baisics.app`;

    // Navigate to signin page
    await page.goto("/auth/signin");

    // Fill in the unique email address
    await page.getByLabel("Email address").fill(uniqueEmail);

    // Click the send magic link button
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Wait for redirect to verify-request page
    await page.waitForURL("**/auth/verify-request**");

    // In dev mode, there's a "Click here to sign in" link with the magic link
    const magicLinkButton = page.getByRole("link", {
      name: /click here to sign in/i,
    });
    await expect(magicLinkButton).toBeVisible({ timeout: 10000 });
    await magicLinkButton.click();

    // New user is redirected to /dashboard which shows the empty state onboarding
    // The empty state dashboard is the onboarding experience for new users
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Verify we're on dashboard with the onboarding empty state
    expect(page.url()).toContain("/dashboard");

    // Verify the "Create with AI" CTA is visible (links to /hi)
    const createWithAiLink = page.getByRole("link", { name: /create with ai/i });
    await expect(createWithAiLink).toBeVisible();

    // Verify the link points to /hi
    await expect(createWithAiLink).toHaveAttribute("href", "/hi");
  });
});
