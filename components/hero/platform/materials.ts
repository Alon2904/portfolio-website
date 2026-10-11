import * as THREE from "three";
import { GATEWAY_PORTAL, LANES, type Part, type PartKind } from "./layout";
import { gatewayFaceTexture, keysTexture, screenTexture, serverFaceTexture, serverSideTexture, storageFaceTexture, terminalTexture } from "./textures";

export function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(Math.max(hsl.l + amount, 0), 1));
  return c;
}

// The surface detail each kind of part carries, by name, so a form can ask for it.
function decalTextures(part: Part): Record<string, THREE.Texture> {
  const [, h, l] = part.size;
  switch (part.kind) {
    case "gateway":
      return { face: gatewayFaceTexture([...LANES], l, h, GATEWAY_PORTAL) };
    case "service":
      return { front: serverFaceTexture(), side: serverSideTexture() };
    case "laptop":
      return { keys: keysTexture() };
    case "storage":
      return { brick: storageFaceTexture() };
    default:
      return {};
  }
}

function isClient(kind: PartKind) {
  return kind === "laptop" || kind === "phone" || kind === "monitor";
}

// The finishes every part is built from: the body, a paler face, a dark recess, a lit
// accent (the screen, on a client) and its decals. They are opaque from the first
// frame. A part does not fade in: it arrives glowing in its own colour and cools into a
// solid as it locks into place, which is what `energy` drives. `activity` is the flash
// when a request reaches the part.
export class PartMaterials {
  readonly main: THREE.MeshPhysicalMaterial;
  readonly pale: THREE.MeshPhysicalMaterial;
  readonly dark: THREE.MeshStandardMaterial;
  readonly light: THREE.MeshStandardMaterial;
  private readonly decals: Record<string, THREE.MeshStandardMaterial> = {};
  private readonly lightBase: number;
  private readonly lightBoost: number;

  constructor(part: Part) {
    const { tint, kind } = part;
    const glow = shade(tint, 0.06);
    const body = { roughness: 0.44, metalness: 0.04, clearcoat: 0.4, clearcoatRoughness: 0.32, envMapIntensity: 1, emissive: glow, emissiveIntensity: 0 };
    this.main = new THREE.MeshPhysicalMaterial({ ...body, color: tint });
    this.pale = new THREE.MeshPhysicalMaterial({ ...body, color: shade(tint, 0.08) });
    this.dark = new THREE.MeshStandardMaterial({ color: shade(tint, -0.2), roughness: 0.62, metalness: 0.05, emissive: glow, emissiveIntensity: 0 });

    if (isClient(kind)) {
      // The accent is the screen. Each device shows something of its own: a terminal on
      // the laptop, a dashboard on the monitor, an app on the phone.
      const screen = kind === "laptop" ? terminalTexture() : screenTexture(kind === "phone" ? "mobile" : "desktop");
      this.dark.color.set("#1c2535");
      this.light = new THREE.MeshStandardMaterial({ color: "#ffffff", map: screen, emissive: "#ffffff", emissiveMap: screen, emissiveIntensity: 0, roughness: 0.2 });
      this.lightBase = 0.9;
      this.lightBoost = 1.2;
    } else {
      this.light = new THREE.MeshStandardMaterial({ color: shade(tint, 0.26), roughness: 0.3, emissive: shade(tint, 0.2), emissiveIntensity: 0 });
      this.lightBase = kind === "ai" ? 1.7 : 0.9;
      this.lightBoost = kind === "ai" ? 1.6 : 2.6;
    }

    for (const [name, map] of Object.entries(decalTextures(part))) {
      this.decals[name] = new THREE.MeshStandardMaterial({
        map,
        transparent: true,
        alphaTest: 0.02, // empty parts of a decal leave no mark in the depth buffer
        emissive: "#ffffff",
        emissiveMap: map,
        emissiveIntensity: 0,
        roughness: 0.5,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
    }
  }

  decal(name: string) {
    const m = this.decals[name];
    if (!m) throw new Error(`no decal "${name}" on this part`);
    return m;
  }

  set(energy: number, activity: number) {
    this.main.emissiveIntensity = energy * 1.5;
    this.pale.emissiveIntensity = energy * 1.5;
    this.dark.emissiveIntensity = energy * 1.1;
    this.light.emissiveIntensity = this.lightBase + energy * 2 + activity * this.lightBoost;
    for (const m of Object.values(this.decals)) m.emissiveIntensity = 0.6 + energy * 1.5 + activity * 1.6;
  }

  dispose() {
    this.main.dispose();
    this.pale.dispose();
    this.dark.dispose();
    this.light.dispose();
    for (const m of Object.values(this.decals)) m.dispose();
  }
}
