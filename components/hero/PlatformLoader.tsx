"use client";

import dynamic from "next/dynamic";

// The 3D scene loads after the page text is on screen; the holder keeps its space meanwhile.
const Platform = dynamic(() => import("./Platform").then((m) => m.Platform), {
  ssr: false,
  loading: () => <div className="platform-figure" aria-hidden="true" />,
});

export function PlatformLoader() {
  return <Platform />;
}
