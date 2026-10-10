import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOARD, clamp01, easeInOut, easeOutCubic, smoothstep, type Part } from "./layout";
import { Form } from "./forms";
import { PartMaterials, shade } from "./materials";
import { roundedRect, raise } from "./shapes";
import type { Signals, Timeline } from "./state";
import { glowTexture, gridTexture, shadowTexture } from "./textures";

type Staged = { part: Part; index: number; timeline: Timeline };

const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0];

// The plan outline: a part's edges at its final place on the sheet, each edge drawn from
// its start, then given up once the part has settled into it.
export function PlanOutline({ part, index, timeline }: Staged) {
  const mat = useRef<THREE.LineDashedMaterial>(null);
  const line = useRef<THREE.LineSegments>(null);
  const [w, h, d] = part.size;

  const { geometry, longest } = useMemo(() => {
    const solid = part.kind === "database" ? new THREE.CylinderGeometry(w / 2, w / 2, h, 48) : new THREE.BoxGeometry(w, h, d);
    const g: THREE.BufferGeometry = new THREE.EdgesGeometry(solid, 20);
    g.translate(0, h / 2, 0);
    solid.dispose();
    // Every edge measures from its own start, so all of them draw at once.
    const pos = g.attributes.position;
    const distances = new Float32Array(pos.count);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    let max = 0;
    for (let i = 0; i < pos.count; i += 2) {
      const length = a.fromBufferAttribute(pos, i).distanceTo(b.fromBufferAttribute(pos, i + 1));
      distances[i + 1] = length;
      max = Math.max(max, length);
    }
    g.setAttribute("lineDistance", new THREE.BufferAttribute(distances, 1));
    return { geometry: g, longest: max };
  }, [part.kind, w, h, d]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (!mat.current || !line.current) return;
    const drawn = easeInOut(timeline.draw[index]);
    const settled = smoothstep(0.8, 1, timeline.land[index]);
    const opacity = Math.min(1, drawn * 3) * 0.85 * (1 - settled);
    // An outline that has faded is taken out altogether, so it cannot hide what is behind it.
    line.current.visible = opacity > 0.004;
    mat.current.opacity = opacity;
    mat.current.dashSize = 0.001 + longest * drawn;
  });

  return (
    <lineSegments ref={line} geometry={geometry} position={[part.at[0], 0, part.at[1]]} rotation={[0, part.yaw ?? 0, 0]} visible={false}>
      <lineDashedMaterial ref={mat} color={part.kind === "ai" ? "#3fd9bf" : "#9db8dc"} dashSize={0.001} gapSize={longest * 4} transparent opacity={0} depthWrite={false} />
    </lineSegments>
  );
}

// The sheet: a rounded slab with the drawing grid lit into its surface. It is the first
// thing to arrive: it rises from beneath with its grid bright, and settles to a quiet
// navy for the plan to be drawn on.
export function Board({ index, timeline }: Omit<Staged, "part">) {
  const group = useRef<THREE.Group>(null);
  const cap = useRef<THREE.MeshPhysicalMaterial>(null);
  const grid = useMemo(() => gridTexture(), []);
  const geometry = useMemo(() => {
    const g = raise(roundedRect(BOARD.width, BOARD.depth, BOARD.radius), BOARD.thickness, 0.016);
    g.translate(0, -BOARD.thickness, 0);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (!group.current || !cap.current) return;
    const raw = timeline.land[index];
    const p = easeOutCubic(raw);
    group.current.visible = raw > 0;
    group.current.position.y = -1.3 * (1 - p);
    const s = 0.6 + 0.4 * p;
    group.current.scale.set(s, 1, s);
    const cooling = raw < 1 ? 1 - 0.5 * smoothstep(0.4, 1, raw) : 0.5 * clamp01(1 - timeline.since[index] / 0.9);
    cap.current.emissiveIntensity = 0.3 + cooling * 1.5;
  });

  return (
    <group ref={group} visible={!timeline.animate}>
      <mesh geometry={geometry}>
        {/* the top and bottom faces carry the grid; the edge is plain */}
        <meshPhysicalMaterial
          ref={cap}
          attach="material-0"
          color="#17212f"
          roughness={0.58}
          metalness={0.1}
          clearcoat={0.35}
          clearcoatRoughness={0.38}
          emissive="#86aee8"
          emissiveMap={grid}
          emissiveIntensity={0.3}
        />
        <meshStandardMaterial attach="material-1" color="#0f1722" roughness={0.5} metalness={0.15} />
      </mesh>
    </group>
  );
}

