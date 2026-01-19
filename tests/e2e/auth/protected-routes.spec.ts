import { test, expect } from "@playwright/test";

test.describe("Auth protected routes - redirect unauthenticated users", () => {
  test("should redirect /dashboard to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /dashboard without logging in
    await page.goto("/dashboard");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should redirect /settings to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /settings without logging in
    await page.goto("/settings");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should redirect /check-in to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /check-in without logging in
    await page.goto("/check-in");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });
});
