import * as THREE from "three";

// Small textures drawn at start-up rather than downloaded. Each is made once and shared.

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

let grid: THREE.CanvasTexture | null = null;

// The drawing grid on the sheet: one tile is one unit, with a heavier line on the unit
// and three lighter ones inside it. Used as the sheet's emissive map, so the lines carry
// their own light and stay crisp whatever the lighting does.
export function gridTexture() {
  if (grid) return grid;
  const size = 512;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);
  const line = (at: number, width: number, shade: number) => {
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(at - width / 2, 0, width, size);
    ctx.fillRect(0, at - width / 2, size, width);
  };
  for (const at of [128, 256, 384]) line(at, 3, 78);
  for (const at of [0, size]) line(at, 8, 150);
  grid = new THREE.CanvasTexture(canvas);
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping;
  grid.offset.set(0.5, 0.5);
  grid.colorSpace = THREE.SRGBColorSpace;
  grid.anisotropy = 8;
  return grid;
}

const shadows = new Map<string, THREE.CanvasTexture>();

// A soft shadow for a footprint of `width` by `depth`, with `pad` of falloff around it.
// White with alpha, so the material decides the colour.
export function shadowTexture(width: number, depth: number, pad: number, round = false) {
  const key = `${width}:${depth}:${pad}:${round}`;
  const cached = shadows.get(key);
  if (cached) return cached;
  const size = 96;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  const fullW = width + pad * 2;
  const fullD = depth + pad * 2;
  const corner = round ? width / 2 : Math.min(0.08, width / 2, depth / 2);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = Math.abs(((px + 0.5) / size - 0.5) * fullW);
      const z = Math.abs(((py + 0.5) / size - 0.5) * fullD);
      // distance outside a rounded rectangle of the footprint's size
      const qx = Math.max(x - (width / 2 - corner), 0);
      const qz = Math.max(z - (depth / 2 - corner), 0);
      const outside = Math.max(Math.hypot(qx, qz) - corner, 0);
      const a = Math.pow(1 - Math.min(outside / pad, 1), 2.2);
      const i = (py * size + px) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = 255;
      image.data[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  shadows.set(key, tex);
  return tex;
}

let glow: THREE.CanvasTexture | null = null;

// A round soft glow, for the head of a request and the pool of light under the AI service.
export function glowTexture() {
  if (glow) return glow;
  const size = 64;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1)");
  g.addColorStop(0.25, "rgba(255, 255, 255, 0.55)");
  g.addColorStop(0.6, "rgba(255, 255, 255, 0.12)");
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glow = new THREE.CanvasTexture(canvas);
  return glow;
}

// Surface detail is drawn as decals: textures with transparency laid a hair above a face,
// so the part keeps its own colour underneath and whatever is drawn bright can glow.
// Dark marks are drawn in near-black so only the lights carry emission.

const decals = new Map<string, THREE.CanvasTexture>();

function decal(key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const cached = decals.get(key);
  if (cached) return cached;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  decals.set(key, tex);
  return tex;
}

// A fixed pseudo-random sequence, so the pattern is the same on every load.
const noise = (i: number) => Math.abs(Math.sin(i * 12.9898 + 4.1337)) % 1;

const DARK = "rgba(8, 10, 18, 0.5)";
const EDGE = "rgba(255, 255, 255, 0.3)";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// A dark recess with a light edge, so it still reads on a face that is in shadow.
function recess(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.fillStyle = DARK;
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = EDGE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, r);
  ctx.stroke();
}

