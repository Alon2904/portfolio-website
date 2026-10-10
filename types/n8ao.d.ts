declare module "n8ao" {
  import type { Pass } from "postprocessing";
  import type { Camera, Color, Scene } from "three";
  export class N8AOPostPass extends Pass {
    constructor(scene: Scene, camera: Camera, width?: number, height?: number);
    configuration: {
      aoRadius: number;
      distanceFalloff: number;
      intensity: number;
      screenSpaceRadius: boolean;
      halfRes: boolean;
      aoSamples: number;
      denoiseSamples: number;
      denoiseRadius: number;
      color: Color;
    };
    setQualityMode(mode: "Performance" | "Low" | "Medium" | "High" | "Ultra"): void;
  }
}
