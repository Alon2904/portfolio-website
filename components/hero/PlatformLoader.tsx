"use client";

import dynamic from "next/dynamic";
import { Legend } from "./platform/Legend";
import { Placeholder } from "./platform/Placeholder";

// The scene's code (three.js and the rest, the largest download on the page) starts
// fetching as soon as this module runs, before React has hydrated anything, rather than
// when the loader below first renders. The loader then finds it already on its way.
const scene = import("./Platform");

// Until the scene can draw, the holder shows the same frame, a placeholder in it, and
// the same row of names, so nothing below it moves when the scene arrives.
const Platform = dynamic(() => scene.then((m) => m.Platform), {
  ssr: false,
  loading: () => (
    <div className="platform-figure" aria-hidden="true">
      <div className="platform-canvas">
        <Placeholder />
      </div>
      <Legend landed={0} />
    </div>
  ),
});

export function PlatformLoader() {
  return <Platform />;
}
