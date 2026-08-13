import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Try it free")).toBeVisible();
  });

  test("landing demo generator accepts commits", async ({ page }) => {
    await page.goto("/");
    await page
      .getByLabel("Paste commits")
      .fill("feat(ui): add onboarding checklist\nfix: typo in billing banner");
    await expect(page.getByRole("button", { name: /Generate/i })).toBeEnabled();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in with GitHub")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with GitHub/i }),
    ).toBeVisible();
  });

  test("onboarding redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });

  test("faq page loads", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: "FAQ" })).toBeVisible();
  });

  test("changelog page loads", async ({ page }) => {
    await page.goto("/changelog");
    await expect(page.getByRole("heading", { name: "Changelog" })).toBeVisible();
  });

  test("legal pages load", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(
      page.getByRole("heading", { name: "Terms of Service" }),
    ).toBeVisible();

    await page.goto("/legal/cookies");
    await expect(
      page.getByRole("heading", { name: "Cookie Policy" }),
    ).toBeVisible();
  });

  test("404 page renders", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
