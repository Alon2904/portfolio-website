"use client";

import dynamic from "next/dynamic";
import { Legend } from "./platform/Legend";
import { Placeholder } from "./platform/Placeholder";

// The live scene is only rendered in capture mode (see HeroVideo), so its code, the
// largest download on the site, is fetched only then. Until it can draw, the holder shows
// the same frame, a placeholder in it, and the same row of names.
const Platform = dynamic(() => import("./Platform").then((m) => m.Platform), {
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
