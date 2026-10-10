"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBoxGeometry } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { N8AOPostPass } from "n8ao";
import * as THREE from "three";

// A cloud architecture built the way Alon builds one: the plan is drawn first as thin
// lines in space, the parts then gather in from around it and settle into their outlines
// one by one, and once the last part lands the system runs for as long as the page is
// open, with requests flowing from the clients through the gateway to the services and
// on to the AI service and the data.

type Shape = { kind: "box"; size: [number, number, number] } | { kind: "cylinder"; radius: number; height: number };

type Part = {
  id: string;
  label: string;
  position: [number, number, number];
  shape: Shape;
  tint: string;
  order: number; // assembly order
};

const PARTS: Part[] = [
  { id: "base", label: "Cloud", position: [0, -0.06, 0], shape: { kind: "box", size: [7.2, 0.12, 4.2] }, tint: "#2a3b52", order: 0 },
  { id: "client-1", label: "Clients", position: [-2.8, 0.22, -0.9], shape: { kind: "box", size: [0.42, 0.28, 0.42] }, tint: "#e4ecf7", order: 1 },
  { id: "client-2", label: "Clients", position: [-2.8, 0.22, 0], shape: { kind: "box", size: [0.42, 0.28, 0.42] }, tint: "#e4ecf7", order: 1 },
  { id: "client-3", label: "Clients", position: [-2.8, 0.22, 0.9], shape: { kind: "box", size: [0.42, 0.28, 0.42] }, tint: "#e4ecf7", order: 1 },
  { id: "gateway", label: "Gateway", position: [-1.55, 0.5, 0], shape: { kind: "box", size: [0.18, 1.0, 2.4] }, tint: "#7b5ce0", order: 2 },
  { id: "service-1", label: "Services", position: [-0.2, 0.3, -0.9], shape: { kind: "box", size: [0.8, 0.44, 0.64] }, tint: "#e07a2a", order: 3 },
  { id: "service-2", label: "Services", position: [-0.2, 0.3, 0], shape: { kind: "box", size: [0.8, 0.44, 0.64] }, tint: "#e07a2a", order: 3 },
  { id: "service-3", label: "Services", position: [-0.2, 0.3, 0.9], shape: { kind: "box", size: [0.8, 0.44, 0.64] }, tint: "#e07a2a", order: 3 },
  { id: "ai", label: "AI service", position: [1.1, 0.34, 0], shape: { kind: "box", size: [0.8, 0.52, 0.8] }, tint: "#14ad92", order: 4 },
  { id: "database", label: "Database", position: [2.45, 0.36, -0.85], shape: { kind: "cylinder", radius: 0.46, height: 0.56 }, tint: "#4157d0", order: 5 },
  { id: "storage", label: "Storage", position: [2.45, 0.36, 0.85], shape: { kind: "box", size: [0.8, 0.56, 0.8] }, tint: "#4c9a34", order: 5 },
];

const LABELS = ["Clients", "Gateway", "Services", "AI service", "Database", "Storage"];
const LABEL_ORDER: Record<string, number> = { Clients: 1, Gateway: 2, Services: 3, "AI service": 4, Database: 5, Storage: 5 };

// Timing, in seconds from the first frame.
const PLAN_SECONDS = 1.1; // each outline takes this long to draw
const PLAN_STAGGER = 0.18; // between assembly orders, for the drawing
const LAND_START = 1.6; // the first part starts to gather
const LAND_SECONDS = 1.1; // each part's travel time
const LAND_STAGGER = 0.45; // between assembly orders
const RUN_START = LAND_START + 5 * LAND_STAGGER + LAND_SECONDS + 0.3;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function clamp01(v: number) {
  return Math.min(Math.max(v, 0), 1);
}

// Request paths: a client, the gateway, a service, then the AI service, the database or storage.
const P = Object.fromEntries(PARTS.map((p) => [p.id, new THREE.Vector3(...p.position)])) as Record<string, THREE.Vector3>;
const CLIENTS = ["client-1", "client-2", "client-3"];
const SERVICES = ["service-1", "service-2", "service-3"];
const SINKS = ["ai", "database", "storage"];

