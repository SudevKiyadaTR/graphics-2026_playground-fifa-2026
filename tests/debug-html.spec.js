import { test } from "@playwright/test";
import fs from "fs";

test("capture page HTML for debugging", async ({ page }) => {
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const html = await page.content();
  fs.writeFileSync("/tmp/page-content.html", html);
  console.log("Page HTML saved to /tmp/page-content.html");
  console.log("Page length:", html.length);

  const tables = html.match(/<table/g);
  console.log("Number of <table> tags found in HTML:", tables ? tables.length : 0);

  const h2s = html.match(/<h2[^>]*>.*?<\/h2>/g);
  console.log("H2 tags found:", h2s?.length || 0);
});
