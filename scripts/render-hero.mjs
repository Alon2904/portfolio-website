// Renders the hero scene to video. Usage: node scripts/render-hero.mjs [baseUrl] [--encode-only]
// With --encode-only the frames already in /tmp/hero-frames are encoded again (to try
// another size or quality) without capturing.
//
// Opens the page in capture mode, where the scene's frame loop is manual, steps it one
// video frame at a time and screenshots the canvas, then encodes:
//   public/hero/intro.mp4         the build, from the first frame to LOOP_START
//   public/hero/loop.mp4          one full turn from LOOP_START, which joins to itself:
//                                 the first 1.5 s are cross-faded with the frames that
//                                 follow the loop's end, so the requests in flight (the one
//                                 thing that is not periodic) blend instead of jumping
//   public/hero/intro-sm.mp4,     the same two clips at 720 wide, for phones
//   public/hero/loop-sm.mp4
//   public/hero/still.jpg         the built platform, for reduced motion and as the
//                                 stand-in when the video will not play
// Needs ffmpeg on the PATH and a dev or production server at baseUrl.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LOOP_SECONDS, LOOP_START } from "../components/hero/platform/layout.ts";

const encodeOnly = process.argv.includes("--encode-only");
const base = process.argv.find((a, i) => i >= 2 && !a.startsWith("--")) ?? "http://localhost:3000";
const FPS = 30;
const FADE = 1.5; // seconds of cross-fade at the loop seam
// Output size and quality. The canvas is captured at retina density (about 1640 wide) and
// scaled down; 1280 wide shows at about 1.5 device pixels per CSS pixel in the hero and
// keeps the 60 s loop under 4 MB as H.264. (VP9 was tried and came out larger for this
// material at matching quality, so only H.264 is written.)
const WIDTH = 1280;
const HEIGHT = 960;
// Phones show the hero under 400 CSS pixels wide, so 720 wide keeps about the same
// density there at under half the bytes.
const SMALL_WIDTH = 720;
const SMALL_HEIGHT = 540;
const out = "public/hero";
const frames = "/tmp/hero-frames";

const introFrames = Math.round(LOOP_START * FPS);
const loopFrames = Math.round(LOOP_SECONDS * FPS);
const fadeFrames = Math.round(FADE * FPS);
const total = introFrames + loopFrames + fadeFrames;

if (!encodeOnly) {
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
}
mkdirSync(out, { recursive: true });

if (!encodeOnly) {
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${base}/?capture=1`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => typeof window.__heroStep === "function", null, { timeout: 60000 });
await page.evaluate(() => document.querySelector(".platform-figure").scrollIntoView({ block: "center" }));
// Only the scene over the page colour: the canvas reaches past its frame, so anything
// else near it (the heading, the legend) would otherwise be in the picture.
await page.addStyleTag({
  content: "body * { visibility: hidden !important; } .platform-canvas, .platform-canvas > div:not(.platform-placeholder), .platform-canvas canvas { visibility: visible !important; } .platform-placeholder { display: none !important; }",
});
const canvas = await page.$(".platform-canvas > div:not(.platform-placeholder)");

// A few warm-up frames at time zero, so shader compilation is not part of frame one.
for (let i = 0; i < 3; i++) await page.evaluate(() => window.__heroStep(0));

const started = Date.now();
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.__heroStep(t), i / FPS);
  const png = await canvas.screenshot({ type: "png" });
  writeFileSync(join(frames, `${String(i).padStart(5, "0")}.png`), png);
  if (i % 300 === 0) console.log(`frame ${i}/${total}, ${Math.round((Date.now() - started) / 1000)}s`);
}
await browser.close();
console.log(`captured ${total} frames in ${Math.round((Date.now() - started) / 1000)}s`);
}

const scaleTo = (w, h) => `scale=${w}:${h}:flags=lanczos:out_color_matrix=bt709`;
const scale = scaleTo(WIDTH, HEIGHT);
const smallScale = scaleTo(SMALL_WIDTH, SMALL_HEIGHT);
const colour = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"];
const h264 = ["-c:v", "libx264", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", ...colour];

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

const input = (start, count) => ["-framerate", String(FPS), "-start_number", String(start), "-i", join(frames, "%05d.png"), "-frames:v", String(count)];

// intro: frames [0, introFrames)
for (const [vf, name] of [[scale, "intro.mp4"], [smallScale, "intro-sm.mp4"]]) {
  ffmpeg([...input(0, introFrames), "-vf", vf, ...h264, join(out, name)]);
}

// loop: the continuation frames cross-fade into the loop's own first frames, then the
// loop runs on. Output length is exactly LOOP_SECONDS.
const loopStart = introFrames;
const tailStart = introFrames + loopFrames;
for (const [vf, name] of [[scale, "loop.mp4"], [smallScale, "loop-sm.mp4"]]) {
  ffmpeg([
    "-framerate", String(FPS), "-start_number", String(tailStart), "-i", join(frames, "%05d.png"),
    "-framerate", String(FPS), "-start_number", String(loopStart), "-i", join(frames, "%05d.png"),
    "-filter_complex",
    `[0:v]trim=end_frame=${fadeFrames},setpts=PTS-STARTPTS[tail];[1:v]trim=end_frame=${loopFrames},setpts=PTS-STARTPTS[loop];[tail][loop]xfade=transition=fade:duration=${FADE}:offset=0,${vf}[v]`,
    "-map", "[v]", ...h264, join(out, name),
  ]);
}

// still: the first loop frame
ffmpeg(["-i", join(frames, `${String(loopStart).padStart(5, "0")}.png`), "-vf", scale, "-q:v", "3", join(out, "still.jpg")]);

console.log("written to", out);
