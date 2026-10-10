import type { CSSProperties } from "react";
import { LEGEND } from "./layout";

// The names under the scene, each with a chip in its part's colour. A name lights up
// when its part has landed. Kept free of three.js so the page can show it while the
// scene itself is still loading.
export function Legend({ landed }: { landed: number }) {
  return (
    <ol className="platform-labels" aria-hidden="true">
      {LEGEND.map((item) => (
        <li key={item.label} data-landed={item.order <= landed} style={{ "--chip": item.color } as CSSProperties}>
          {item.label}
        </li>
      ))}
    </ol>
  );
}
