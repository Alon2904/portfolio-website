"use client";

import dynamic from "next/dynamic";
import { Legend } from "./platform/Legend";

// The 3D scene loads after the page text is on screen. Until it does, the holder shows
// the same frame and the same row of names, so nothing below it moves when it arrives.
const Platform = dynamic(() => import("./Platform").then((m) => m.Platform), {
  ssr: false,
  loading: () => (
    <div className="platform-figure" aria-hidden="true">
      <div className="platform-canvas" />
      <Legend landed={0} />
    </div>
  ),
});

export function PlatformLoader() {
  return <Platform />;
}