// The shadow the sheet throws on the page beneath it. It turns with the sheet but does
// not rise and fall with it, which is what makes the sheet read as hovering.
export function PageShadow({ index, timeline }: Omit<Staged, "part">) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const pad = 1.5;
  const width = BOARD.width * 0.86;
  const depth = BOARD.depth * 0.86;
  const map = useMemo(() => shadowTexture(width, depth, pad), [width, depth]);

  useFrame(() => {
    if (mat.current) mat.current.opacity = 0.2 * smoothstep(0.2, 1, timeline.land[index]);
  });

  return (
    <mesh rotation={FLAT} position={[0, -1.0, 0]} renderOrder={-1}>
      <planeGeometry args={[width + pad * 2, depth + pad * 2]} />
      <meshBasicMaterial ref={mat} map={map} color="#20324a" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// What ties a part to the sheet at its final place: a soft shadow that gathers as the
// part arrives, and a ring of light that runs a short way outward the moment it locks
// in (not for the gateway: a ring around a long wall is a stretched ellipse). The AI
// service also throws a pool of its own light, and lights its neighbours.
export function Grounding({ part, index, timeline, signals }: Staged & { signals: Signals }) {
  const shadow = useRef<THREE.MeshBasicMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const pool = useRef<THREE.MeshBasicMaterial>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const [w, h, d] = part.size;
  const pad = 0.3;
  const isAi = part.kind === "ai";
  const hasRing = part.kind !== "gateway";
  const round = part.kind === "database";
  const map = useMemo(() => shadowTexture(w, d, pad, round), [w, d, round]);
  const glow = useMemo(() => glowTexture(), []);
  const ringColor = useMemo(() => shade(part.tint, 0.18), [part.tint]);
  const strength = isAi ? 0.3 : 0.62;

  useFrame(() => {
    const raw = timeline.land[index];
    const since = timeline.since[index];
    if (shadow.current) shadow.current.opacity = strength * smoothstep(0.5, 1, raw);
    if (ring.current && ringMat.current) {
      const k = since / 0.75;
      const live = timeline.animate && k >= 0 && k < 1;
      ring.current.visible = live;
      if (live) {
        const grow = 0.2 + easeOutCubic(k) * 0.7;
        ring.current.scale.set(w + grow, d + grow, 1);
        ringMat.current.opacity = Math.pow(1 - k, 2) * 0.9;
      }
    }
    const lit = smoothstep(0.7, 1, raw) * (1 + signals.level(part.id) * 0.5);
    if (pool.current) pool.current.opacity = 0.42 * lit;
    if (lamp.current) lamp.current.intensity = 1.5 * lit;
  });

  return (
    <group position={[part.at[0], 0, part.at[1]]} rotation={[0, part.yaw ?? 0, 0]}>
      <mesh rotation={FLAT} position={[0, 0.003, 0]} renderOrder={1}>
        <planeGeometry args={[w + pad * 2, d + pad * 2]} />
        <meshBasicMaterial ref={shadow} map={map} color="#04080f" transparent opacity={0} depthWrite={false} />
      </mesh>
      {hasRing && (
        <mesh ref={ring} rotation={FLAT} position={[0, 0.01, 0]} renderOrder={3} visible={false}>
          <ringGeometry args={[0.47, 0.5, 64]} />
          <meshBasicMaterial ref={ringMat} color={ringColor} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      {isAi && (
        <>
          <mesh rotation={FLAT} position={[0, 0.008, 0]} renderOrder={3}>
            <planeGeometry args={[2.3, 2.3]} />
            <meshBasicMaterial ref={pool} map={glow} color="#2fe0c2" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight ref={lamp} color="#48f0d2" intensity={0} distance={2.6} decay={2} position={[0, h * 0.54, 0]} />
        </>
      )}
    </group>
  );
}

// Where each part forms before it gathers: in the space around the sheet, out from its
// place in the direction away from the centre, some higher and some lower, so the pieces
// converge from all sides. Deterministic per part.
function gatherOffset(part: Part, index: number) {
  const away = new THREE.Vector3(part.at[0], 0, part.at[1]);
  if (away.length() < 0.2) away.set(1, 0, 0.4);
  away.normalize();
  const wobble = Math.sin(index * 12.9898) * 0.5;
  const dist = 1.1 + Math.abs(wobble) * 1.2;
  return {
    pos: new THREE.Vector3(away.x * dist, 0.9 + wobble * 1.3, away.z * dist),
    rot: new THREE.Euler(wobble * 0.9, wobble * 1.4, -wobble * 0.7),
  };
}

// A part in flight. It forms out in space from almost nothing, as a shape of light in its
// own colour, grows as it gathers in, and cools into a solid in the half second after it
// locks into its outline.
export function PartMesh({ part, index, timeline, signals }: Staged & { signals: Signals }) {
  const group = useRef<THREE.Group>(null);
  const mats = useMemo(() => new PartMaterials(part.tint, part.kind), [part.tint, part.kind]);
  const from = useMemo(() => gatherOffset(part, index), [part, index]);
  useEffect(() => () => mats.dispose(), [mats]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const raw = timeline.land[index];
    const away = 1 - easeOutCubic(raw);
    g.visible = raw > 0;
    g.position.set(part.at[0] + from.pos.x * away, from.pos.y * away, part.at[1] + from.pos.z * away);
    g.rotation.set(from.rot.x * away, (part.yaw ?? 0) + from.rot.y * away, from.rot.z * away);
    g.scale.setScalar(0.04 + 0.96 * easeOutCubic(clamp01(raw / 0.6)));
    const energy = raw < 1 ? 1 - 0.55 * smoothstep(0.5, 1, raw) : 0.45 * clamp01(1 - timeline.since[index] / 0.6);
    mats.set(energy, signals.level(part.id));
  });

  return (
    <group ref={group} visible={!timeline.animate}>
      <Form part={part} mats={mats} signals={signals} />
    </group>
  );
}
