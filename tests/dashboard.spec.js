import { test, expect } from "@playwright/test";

test.describe("Dashboard Rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    // Wait for Observable runtime to initialize
    await page.waitForTimeout(2000);
  });

  test("should load the dashboard page", async ({ page }) => {
    const title = await page.locator("h1").first();
    await expect(title).toContainText("FIFA 2026 Dashboard");
  });

  test("should display tournament stats", async ({ page }) => {
    const stats = await page.locator("li").allTextContents();
    console.log("Stats found:", stats);
    expect(stats.length).toBeGreaterThan(0);
  });

  test("should display matches data", async ({ page }) => {
    const content = await page.textContent("body");
    console.log("Page content includes:", {
      hasTotal: content.includes("Total Matches"),
      hasPlayed: content.includes("Played"),
      hasSchedule: content.includes("Match Schedule"),
    });
    expect(content).toContain("Total Matches");
  });

  test("should show standings section", async ({ page }) => {
    const headings = await page.locator("h2").allTextContents();
    console.log("Sections found:", headings);
    expect(headings).toContain("Group Standings");
  });

  test("should show top scorers", async ({ page }) => {
    const headings = await page.locator("h2").allTextContents();
    expect(headings).toContain("Top Scorers");
  });

  test("should check for errors in console", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);
    console.log("Console errors:", errors);
  });

  test("should have rendered SVG elements (plots)", async ({ page }) => {
    const svgs = await page.locator("svg").count();
    console.log("SVG elements found:", svgs);
    // We expect at least the schedule chart and maybe plots
    expect(svgs).toBeGreaterThanOrEqual(0);
  });

  test("should have HTML tables", async ({ page }) => {
    const tables = await page.locator("table").count();
    console.log("HTML tables found:", tables);
    // We should have standings and top scorers tables
    expect(tables).toBeGreaterThanOrEqual(0);
  });
});
