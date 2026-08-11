import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Try it free")).toBeVisible();
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
