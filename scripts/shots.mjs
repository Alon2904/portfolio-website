// Review screenshots at phone and desktop widths. Usage: node scripts/shots.mjs [baseUrl]
import { chromium } from "@playwright/test";
const base = process.argv[2] ?? "http://localhost:3000";
const out = "/tmp/v3-shots";
const browser = await chromium.launch();
for (const [name, width, height] of [["phone", 390, 844], ["desktop", 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-home-top.png` });
  await page.screenshot({ path: `${out}/${name}-home-full.png`, fullPage: true });
  await page.goto(base + "/work/honestqr", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${name}-work.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log("shots in", out);
