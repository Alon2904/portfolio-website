// The plan of the scene as plain data: where every part stands on the sheet, the lanes
// that connect them, the order they are built in, and how the finished system moves.
// Nothing in here touches three.js, so the numbers can be read and changed on their own.

export const BOARD = { width: 6.4, depth: 4.2, radius: 0.32, thickness: 0.16 } as const;

// Requests travel along three lanes (constant z) and switch lane on two buses (constant x).
const LANE = 1.12;
export const LANES = [-LANE, 0, LANE] as const;
export const COLUMN = { client: -2.55, gate: -1.5, bus1: -1.02, service: -0.2, ai: 1.02, bus2: 1.78, sink: 2.42 } as const;

export type PartKind = "board" | "laptop" | "phone" | "monitor" | "gateway" | "service" | "ai" | "database" | "storage";

export type Part = {
  id: string;
  label: string;
  kind: PartKind;
  at: [number, number]; // x and z of the footprint centre on the sheet
  size: [number, number, number]; // bounding width (x), height (y) and depth (z)
  tint: string;
  order: number; // assembly order
  yaw?: number; // how the part is turned on the sheet
};

// Category colours in the AWS manner, without any mark: networking purple, compute orange,
// machine learning teal, database blue, storage green. Clients stay neutral.
export const TINT = {
  board: "#18222f",
  client: "#e3eaf4",
  gateway: "#7d56f0",
  service: "#f0801f",
  ai: "#0fb59a",
  database: "#3857d2",
  storage: "#449c2b",
} as const;

export const PARTS: Part[] = [
  { id: "board", label: "Cloud", kind: "board", at: [0, 0], size: [BOARD.width, BOARD.thickness, BOARD.depth], tint: TINT.board, order: 0 },
  { id: "client-1", label: "Clients", kind: "laptop", at: [COLUMN.client, LANES[0]], size: [0.74, 0.5, 0.86], tint: TINT.client, order: 1, yaw: 0.6 },
  { id: "client-2", label: "Clients", kind: "phone", at: [COLUMN.client, LANES[1]], size: [0.36, 0.62, 0.6], tint: TINT.client, order: 1, yaw: 0.45 },
  { id: "client-3", label: "Clients", kind: "monitor", at: [COLUMN.client, LANES[2]], size: [0.8, 0.66, 0.7], tint: TINT.client, order: 1, yaw: 0.35 },
  { id: "gateway", label: "Gateway", kind: "gateway", at: [COLUMN.gate, 0], size: [0.26, 0.74, 3.24], tint: TINT.gateway, order: 2 },
  { id: "service-1", label: "Services", kind: "service", at: [COLUMN.service, LANES[0]], size: [0.92, 0.5, 0.7], tint: TINT.service, order: 3 },
  { id: "service-2", label: "Services", kind: "service", at: [COLUMN.service, LANES[1]], size: [0.92, 0.5, 0.7], tint: TINT.service, order: 3 },
  { id: "service-3", label: "Services", kind: "service", at: [COLUMN.service, LANES[2]], size: [0.92, 0.5, 0.7], tint: TINT.service, order: 3 },
  { id: "ai", label: "AI service", kind: "ai", at: [COLUMN.ai, 0], size: [0.86, 0.82, 0.86], tint: TINT.ai, order: 4 },
  { id: "database", label: "Database", kind: "database", at: [COLUMN.sink, LANES[0]], size: [1.0, 0.62, 1.0], tint: TINT.database, order: 5 },
  { id: "storage", label: "Storage", kind: "storage", at: [COLUMN.sink, LANES[2]], size: [0.86, 0.6, 0.86], tint: TINT.storage, order: 5 },
];

export const LAST_ORDER = 5;

// The opening in the gateway wall that each lane passes through.
export const GATEWAY_PORTAL = { width: 0.44, height: 0.3 } as const;

// The row of names under the scene. Each lights up when its part has landed.
export const LEGEND = [
  { label: "Clients", order: 1, color: TINT.client },
  { label: "Gateway", order: 2, color: TINT.gateway },
  { label: "Services", order: 3, color: TINT.service },
  { label: "AI service", order: 4, color: TINT.ai },
  { label: "Database", order: 5, color: TINT.database },
  { label: "Storage", order: 5, color: TINT.storage },
] as const;

// Timing, in seconds from the first frame. The sheet rises first, the plan is drawn on
// it, and then the parts gather in, one assembly order after another.
export const TIMING = {
  boardSeconds: 1.0, // the sheet's rise
  planStart: 0.55, // the first outline starts to draw
  planSeconds: 1.0, // each outline takes this long to draw
  planStagger: 0.16, // between assembly orders, for the drawing
  wiringStart: 0.7,
  wiringSeconds: 1.5, // the lanes draw from the clients to the data
  landStart: 2.0, // the first part starts to gather
  landSeconds: 1.15, // each part's travel time
  landStagger: 0.42, // between assembly orders
} as const;

export const RUN_START = TIMING.landStart + (LAST_ORDER - 1) * TIMING.landStagger + TIMING.landSeconds + 0.3;

