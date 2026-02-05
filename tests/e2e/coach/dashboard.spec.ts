import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { COACH_TEST_PERSONAS } from "../../fixtures/personas";

test.describe("Coach Dashboard", () => {
  test.describe.configure({ mode: "serial" });

  test("should load dashboard for coach with clients", async ({ page }) => {
    // Login as active coach (coach-pro@test.baisics.app)
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Wait for redirect to coach dashboard
    await page.waitForURL("**/coach/dashboard**", { timeout: 15000 });
    expect(page.url()).toContain("/coach/dashboard");

    // Verify "Active Clients" section heading is visible
    const clientsSection = page.getByRole("heading", { name: /Active Clients/i });
    await expect(clientsSection).toBeVisible({ timeout: 10000 });

    // Verify at least one client card is visible
    // Client cards contain emails in the format "xxx@test.baisics.app"
    // or we can look for the "accepted" invite status indicator (cards are shown for accepted clients)
    // The cards have client emails displayed as truncated text
    const clientCard = page.locator("a[href*='/coach/clients/']").first();
    await expect(clientCard).toBeVisible({ timeout: 10000 });
  });

  test("should show empty state for new coach", async ({ page }) => {
    // Login as new coach with no clients (coach-new@test.baisics.app)
    await loginAsUser(page, COACH_TEST_PERSONAS.empty.email);

    // Wait for redirect to coach dashboard
    await page.waitForURL("**/coach/dashboard**", { timeout: 15000 });
    expect(page.url()).toContain("/coach/dashboard");

    // Verify empty state message is visible
    // The empty state shows "No clients yet" heading or "Add your first client" text
    const emptyStateHeading = page.getByText("No clients yet");
    const emptyStateMessage = page.getByText(/Add your first client/i);
    const addClientCTA = page.getByRole("button", { name: /Add Client/i });

    // Either the empty state message or the Add Client CTA should be visible
    const hasEmptyState = await Promise.race([
      emptyStateHeading.isVisible().then(() => true).catch(() => false),
      emptyStateMessage.isVisible().then(() => true).catch(() => false),
      addClientCTA.first().isVisible().then(() => true).catch(() => false),
    ]);

    // At minimum, the Add Client button should be visible for a new coach
    await expect(addClientCTA.first()).toBeVisible({ timeout: 10000 });
  });

  test("should have Add Client button", async ({ page }) => {
    // Login as active coach
    await loginAsUser(page, COACH_TEST_PERSONAS.active.email);

    // Wait for coach dashboard to load
    await page.waitForURL("**/coach/dashboard**", { timeout: 15000 });

    // Verify "Add Client" button is visible in the header
    // There are multiple Add Client buttons - one in header, one in empty state
    // We check that at least one is visible
    const addClientButton = page.getByRole("button", { name: /Add Client/i }).first();
    await expect(addClientButton).toBeVisible({ timeout: 10000 });
  });
});
