import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { seedPersonas } from "../../fixtures/seed";
import { getPersona } from "../../fixtures/personas";

test.describe("Auth signout - clears session", () => {
  // Seed personas before all tests in this file
  test.beforeAll(async () => {
    await seedPersonas();
  });

  test("should sign out user and redirect to landing page", async ({
    page,
  }) => {
    // Get marcus persona (has programs, paid tier)
    const marcus = getPersona("marcus");

    // Login as marcus using the auth fixture
    await loginAsUser(page, marcus.email);

    // Verify we're on dashboard
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");

    // Dismiss the "Welcome back" modal if it appears
    const dismissButton = page.getByText("Not today, remind me tomorrow");
    try {
      await dismissButton.waitFor({ state: "visible", timeout: 5000 });
      await dismissButton.click();
      // Wait for modal to fully disappear
      await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Modal might not appear, continue
    }

    // Reload the page to ensure session is fully established in the Header
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify we see the authenticated header (Dashboard link instead of Programs)
    const dashboardNavLink = page
      .locator("header")
      .getByRole("link", { name: "Dashboard" });
    await dashboardNavLink.waitFor({ state: "visible", timeout: 15000 });

    // Click the user avatar/menu button to open the dropdown
    // The avatar shows user initial in a coral-colored circle
    // It's the button that triggers the Headless UI Menu dropdown
    const userAvatarButton = page.locator("header button").filter({
      has: page.locator(".rounded-full"),
    });
    await userAvatarButton.click();

    // Click the "Logout" button in the dropdown menu
    // The Headless UI Menu.Item contains a button, but we can also target by text
    const logoutButton = page.getByText("Logout", { exact: true });
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    await logoutButton.click();

    // Verify redirect to landing page
    await page.waitForURL("/", { timeout: 10000 });
    expect(page.url()).toBe("http://localhost:3001/");

    // Now try to navigate to /dashboard - should redirect to signin
    await page.goto("/dashboard");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });
});
