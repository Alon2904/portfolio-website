import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { hero } from "@/content/home";

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const serifPath = join(
  process.cwd(),
  "node_modules/@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-500-normal.woff",
);

// The social preview: name, the one-line statement, and the three panels of the diagram.
export default async function OpenGraphImage() {
  const serif = await readFile(serifPath);

  const panel = (label: string, boxes: string[]) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
        background: "#e9f0fa",
        border: "1px solid #c7d7ee",
        borderRadius: 8,
        width: 168,
      }}
    >
      <div style={{ fontSize: 14, color: "#1e4e9a", fontFamily: "sans" }}>{label}</div>
      {boxes.map((b) => (
        <div
          key={b}
          style={{
            fontSize: 16,
            color: "#16181d",
            background: "#fbfbfa",
            border: "1px solid #dcdad3",
            borderRadius: 4,
            padding: "6px 10px",
            fontFamily: "sans",
          }}
        >
          {b}
        </div>
      ))}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f6f5f1",
          padding: 64,
          fontFamily: "Plex Serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 470 }}>
          <div style={{ fontSize: 56, color: "#16181d", lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ fontSize: 27, color: "#16181d", marginTop: 22, lineHeight: 1.3 }}>
            {`${site.role}. ${hero.headline}`}
          </div>
          <div style={{ fontSize: 20, color: "#6b7079", marginTop: 28, fontFamily: "sans" }}>aloncohen.dev</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginLeft: 36 }}>
          {panel("Sources", ["Ticketing", "CRM", "App sign-in"])}
          {panel("Platform", ["Identity", "Warehouse", "AI layer"])}
          {panel("Client", ["Dashboards", "Campaigns", "Assistant"])}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Plex Serif", data: serif, weight: 500, style: "normal" }],
    },
  );
}
