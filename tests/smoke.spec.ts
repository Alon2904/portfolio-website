import { test, expect } from "@playwright/test";
import { caseStudies } from "../content/work";
import { site } from "../content/site";

test("home shows the name, the role and the diagram", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: site.name })).toBeVisible();
  await expect(page.getByText(`${site.role}. I build data platforms`)).toBeVisible();
  await expect(page.locator(".platform-figure").first()).toBeVisible();
});

test("every work page renders its title", async ({ page }) => {
  for (const c of caseStudies) {
    await page.goto(`/work/${c.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: c.title })).toBeVisible();
  }
});

test("an unknown work page is a 404", async ({ page }) => {
  const res = await page.goto("/work/nothing-here");
  expect(res?.status()).toBe(404);
});

test("the contact form has the fields Netlify expects", async ({ page }) => {
  await page.goto("/#contact");
  const form = page.getByTestId("contact-form");
  await expect(form.locator('input[name="name"]')).toBeVisible();
  await expect(form.locator('input[name="email"]')).toBeVisible();
  await expect(form.locator('textarea[name="message"]')).toBeVisible();
  await expect(form.locator('input[name="form-name"]')).toHaveValue("contact");
});