function makePath(): THREE.Vector3[] {
  const c = P[CLIENTS[Math.floor(Math.random() * 3)]].clone().add(new THREE.Vector3(0.25, 0.1, 0));
  const g = P.gateway.clone().setZ(c.z * 0.6).add(new THREE.Vector3(0, 0.12, 0));
  const s = P[SERVICES[Math.floor(Math.random() * 3)]].clone().add(new THREE.Vector3(0, 0.32, 0));
  const k = P[SINKS[Math.floor(Math.random() * 3)]].clone().add(new THREE.Vector3(0, 0.38, 0));
  return [c, g, s, k];
}

function sample(path: THREE.Vector3[], t: number, out: THREE.Vector3) {
  const segs = path.length - 1;
  const tt = Math.min(Math.max(t, 0), segs - 0.0001);
  const seg = Math.floor(tt);
  const f = tt - seg;
  out.lerpVectors(path[seg], path[seg + 1], f);
  out.y += Math.sin(f * Math.PI) * 0.18; // a small arc between stops
  return out;
}

type Mover = { path: THREE.Vector3[]; t: number; speed: number };
const COUNT = 34;
const TRAIL = 0.1; // how far behind the head the streak's tail sits, in path units

// Requests as short streaks: a line from where each request is to where it just was.
function Traffic({ running }: { running: boolean }) {
  const lines = useRef<THREE.LineSegments>(null);
  const movers = useRef<Mover[] | null>(null);
  const positions = useMemo(() => new Float32Array(COUNT * 2 * 3), []);
  const head = useMemo(() => new THREE.Vector3(), []);
  const tail = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!lines.current) return;
    if (!movers.current) {
      movers.current = Array.from({ length: COUNT }, () => ({ path: makePath(), t: Math.random() * 3, speed: 0.55 + Math.random() * 0.35 }));
    }
    movers.current.forEach((m, i) => {
      if (running) m.t += delta * m.speed;
      if (m.t >= m.path.length - 1) {
        m.path = makePath();
        m.t = 0;
      }
      sample(m.path, m.t, head);
      sample(m.path, m.t - TRAIL, tail);
      const y = running ? 0 : -50;
      positions.set([head.x, head.y + y, head.z, tail.x, tail.y + y, tail.z], i * 6);
    });
    lines.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffc46b" transparent opacity={0.9} toneMapped={false} />
    </lineSegments>
  );
}

// The base carries a faint drawing grid, like the sheet a plan is drawn on.
function useGridTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#2a3b52";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(170, 196, 230, 0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i + 0.5, 0);
      ctx.lineTo(i + 0.5, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i + 0.5);
      ctx.lineTo(size, i + 0.5);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(7.2 / 1.2, 4.2 / 1.2);
    tex.anisotropy = 4;
    return tex;
  }, []);
}

// Where each part waits before it gathers: out in the space around the object, in the
// direction away from the centre, some a little above and some a little below, so the
// pieces converge from all sides. Deterministic per part.
function gatherOffset(part: Part, index: number): { pos: THREE.Vector3; rot: THREE.Euler } {
  const away = new THREE.Vector3(part.position[0], 0, part.position[2]);
  if (away.length() < 0.2) away.set(1, 0, 0.4);
  away.normalize();
  const wobble = Math.sin(index * 12.9898) * 0.5;
  const dist = 2.4 + Math.abs(wobble) * 1.4;
  const pos = new THREE.Vector3(away.x * dist, 0.6 + wobble * 1.6, away.z * dist);
  if (part.id === "base") pos.set(0, -2.2, 0);
  const rot = new THREE.Euler(wobble * 0.9, wobble * 1.4, -wobble * 0.7);
  return { pos, rot };
}

