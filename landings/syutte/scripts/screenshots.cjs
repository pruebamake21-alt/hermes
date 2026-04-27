const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852 });

    await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/mobile_hero.png" });
    console.log("✓ mobile_hero");
  } catch(e) { console.log("✗ mobile_hero:", e.message); }

  try {
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 393, height: 852 });
    await page2.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500));
    await page2.evaluate(() => window.scrollTo(0, 800));
    await new Promise(r => setTimeout(r, 500));
    await page2.screenshot({ path: "public/screenshots/mobile_features.png" });
    console.log("✓ mobile_features");
  } catch(e) { console.log("✗ mobile_features:", e.message); }

  try {
    const page3 = await browser.newPage();
    await page3.setViewport({ width: 1920, height: 1080 });
    await page3.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    await page3.screenshot({ path: "public/screenshots/desktop_hero.png" });
    console.log("✓ desktop_hero");
  } catch(e) { console.log("✗ desktop_hero:", e.message); }

  try {
    const page4 = await browser.newPage();
    await page4.setViewport({ width: 1920, height: 1080 });
    await page4.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded", timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    await page4.screenshot({ path: "public/screenshots/desktop_dashboard.png" });
    console.log("✓ desktop_dashboard");
  } catch(e) { console.log("✗ desktop_dashboard:", e.message); }

  await browser.close();
  console.log("Done!");
})();