// The camera: a long lens from above, so the sheet reads like an architectural drawing.
export const VIEW = {
  fov: 20,
  elevation: 0.6, // radians above the horizon
  targetY: 0.1, // the height the camera looks at, so the parts sit centred in the frame
  heroYaw: -0.5, // the sheet's angle at the moment the system starts running
  // The canvas is larger than the frame it sits in, by this share of the frame on every
  // side. The sheet is fitted to the frame; the margin is where parts form before they
  // gather and where glows and the page shadow fade out, so nothing ends at a hard edge.
  bleed: 0.2,
} as const;

// The running system repeats itself exactly every LOOP_SECONDS: one full turn of the
// sheet, and every other idle motion a whole number of cycles in that time. That is what
// lets one loop of it be rendered to a video that joins to itself. `cycle(k)` is the
// angular speed of a motion that completes k cycles per loop.
export const LOOP_SECONDS = 60;
export function cycle(k: number): number {
  return (2 * Math.PI * k) / LOOP_SECONDS;
}

// How the finished system moves, for as long as the page is open. `t` is the number of
// seconds since the system started running; it is negative while the parts assemble, so
// the same motion carries the sheet through the build and into the hero angle at t = 0.
//
// This one function is the feel of the piece: a constant slow turn, one revolution per
// loop, showing every side like a product on a turntable.
export function idleYaw(t: number): number {
  return VIEW.heroYaw + t * cycle(1);
}

// When the build is over and every transient has settled, so the loop can start here.
export const LOOP_START = RUN_START + 1.9;

// Routes. A request leaves a client, passes the gateway, may switch lane on the first
// bus, reaches a service, and ends at the AI service, the database or the storage.
export type Stop = { at: number; id: string };
export type Route = { points: [number, number][]; cumulative: number[]; length: number; stops: Stop[] };

const SINK_OF_LANE = ["database", null, "storage"] as const;

function makeRoute(points: [number, number][], visits: { x: number; z: number; id: string }[]): Route {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  const stops: Stop[] = [];
  for (const v of visits) {
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, az] = points[i];
      const [bx, bz] = points[i + 1];
      const onSegment =
        Math.abs(az - bz) < 1e-6 && Math.abs(v.z - az) < 1e-6 && v.x >= Math.min(ax, bx) - 1e-6 && v.x <= Math.max(ax, bx) + 1e-6;
      if (onSegment) {
        stops.push({ at: cumulative[i] + Math.abs(v.x - ax), id: v.id });
        break;
      }
    }
  }
  stops.sort((a, b) => a.at - b.at);
  return { points, cumulative, length: cumulative[cumulative.length - 1], stops };
}

export function buildRoutes(): Route[] {
  const routes: Route[] = [];
  for (let from = 0; from < 3; from++) {
    for (let lane = 0; lane < 3; lane++) {
      const start: [number, number][] = [
        [COLUMN.client, LANES[from]],
        [COLUMN.bus1, LANES[from]],
      ];
      if (lane !== from) start.push([COLUMN.bus1, LANES[lane]]);
      const visits = [
        { x: COLUMN.client, z: LANES[from], id: `client-${from + 1}` },
        { x: COLUMN.gate, z: LANES[from], id: "gateway" },
        { x: COLUMN.service, z: LANES[lane], id: `service-${lane + 1}` },
      ];
      const sink = SINK_OF_LANE[lane];
      if (sink) {
        routes.push(makeRoute([...start, [COLUMN.sink, LANES[lane]]], [...visits, { x: COLUMN.sink, z: LANES[lane], id: sink }]));
        continue;
      }
      // The middle lane ends at the AI service, or carries on from it to the data.
      const toAi = [...visits, { x: COLUMN.ai, z: 0, id: "ai" }];
      routes.push(makeRoute([...start, [COLUMN.ai, 0]], toAi));
      for (const end of [0, 2] as const) {
        routes.push(
          makeRoute(
            [...start, [COLUMN.bus2, 0], [COLUMN.bus2, LANES[end]], [COLUMN.sink, LANES[end]]],
            [...toAi, { x: COLUMN.sink, z: LANES[end], id: SINK_OF_LANE[end] }],
          ),
        );
      }
    }
  }
  return routes;
}

// The wiring drawn on the sheet: the three lanes and the two buses, with a node at each junction.
export const WIRES: { from: [number, number]; to: [number, number] }[] = [
  { from: [COLUMN.client, LANES[0]], to: [COLUMN.sink, LANES[0]] },
  { from: [COLUMN.client, LANES[1]], to: [COLUMN.bus2, LANES[1]] },
  { from: [COLUMN.client, LANES[2]], to: [COLUMN.sink, LANES[2]] },
  { from: [COLUMN.bus1, LANES[0]], to: [COLUMN.bus1, LANES[2]] },
  { from: [COLUMN.bus2, LANES[0]], to: [COLUMN.bus2, LANES[2]] },
];

export const NODES: [number, number][] = [COLUMN.bus1, COLUMN.bus2].flatMap((x) => LANES.map((z): [number, number] => [x, z]));

export function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}
export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
export function smoothstep(a: number, b: number, v: number) {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}