// The plan outline: the part's edges at its final place, drawn stroke by stroke.
function PlanOutline({ part, drawRef, landRef }: { part: Part; drawRef: { current: number }; landRef: { current: number } }) {
  const mat = useRef<THREE.LineDashedMaterial>(null);
  const geometry = useMemo(() => {
    const g =
      part.shape.kind === "box"
        ? new THREE.BoxGeometry(...part.shape.size)
        : new THREE.CylinderGeometry(part.shape.radius, part.shape.radius, part.shape.height, 48);
    const edges = new THREE.EdgesGeometry(g, 20);
    g.dispose();
    return edges;
  }, [part]);
  const lineRef = useRef<THREE.LineSegments>(null);

  useEffect(() => {
    lineRef.current?.computeLineDistances();
  }, [geometry]);

  useFrame(() => {
    if (!mat.current) return;
    // Each edge draws from its start: the dash grows until it covers the whole edge.
    const d = easeInOut(drawRef.current);
    mat.current.dashSize = 0.001 + 12 * d;
    // Drawn in as the plan, then gives way once the part has settled into it.
    const settled = clamp01((landRef.current - 0.85) / 0.15);
    mat.current.opacity = Math.min(1, d * 3) * 0.9 * (1 - settled);
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry} position={part.position}>
      <lineDashedMaterial ref={mat} color={part.id === "ai" ? "#01a88d" : "#9db8dc"} dashSize={0.001} gapSize={100} transparent opacity={0} />
    </lineSegments>
  );
}

// Forms. Each keeps the footprint of its plan outline but reads as the thing it is.
// Every form takes the part's materials so opacity and colour animate together.
type Mats = { main: THREE.MeshPhysicalMaterial; light: THREE.MeshPhysicalMaterial; dark: THREE.MeshPhysicalMaterial };

function Device({ size, mats }: { size: [number, number, number]; mats: Mats }) {
  const [w, h, d] = size;
  return (
    <group>
      {/* a slim base and a tilted screen, like a laptop seen from a distance */}
      <mesh material={mats.main} position={[0, -h / 2 + 0.03, 0]}>
        <RoundedBoxGeometry args={[w, 0.06, d]} radius={0.015} smoothness={2} />
      </mesh>
      <mesh material={mats.dark} position={[0, 0.02, -d / 2 + 0.03]} rotation={[-0.28, 0, 0]}>
        <RoundedBoxGeometry args={[w * 0.92, h * 0.95, 0.03]} radius={0.01} smoothness={2} />
      </mesh>
    </group>
  );
}

function GatewayPanel({ size, mats }: { size: [number, number, number]; mats: Mats }) {
  const [w, h, d] = size;
  const slots = 5;
  return (
    <group>
      <mesh material={mats.main}>
        <RoundedBoxGeometry args={[w, h, d]} radius={0.03} smoothness={3} />
      </mesh>
      {/* horizontal slots on the inbound face */}
      {Array.from({ length: slots }, (_, i) => (
        <mesh key={i} material={mats.dark} position={[-w / 2 - 0.004, h / 2 - 0.14 - i * ((h - 0.28) / (slots - 1)), 0]}>
          <boxGeometry args={[0.01, 0.035, d * 0.78]} />
        </mesh>
      ))}
    </group>
  );
}

