import { chromium } from "playwright";

const port = process.argv[2] || 3000;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle", timeout: 15000 });
await page.waitForTimeout(3000);

// Viewport screenshot (what user sees without scrolling)
await page.screenshot({ path: "screenshots/test-viewport.png" });
console.log("✓ viewport");

// Scroll to pricing, take viewport screenshot
await page.evaluate(() => document.getElementById("pricing")?.scrollIntoView());
await page.waitForTimeout(2000);
await page.screenshot({ path: "screenshots/test-pricing-viewport.png" });
console.log("✓ pricing viewport");

// Scroll to features
await page.evaluate(() => document.getElementById("features")?.scrollIntoView());
await page.waitForTimeout(2000);
await page.screenshot({ path: "screenshots/test-features-viewport.png" });
console.log("✓ features viewport");

// Page height
const height = await page.evaluate(() => document.body.scrollHeight);
console.log("Page height:", height);

await browser.close();
