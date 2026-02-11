import { test, expect } from "@playwright/test";

test.describe("Coach protected routes - redirect unauthenticated users", () => {
  test("should redirect /coach/dashboard to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /coach/dashboard without logging in
    await page.goto("/coach/dashboard");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should redirect /coach/programs to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /coach/programs without logging in
    await page.goto("/coach/programs");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should redirect /coach/programs/create to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /coach/programs/create without logging in
    await page.goto("/coach/programs/create");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should redirect /coach/clients/some-id to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /coach/clients/some-id without logging in
    await page.goto("/coach/clients/some-id");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });

  test("should redirect /coach/settings to /auth/signin when not logged in", async ({
    page,
  }) => {
    // Navigate directly to /coach/settings without logging in
    await page.goto("/coach/settings");

    // Verify redirect to signin page
    await page.waitForURL("**/auth/signin**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/signin");
  });
});