function Server({ size, mats }: { size: [number, number, number]; mats: Mats }) {
  const [w, h, d] = size;
  const units = 3;
  return (
    <group>
      <mesh material={mats.main}>
        <RoundedBoxGeometry args={[w, h, d]} radius={0.03} smoothness={3} />
      </mesh>
      {/* rack units with a small light on each, on the face toward the camera */}
      {Array.from({ length: units }, (_, i) => {
        const y = h / 2 - 0.08 - i * ((h - 0.16) / (units - 1));
        return (
          <group key={i}>
            <mesh material={mats.dark} position={[0, y, d / 2 + 0.004]}>
              <boxGeometry args={[w * 0.8, 0.02, 0.01]} />
            </mesh>
            <mesh material={mats.light} position={[w * 0.34, y + 0.03, d / 2 + 0.006]}>
              <boxGeometry args={[0.05, 0.02, 0.01]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function AiCore({ size, mats, halo }: { size: [number, number, number]; mats: Mats; halo: React.RefObject<THREE.MeshBasicMaterial | null> }) {
  const [w, h, d] = size;
  const core = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (core.current) {
      core.current.rotation.y = clock.getElapsedTime() * 0.6;
      core.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.3;
    }
  });
  const bar = 0.05;
  const edges: [number, number, number][] = [];
  for (const x of [-1, 1]) for (const z of [-1, 1]) edges.push([x, 0, z]);
  return (
    <group>
      {/* an open frame: twelve bars */}
      {edges.map(([x, , z], i) => (
        <mesh key={`v${i}`} material={mats.main} position={[(x * (w - bar)) / 2, 0, (z * (d - bar)) / 2]}>
          <boxGeometry args={[bar, h, bar]} />
        </mesh>
      ))}
      {[-1, 1].map((y) =>
        [-1, 1].map((z) => (
          <mesh key={`x${y}${z}`} material={mats.main} position={[0, (y * (h - bar)) / 2, (z * (d - bar)) / 2]}>
            <boxGeometry args={[w, bar, bar]} />
          </mesh>
        )),
      )}
      {[-1, 1].map((y) =>
        [-1, 1].map((x) => (
          <mesh key={`z${y}${x}`} material={mats.main} position={[(x * (w - bar)) / 2, (y * (h - bar)) / 2, 0]}>
            <boxGeometry args={[bar, bar, d]} />
          </mesh>
        )),
      )}
      {/* the core turns inside the frame and glows */}
      <mesh ref={core} material={mats.light}>
        <octahedronGeometry args={[Math.min(w, h, d) * 0.34, 0]} />
      </mesh>
      <mesh scale={[1.18, 1.22, 1.18]}>
        <RoundedBoxGeometry args={[w, h, d]} radius={0.06} smoothness={3} />
        <meshBasicMaterial ref={halo} color="#2fd0b4" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Database({ radius, height, mats }: { radius: number; height: number; mats: Mats }) {
  const discs = 3;
  const gap = 0.05;
  const dh = (height - gap * (discs - 1)) / discs;
  return (
    <group>
      {Array.from({ length: discs }, (_, i) => (
        <mesh key={i} material={mats.main} position={[0, -height / 2 + dh / 2 + i * (dh + gap), 0]}>
          <cylinderGeometry args={[radius, radius, dh, 48]} />
        </mesh>
      ))}
      {/* a thinner core joins the discs */}
      <mesh material={mats.dark}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, height - 0.06, 48]} />
      </mesh>
    </group>
  );
}

function Storage({ size, mats }: { size: [number, number, number]; mats: Mats }) {
  const [w, h, d] = size;
  const n = 2;
  const gap = 0.05;
  const bw = (w - gap) / n;
  const bh = (h - gap) / n;
  const bd = (d - gap) / n;
  const bricks: [number, number, number][] = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) bricks.push([x, y, z]);
  return (
    <group>
      {bricks.map(([x, y, z]) => (
        <mesh
          key={`${x}${y}${z}`}
          material={mats.main}
          position={[-w / 2 + bw / 2 + x * (bw + gap), -h / 2 + bh / 2 + y * (bh + gap), -d / 2 + bd / 2 + z * (bd + gap)]}
        >
          <RoundedBoxGeometry args={[bw, bh, bd]} radius={0.025} smoothness={2} />
        </mesh>
      ))}
    </group>
  );
}

function Form({ part, mats, halo }: { part: Part; mats: Mats; halo: React.RefObject<THREE.MeshBasicMaterial | null> }) {
  const sh = part.shape;
  if (part.id === "base" && sh.kind === "box") {
    return (
      <mesh material={mats.main}>
        <boxGeometry args={sh.size} />
      </mesh>
    );
  }
  if (part.id.startsWith("client") && sh.kind === "box") return <Device size={sh.size} mats={mats} />;
  if (part.id === "gateway" && sh.kind === "box") return <GatewayPanel size={sh.size} mats={mats} />;
  if (part.id.startsWith("service") && sh.kind === "box") return <Server size={sh.size} mats={mats} />;
  if (part.id === "ai" && sh.kind === "box") return <AiCore size={sh.size} mats={mats} halo={halo} />;
  if (part.id === "database" && sh.kind === "cylinder") return <Database radius={sh.radius} height={sh.height} mats={mats} />;
  if (part.id === "storage" && sh.kind === "box") return <Storage size={sh.size} mats={mats} />;
  return null;
}

function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, clamp01(hsl.l + amount));
  return c;
}

function PartMesh({ part, index, progressRef }: { part: Part; index: number; progressRef: { current: number } }) {
  const mesh = useRef<THREE.Group>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const from = useMemo(() => gatherOffset(part, index), [part, index]);
  const grid = useGridTexture();
  const isBase = part.id === "base";
  const isAi = part.id === "ai";

  // Materials live in a ref so the frame loop may change their opacity.
  const matsRef = useRef<Mats | null>(null);
  if (matsRef.current === null) {
    const common = { transparent: true, opacity: 0, roughness: 0.42, metalness: 0.0, clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: 0.9 };
    const main = new THREE.MeshPhysicalMaterial({ ...common, color: part.tint, map: isBase ? grid : null });
    if (isBase) {
      main.roughness = 0.7;
      main.clearcoat = 0.15;
      main.envMapIntensity = 0.5;
      main.emissive = new THREE.Color("#2a3b52");
      main.emissiveIntensity = 0.5;
    }
    if (isAi) {
      main.emissive = new THREE.Color("#14ad92");
      main.emissiveIntensity = 0.25;
      main.roughness = 0.3;
    }
    const light = new THREE.MeshPhysicalMaterial({ ...common, color: shade(part.tint, 0.28), emissive: shade(part.tint, 0.2), emissiveIntensity: isAi ? 2.4 : 0.6 });
    if (isAi) light.toneMapped = false;
    const dark = new THREE.MeshPhysicalMaterial({ ...common, color: shade(part.tint, -0.16), clearcoat: 0 });
    matsRef.current = { main, light, dark };
  }
  // Three.js materials are imperative objects; the frame loop changes their opacity.
  // eslint-disable-next-line react-hooks/refs
  const mats = matsRef.current;

  useFrame(({ clock }) => {
    const raw = progressRef.current;
    const p = easeOutCubic(raw); // 0 = still out in space, 1 = landed
    if (mesh.current) {
      mesh.current.position.set(
        part.position[0] + from.pos.x * (1 - p),
        part.position[1] + from.pos.y * (1 - p),
        part.position[2] + from.pos.z * (1 - p),
      );
      mesh.current.rotation.set(from.rot.x * (1 - p), from.rot.y * (1 - p), from.rot.z * (1 - p));
      const sc = 0.9 + 0.1 * p;
      mesh.current.scale.set(sc, sc, sc);
    }
    const o = Math.min(1, raw * 1.6);
    mats.main.opacity = o;
    mats.light.opacity = o;
    mats.dark.opacity = o;
    if (halo.current) {
      const breathe = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 1.6);
      halo.current.opacity = raw >= 1 ? 0.08 + breathe * 0.1 : 0;
    }
  });

  return (
    <group ref={mesh} position={part.position}>
      <Form part={part} mats={mats} halo={halo} />
    </group>
  );
}

type SceneProps = { animate: boolean; onProgress: (landed: number) => void };

function Scene({ animate, onProgress }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const landRefs = useMemo(() => PARTS.map(() => ({ current: animate ? 0 : 1 })), [animate]);
  const drawRefs = useMemo(() => PARTS.map(() => ({ current: animate ? 0 : 1 })), [animate]);
  const [running, setRunning] = useState(!animate);
  const reported = useRef(-1);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (start.current === null) start.current = t;
    const e = t - start.current;

    let landed = 5;
    if (animate) {
      PARTS.forEach((part, i) => {
        drawRefs[i].current = clamp01((e - part.order * PLAN_STAGGER) / PLAN_SECONDS);
        landRefs[i].current = clamp01((e - (LAND_START + part.order * LAND_STAGGER)) / LAND_SECONDS);
      });
      landed = Math.max(0, ...PARTS.filter((_, i) => landRefs[i].current >= 1).map((p) => p.order));
      const run = e >= RUN_START;
      if (run !== running) setRunning(run);
    }
    if (reported.current !== landed) {
      reported.current = landed;
      onProgress(landed);
    }

    if (group.current) {
      const settle = animate ? clamp01((e - RUN_START + 1) / 2) : 1;
      group.current.rotation.y = -0.55 + t * 0.08 * settle;
      group.current.position.y = -0.25 + Math.sin(t * 0.5) * 0.04 * settle;
    }
  });

  return (
    <group ref={group} rotation={[0, -0.55, 0]} position={[0, -0.25, 0]}>
      {PARTS.map((part, i) => (
        <PlanOutline key={`plan-${part.id}`} part={part} drawRef={drawRefs[i]} landRef={landRefs[i]} />
      ))}
      {PARTS.map((part, i) => (
        <PartMesh key={part.id} part={part} index={i} progressRef={landRefs[i]} />
      ))}
      <Traffic running={running} />
      <ContactShadows position={[0, 0.002, 0]} opacity={0.55} scale={[7.1, 4.1]} blur={1.4} far={1.2} resolution={1024} color="#06101c" />
    </group>
  );
}

