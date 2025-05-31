import { test, expect } from "@playwright/test";

const host = "http://localhost:5173";

test("should upload an image and render the game", async ({ page }) => {
  await page.goto(host);

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("test-image.png");

  await expect(page.locator("canvas")).toBeVisible();
});

test("Reordering blocks within a rule shouldn't duplicate blocks.", async ({
  page,
}) => {
  await page.goto(host);

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("test-image.png");

  const firstRuleSide = page.locator(".rules-side").first();

  const firstRuleSquare = firstRuleSide.locator(".rule-square").first();
  const target = firstRuleSide.locator(".drop-zone").nth(3);

  await firstRuleSquare.dragTo(target);

  const squares = await firstRuleSide.locator(".rule-square").all();
  const blocks = await Promise.all(squares.map((t) => t.textContent()));

  expect(blocks).toEqual([">", " ", "#"]);
});