// What a screen shows: a terminal with a few commands and their output.
export function terminalTexture() {
  return decal("screen:terminal", 256, 160, (ctx) => {
    ctx.fillStyle = "#0b1426";
    ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = "#162340";
    ctx.fillRect(0, 0, 256, 16);
    ctx.fillStyle = "#4e6390";
    for (const x of [9, 19, 29]) {
      ctx.beginPath();
      ctx.arc(x, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // prompt lines are brighter and start with a mark; output lines are dimmer and indented
    const lines: [boolean, number][] = [[true, 0.5], [false, 0.7], [false, 0.4], [true, 0.62], [false, 0.55], [false, 0.3], [false, 0.66], [true, 0.36]];
    lines.forEach(([prompt, width], i) => {
      const y = 28 + i * 15;
      if (prompt) {
        ctx.fillStyle = "#3fd9bf";
        roundRect(ctx, 12, y, 8, 5, 2);
      }
      ctx.fillStyle = prompt ? "#cfe0ff" : "#5d7aa8";
      roundRect(ctx, prompt ? 26 : 26, y, 200 * width, 5, 2);
    });
    ctx.fillStyle = "#cfe0ff";
    ctx.fillRect(26, 28 + 8 * 15, 6, 8);
  });
}

// What a screen shows: a window with a title bar, a sidebar, text lines and a chart.
export function screenTexture(kind: "desktop" | "mobile") {
  const w = kind === "desktop" ? 256 : 128;
  const h = kind === "desktop" ? 160 : 256;
  return decal(`screen:${kind}`, w, h, (ctx) => {
    ctx.fillStyle = "#0f1b31";
    ctx.fillRect(0, 0, w, h);
    const bar = kind === "desktop" ? 16 : 24;
    ctx.fillStyle = "#1a2a48";
    ctx.fillRect(0, 0, w, bar);
    ctx.fillStyle = "#4e6390";
    if (kind === "desktop") {
      for (const x of [9, 19, 29]) {
        ctx.beginPath();
        ctx.arc(x, 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#16243f";
      ctx.fillRect(0, bar, 60, h - bar);
      ctx.fillStyle = "#35507f";
      for (let i = 0; i < 6; i++) roundRect(ctx, 10, bar + 12 + i * 16, 28 + noise(i) * 12, 4, 2);
    } else {
      roundRect(ctx, 12, 9, 40, 6, 3);
    }
    const x0 = kind === "desktop" ? 76 : 12;
    const colW = w - x0 - 12;
    ctx.fillStyle = "#8fb6ea";
    roundRect(ctx, x0, bar + 12, colW * 0.55, 7, 3);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? "#3c5784" : "#5b7bb0";
      roundRect(ctx, x0, bar + 30 + i * 12, colW * (0.5 + noise(i + 20) * 0.5), 4, 2);
    }
    // a bar chart, one bar in teal
    const chartY = bar + 84;
    const chartH = kind === "desktop" ? 48 : 92;
    const bars = kind === "desktop" ? 9 : 7;
    const bw = colW / bars;
    for (let i = 0; i < bars; i++) {
      const bh = chartH * (0.3 + noise(i + 40) * 0.7);
      ctx.fillStyle = i === bars - 2 ? "#3fd9bf" : "#78a9f2";
      roundRect(ctx, x0 + i * bw + 2, chartY + chartH - bh, bw - 4, bh, 2);
    }
    if (kind === "mobile") {
      ctx.fillStyle = "#1a2a48";
      ctx.fillRect(0, h - 28, w, 28);
      ctx.fillStyle = "#5b7bb0";
      for (const x of [24, 52, 80, 108]) roundRect(ctx, x - 6, h - 19, 12, 10, 3);
    }
  });
}

// A laptop's keyboard: a grid of keys with a wider space bar.
export function keysTexture() {
  return decal("keys", 256, 112, (ctx) => {
    ctx.fillStyle = "rgba(8, 10, 18, 0.72)";
    roundRect(ctx, 0, 0, 256, 112, 6);
    ctx.fillStyle = "rgba(235, 240, 250, 0.55)";
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      const cols = r === rows - 1 ? 0 : 15 - (r % 2);
      for (let c = 0; c < cols; c++) roundRect(ctx, 6 + c * 16.4 + (r % 2) * 8, 6 + r * 20, 13, 15, 2);
    }
    roundRect(ctx, 70, 86, 116, 15, 2);
    for (const x of [6, 22, 38, 54, 192, 208, 224, 240]) roundRect(ctx, x, 86, 13, 15, 2);
  });
}

// A server's long face: three drive bays, each with a grille, a handle and two lights.
export function serverFaceTexture() {
  return decal("server-face", 256, 128, (ctx) => {
    for (let bay = 0; bay < 3; bay++) {
      const y = 10 + bay * 38;
      recess(ctx, 10, y, 236, 30, 3);
      for (let x = 20; x < 170; x += 7) {
        ctx.fillStyle = "rgba(5, 6, 12, 0.6)";
        ctx.fillRect(x, y + 6, 3, 18);
        ctx.fillStyle = EDGE;
        ctx.fillRect(x + 3, y + 6, 1, 18);
      }
      ctx.fillStyle = EDGE;
      roundRect(ctx, 178, y + 9, 26, 12, 3);
      ctx.fillStyle = noise(bay + 7) > 0.35 ? "#c8ffd8" : "#ffd27a";
      roundRect(ctx, 214, y + 11, 8, 8, 4);
      ctx.fillStyle = "#c8ffd8";
      roundRect(ctx, 228, y + 11, 8, 8, 4);
    }
  });
}

// A server's short side: a vent grille, a handle plate and a status light.
export function serverSideTexture() {
  return decal("server-side", 192, 128, (ctx) => {
    recess(ctx, 10, 10, 136, 108, 3);
    for (let y = 20; y < 110; y += 10) {
      ctx.fillStyle = "rgba(5, 6, 12, 0.55)";
      roundRect(ctx, 18, y, 120, 4, 2);
      ctx.fillStyle = EDGE;
      roundRect(ctx, 18, y + 4, 120, 1, 0);
    }
    recess(ctx, 154, 14, 28, 44, 3);
    ctx.fillStyle = "#c8ffd8";
    roundRect(ctx, 164, 72, 8, 8, 4);
    ctx.fillStyle = "#ffd27a";
    roundRect(ctx, 164, 88, 8, 8, 4);
  });
}

// A storage brick's face: a cartridge with a label strip, a handle and a light.
export function storageFaceTexture() {
  return decal("storage-face", 128, 128, (ctx) => {
    recess(ctx, 10, 10, 108, 108, 5);
    ctx.fillStyle = "rgba(235, 245, 235, 0.55)";
    roundRect(ctx, 20, 22, 70, 12, 3);
    ctx.fillStyle = "rgba(5, 6, 12, 0.5)";
    roundRect(ctx, 24, 26, 40, 4, 2);
    recess(ctx, 20, 48, 88, 22, 4);
    ctx.fillStyle = EDGE;
    roundRect(ctx, 44, 55, 40, 8, 4);
    for (let y = 82; y < 110; y += 8) {
      ctx.fillStyle = "rgba(5, 6, 12, 0.5)";
      roundRect(ctx, 20, y, 60, 3, 1);
    }
    ctx.fillStyle = "#c8ffd8";
    roundRect(ctx, 96, 24, 9, 9, 4);
  });
}

// A gateway's long face: rows of ports, some lit, above a lit frame around each lane's
// portal. Drawn once and used on both faces, so the wall reads the same from either side.
export function gatewayFaceTexture(lanes: number[], length: number, height: number, portal: { width: number; height: number }) {
  const w = 768;
  const h = Math.round((w * height) / length);
  const px = w / length;
  return decal("gateway-face", w, h, (ctx) => {
    const portalTop = h - portal.height * px;
    // three banks of ports, each bank a row of larger sockets with a light in each
    const rows = 3;
    const rowH = (portalTop - 28) / rows;
    const cols = 24;
    const colW = (w - 24) / cols;
    for (let r = 0; r < rows; r++) {
      const y = 14 + r * rowH;
      ctx.fillStyle = "rgba(8, 10, 18, 0.32)";
      roundRect(ctx, 12, y, w - 24, rowH - 8, 4);
      for (let c = 0; c < cols; c++) {
        const x = 12 + c * colW;
        recess(ctx, x + 4, y + 5, colW - 8, rowH - 18, 3);
        const lit = noise(r * 97 + c * 13) > 0.55;
        ctx.fillStyle = lit ? (noise(r + c * 3) > 0.5 ? "#e9ddff" : "#c8ffd8") : "rgba(5, 6, 12, 0.5)";
        roundRect(ctx, x + colW / 2 - 5, y + rowH / 2 - 7, 10, 7, 3);
      }
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(12, portalTop - 6, w - 24, 2);
    for (const z of lanes) {
      const cx = (z / length + 0.5) * w;
      const pw = portal.width * px;
      ctx.strokeStyle = "#e9ddff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2 - 4, portalTop + 2, pw + 8, h - portalTop + 20, 6);
      ctx.stroke();
      ctx.fillStyle = "#e9ddff";
      roundRect(ctx, cx - 14, portalTop - 18, 28, 6, 3);
    }
  });
}