// A studio built from light panels rather than a downloaded HDR: a large soft top light,
// a cool fill from the back left, a warm key from the front right. The parts pick these
// up as reflections, which is most of what separates a render from a product shot.
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[9, 9, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#cfe0ff" position={[-7, 3, -5]} rotation={[0, Math.PI / 3, 0]} scale={[6, 4, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#fff2e2" position={[7, 2.5, 6]} rotation={[0, -Math.PI / 3.2, 0]} scale={[6, 3, 1]} />
      <Lightformer form="circle" intensity={0.6} color="#ffffff" position={[0, -4, 4]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
    </Environment>
  );
}

// Ambient occlusion for the crevices, bloom for the core and the traffic, SMAA for the edges.
function Effects() {
  const { scene, camera, size } = useThree();
  const ao = useMemo(() => {
    const pass = new N8AOPostPass(scene, camera, size.width, size.height);
    pass.configuration.aoRadius = 0.55;
    pass.configuration.intensity = 2.2;
    pass.configuration.distanceFalloff = 0.9;
    pass.configuration.screenSpaceRadius = false;
    pass.configuration.halfRes = true;
    return pass;
  }, [scene, camera, size.width, size.height]);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <primitive object={ao} />
      <Bloom luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.55} mipmapBlur radius={0.6} />
      <SMAA />
    </EffectComposer>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function Platform() {
  const reduced = usePrefersReducedMotion();
  const [landed, setLanded] = useState(0);
  const [visible, setVisible] = useState(true);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={holder} className="platform-figure" aria-label="A cloud architecture drawn as a plan, then built, then running">
      <div className="platform-canvas">
        <Canvas
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [7.6, 6.2, 8.6], fov: 26 }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 4]} intensity={1.0} />
          <Studio />
          <Scene animate={!reduced} onProgress={setLanded} />
          <Effects />
        </Canvas>
      </div>
      <ol className="platform-labels" aria-hidden="true">
        {LABELS.map((l) => (
          <li key={l} data-landed={reduced || LABEL_ORDER[l] <= landed}>
            {l}
          </li>
        ))}
      </ol>
    </figure>
  );
}
