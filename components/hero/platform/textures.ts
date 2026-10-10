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
