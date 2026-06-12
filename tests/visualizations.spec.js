import { test, expect } from "@playwright/test";

test.describe("Visualization Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
  });

  test("heatmap section exists", async ({ page }) => {
    const heatmap = await page.locator("#goals-heatmap");
    await expect(heatmap).toBeTruthy();
    const content = await heatmap.locator("+ *").innerHTML();
    console.log("Heatmap next element:", content.slice(0, 100));
  });

  test("standings section has content", async ({ page }) => {
    const standing = await page.locator("#group-standings");
    await expect(standing).toBeTruthy();
    const html = await page.locator("table").first().innerHTML();
    console.log("Table HTML (first 200 chars):", html.slice(0, 200));
  });

  test("page shows at least one table", async ({ page }) => {
    const tables = await page.locator("table");
    const count = await tables.count();
    console.log("Number of tables:", count);
    expect(count).toBeGreaterThan(0);
  });

  test("check all h2 sections", async ({ page }) => {
    const headings = await page.locator("h2").allTextContents();
    console.log("All sections:", headings);
    headings.forEach((h) => {
      console.log(`- ${h}`);
    });
  });
});
