"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBoxGeometry } from "@react-three/drei";
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
  { id: "base", label: "Cloud", position: [0, -0.06, 0], shape: { kind: "box", size: [7.2, 0.12, 4.2] }, tint: "#fbfcfe", order: 0 },
  { id: "client-1", label: "Clients", position: [-2.8, 0.22, -0.9], shape: { kind: "box", size: [0.42, 0.28, 0.42] }, tint: "#e4ecf7", order: 1 },
  { id: "client-2", label: "Clients", position: [-2.8, 0.22, 0], shape: { kind: "box", size: [0.42, 0.28, 0.42] }, tint: "#e4ecf7", order: 1 },
  { id: "client-3", label: "Clients", position: [-2.8, 0.22, 0.9], shape: { kind: "box", size: [0.42, 0.28, 0.42] }, tint: "#e4ecf7", order: 1 },
  { id: "gateway", label: "Gateway", position: [-1.55, 0.5, 0], shape: { kind: "box", size: [0.18, 1.0, 2.4] }, tint: "#cfdcf0", order: 2 },
  { id: "service-1", label: "Services", position: [-0.2, 0.3, -0.9], shape: { kind: "box", size: [0.8, 0.44, 0.64] }, tint: "#c9d9ee", order: 3 },
  { id: "service-2", label: "Services", position: [-0.2, 0.3, 0], shape: { kind: "box", size: [0.8, 0.44, 0.64] }, tint: "#c9d9ee", order: 3 },
  { id: "service-3", label: "Services", position: [-0.2, 0.3, 0.9], shape: { kind: "box", size: [0.8, 0.44, 0.64] }, tint: "#c9d9ee", order: 3 },
  { id: "ai", label: "AI service", position: [1.1, 0.34, 0], shape: { kind: "box", size: [0.8, 0.52, 0.8] }, tint: "#1e4e9a", order: 4 },
  { id: "database", label: "Database", position: [2.45, 0.36, -0.85], shape: { kind: "cylinder", radius: 0.46, height: 0.56 }, tint: "#b4c9e6", order: 5 },
  { id: "storage", label: "Storage", position: [2.45, 0.36, 0.85], shape: { kind: "box", size: [0.8, 0.56, 0.8] }, tint: "#b4c9e6", order: 5 },
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
      <lineBasicMaterial color="#2b6fd6" transparent opacity={0.75} />
    </lineSegments>
  );
}

function Geometry({ shape, rounded }: { shape: Shape; rounded: boolean }) {
  if (shape.kind === "cylinder") return <cylinderGeometry args={[shape.radius, shape.radius, shape.height, 48]} />;
  if (rounded) return <RoundedBoxGeometry args={shape.size} radius={Math.min(0.035, shape.size[1] / 4)} smoothness={3} />;
  return <boxGeometry args={shape.size} />;
}

// The base carries a faint drawing grid, like the sheet a plan is drawn on.
function useGridTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fbfcfe";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(126, 160, 207, 0.45)";
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
function PlanOutline({ part, drawRef }: { part: Part; drawRef: { current: number } }) {
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
    mat.current.opacity = Math.min(1, d * 3) * 0.9;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry} position={part.position}>
      <lineDashedMaterial ref={mat} color={part.id === "ai" ? "#1e4e9a" : "#7ea0cf"} dashSize={0.001} gapSize={100} transparent opacity={0} />
    </lineSegments>
  );
}

function PartMesh({ part, index, progressRef }: { part: Part; index: number; progressRef: { current: number } }) {
  const mesh = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const from = useMemo(() => gatherOffset(part, index), [part, index]);
  const grid = useGridTexture();
  const isBase = part.id === "base";
  const isAi = part.id === "ai";

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
    if (mat.current) mat.current.opacity = Math.min(1, raw * 1.6);
    if (halo.current) {
      // The AI service breathes once it has landed.
      const breathe = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 1.6);
      halo.current.opacity = raw >= 1 ? 0.08 + breathe * 0.1 : 0;
    }
  });

  return (
    <group ref={mesh} position={part.position}>
      <mesh>
        <Geometry shape={part.shape} rounded={!isBase} />
        <meshStandardMaterial
          ref={mat}
          color={part.tint}
          map={isBase ? grid : null}
          emissive={isBase ? "#ffffff" : isAi ? "#2b6fd6" : "#000000"}
          emissiveIntensity={isBase ? 0.2 : isAi ? 0.35 : 0}
          roughness={isAi ? 0.3 : 0.45}
          metalness={0.02}
          transparent
          opacity={0}
        />
      </mesh>
      {isAi && (
        <mesh scale={[1.16, 1.2, 1.16]}>
          <RoundedBoxGeometry args={part.shape.kind === "box" ? part.shape.size : [0.8, 0.5, 0.8]} radius={0.06} smoothness={3} />
          <meshBasicMaterial ref={halo} color="#4f8ae0" transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
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
        <PlanOutline key={`plan-${part.id}`} part={part} drawRef={drawRefs[i]} />
      ))}
      {PARTS.map((part, i) => (
        <PartMesh key={part.id} part={part} index={i} progressRef={landRefs[i]} />
      ))}
      <Traffic running={running} />
    </group>
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
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        >
          <ambientLight intensity={1.15} />
          <directionalLight position={[5, 8, 4]} intensity={1.2} />
          <directionalLight position={[-6, 4, -5]} intensity={0.3} />
          <Scene animate={!reduced} onProgress={setLanded} />
          <ContactShadows position={[0, -0.4, 0]} opacity={0.16} scale={12} blur={3} far={1.2} />
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
