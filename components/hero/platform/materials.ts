import * as THREE from "three";
import type { PartKind } from "./layout";

export function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(Math.max(hsl.l + amount, 0), 1));
  return c;
}

// The four finishes every part is built from: the body, a paler face, a dark recess and
// a lit accent. They are opaque from the first frame. A part does not fade in: it arrives
// glowing in its own colour and cools into a solid as it locks into place, which is what
// `energy` drives. `activity` is the flash when a request reaches the part.
export class PartMaterials {
  readonly main: THREE.MeshPhysicalMaterial;
  readonly pale: THREE.MeshPhysicalMaterial;
  readonly dark: THREE.MeshStandardMaterial;
  readonly light: THREE.MeshStandardMaterial;
  private readonly lightBase: number;
  private readonly lightBoost: number;

  constructor(tint: string, kind: PartKind) {
    const glow = shade(tint, 0.06);
    const body = { roughness: 0.44, metalness: 0.04, clearcoat: 0.4, clearcoatRoughness: 0.32, envMapIntensity: 1, emissive: glow, emissiveIntensity: 0 };
    this.main = new THREE.MeshPhysicalMaterial({ ...body, color: tint });
    this.pale = new THREE.MeshPhysicalMaterial({ ...body, color: shade(tint, 0.08) });
    this.dark = new THREE.MeshStandardMaterial({ color: shade(tint, -0.2), roughness: 0.62, metalness: 0.05, emissive: glow, emissiveIntensity: 0 });

    const isClient = kind === "laptop" || kind === "phone" || kind === "monitor";
    if (isClient) {
      // The accent is the screen: dark glass with its own cool light.
      this.dark.color.set("#27344a");
      this.light = new THREE.MeshStandardMaterial({ color: "#0e1828", roughness: 0.22, emissive: "#9cc4ff", emissiveIntensity: 0 });
      this.lightBase = 0.8;
      this.lightBoost = 1.6;
    } else {
      this.light = new THREE.MeshStandardMaterial({ color: shade(tint, 0.26), roughness: 0.3, emissive: shade(tint, 0.2), emissiveIntensity: 0 });
      this.lightBase = kind === "ai" ? 1.7 : 0.9;
      this.lightBoost = kind === "ai" ? 1.6 : 2.6;
    }
  }

  set(energy: number, activity: number) {
    this.main.emissiveIntensity = energy * 1.5;
    this.pale.emissiveIntensity = energy * 1.5;
    this.dark.emissiveIntensity = energy * 1.1;
    this.light.emissiveIntensity = this.lightBase + energy * 2 + activity * this.lightBoost;
  }

  dispose() {
    this.main.dispose();
    this.pale.dispose();
    this.dark.dispose();
    this.light.dispose();
  }
}
