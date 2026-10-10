// Capture the hero at several moments after load, to review the assembly.
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
for (const ms of [300, 1200, 2400, 4500, 8000]) {
  await page.waitForTimeout(ms === 300 ? 300 : ms - (ms === 1200 ? 300 : ms === 2400 ? 1200 : ms === 4500 ? 2400 : 4500));
  await page.screenshot({ path: `/tmp/v3-shots/hero-${ms}.png`, clip: { x: 640, y: 120, width: 760, height: 560 } });
}
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.waitForTimeout(500);
console.log("frames done; console errors:", errors.length);
await browser.close();
