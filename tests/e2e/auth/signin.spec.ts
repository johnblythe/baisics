import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";

test.describe("Magic link signin - returning user", () => {
  // Seed personas before all tests in this file

  test("should redirect returning user to dashboard with program name", async ({
    page,
  }) => {
    // Get marcus persona (has programs, paid tier)
    const marcus = getPersona("marcus");

    // Login as marcus using the auth fixture
    await loginAsUser(page, marcus.email);

    // Verify redirect to dashboard (marcus has programs)
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");

    // Verify dashboard shows program name
    // Marcus has "PPL Hypertrophy Program"
    const programNameHeading = page.getByRole("heading", {
      name: /PPL Hypertrophy Program/i,
    });
    await expect(programNameHeading).toBeVisible({ timeout: 10000 });
  });
});
