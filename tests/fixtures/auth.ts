import { Page, expect } from "@playwright/test";

/**
 * Login as a user via magic link flow (dev mode).
 *
 * Flow:
 * 1. Navigate to /auth/signin
 * 2. Enter email in the form
 * 3. Click "Send magic link" button
 * 4. Wait for redirect to /auth/verify-request
 * 5. Click the dev magic link ("Click here to sign in →")
 * 6. Wait for authentication to complete (redirects to dashboard or /hi)
 *
 * @param page - Playwright Page object
 * @param email - Email address to login with
 */
export async function loginAsUser(page: Page, email: string): Promise<void> {
  // Navigate to signin page
  await page.goto("/auth/signin");

  // Fill in email address
  await page.getByLabel("Email address").fill(email);

  // Click the submit button
  await page.getByRole("button", { name: /send magic link/i }).click();

  // Wait for redirect to verify-request page
  await page.waitForURL("**/auth/verify-request**");

  // In dev mode, there's a "Click here to sign in" link with the magic link
  // Wait for the dev magic link to appear and click it
  const magicLinkButton = page.getByRole("link", {
    name: /click here to sign in/i,
  });
  await expect(magicLinkButton).toBeVisible({ timeout: 10000 });
  await magicLinkButton.click();

  // Wait for authentication to complete - user will be redirected away from verify-request
  // They'll go to /dashboard (existing user) or /hi (new user)
  await page.waitForURL((url) => {
    const path = url.pathname;
    return !path.includes("/auth/");
  }, { timeout: 15000 });
}

/**
 * Logout the current user.
 *
 * Clicks the logout button in the header/nav to sign out.
 * Waits for redirect to landing page.
 *
 * @param page - Playwright Page object
 */
export async function logoutUser(page: Page): Promise<void> {
  // The logout button is in the header dropdown
  // First, we need to open the user menu if it exists
  const userMenuButton = page.getByRole("button", { name: /menu|account|user/i });

  // Check if there's a user menu button to click
  if (await userMenuButton.isVisible().catch(() => false)) {
    await userMenuButton.click();
  }

  // Click the logout button/link
  const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
  const logoutLink = page.getByRole("link", { name: /logout|sign out/i });

  // Try button first, then link
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
  } else if (await logoutLink.isVisible().catch(() => false)) {
    await logoutLink.click();
  } else {
    // Fallback: look for any element with "Logout" text
    await page.getByText(/^logout$/i).click();
  }

  // Wait for redirect to landing page
  await page.waitForURL("/", { timeout: 10000 });
}
