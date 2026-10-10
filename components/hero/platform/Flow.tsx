import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NODES, VIEW, WIRES, buildRoutes, easeInOut, type Route } from "./layout";
import type { Signals, Timeline } from "./state";
import { glowTexture } from "./textures";

// The wiring is drawn on the sheet as part of the plan and stays once the system is
// built. Requests then travel along it as short streaks of light.

const WIRE = { y: 0.006, halfWidth: 0.013, piece: 0.1, node: 0.05 };

// Every wire is cut into short pieces, ordered from the clients to the data, so the
// wiring can be drawn in by showing more of the pieces.
function buildWiring() {
  const pieces: { key: number; corners: [number, number][] }[] = [];
  for (const { from, to } of WIRES) {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const count = Math.max(1, Math.round(length / WIRE.piece));
    const dx = (to[0] - from[0]) / length;
    const dz = (to[1] - from[1]) / length;
    const nx = -dz * WIRE.halfWidth;
    const nz = dx * WIRE.halfWidth;
    for (let i = 0; i < count; i++) {
      const a = [from[0] + (dx * length * i) / count, from[1] + (dz * length * i) / count];
      const b = [from[0] + (dx * length * (i + 1)) / count, from[1] + (dz * length * (i + 1)) / count];
      // a bus grows outward from the middle lane
      const key = Math.max(a[0], b[0]) + (Math.abs(dz) > 0.5 ? Math.abs((a[1] + b[1]) / 2) * 0.3 : 0);
      pieces.push({
        key,
        corners: [
          [a[0] + nx, a[1] + nz],
          [b[0] + nx, b[1] + nz],
          [b[0] - nx, b[1] - nz],
          [a[0] - nx, a[1] - nz],
        ],
      });
    }
  }
  for (const [x, z] of NODES) {
    pieces.push({
      key: x + WIRE.node,
      corners: [
        [x - WIRE.node, z],
        [x, z + WIRE.node],
        [x + WIRE.node, z],
        [x, z - WIRE.node],
      ],
    });
  }
  pieces.sort((p, q) => p.key - q.key);

  const positions = new Float32Array(pieces.length * 12);
  const index: number[] = [];
  pieces.forEach((piece, i) => {
    piece.corners.forEach(([x, z], c) => positions.set([x, WIRE.y, z], i * 12 + c * 3));
    const o = i * 4;
    index.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(index);
  return { geometry, pieces: pieces.length };
}

export function Wiring({ timeline }: { timeline: Timeline }) {
  const { geometry, pieces } = useMemo(() => buildWiring(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    geometry.setDrawRange(0, Math.floor(easeInOut(timeline.wiring) * pieces) * 6);
  });

  return (
    <mesh geometry={geometry} renderOrder={2} frustumCulled={false}>
      <meshBasicMaterial color="#8fb0e0" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

const PULSE = { count: 9, steps: 10, tail: 0.62, speed: 1.9, y: 0.014, headWidth: 0.03, tailWidth: 0.004 };
const HIDDEN = -100;

type Pulse = { route: Route; s: number; speed: number; wait: number; next: number };

// The requests in flight. Each is a ribbon laid along its route from where the request
// is to where it just was, bright at the head and fading to nothing at the tail, plus a
// soft point of light on the head. All of them share two geometries, rewritten per frame.
class PulseField {
  readonly tails = new THREE.BufferGeometry();
  readonly heads = new THREE.BufferGeometry();
  private readonly pulses: Pulse[];
  private readonly tailPositions: Float32Array;
  private readonly tailColors: Float32Array;
  private readonly headPositions: Float32Array;
  private readonly color = new THREE.Color("#ffb04a").multiplyScalar(2.6);
  private readonly point = { x: 0, z: 0, dx: 1, dz: 0 };

  constructor(
    private readonly routes: Route[],
    private readonly signals: Signals,
  ) {
    const perPulse = (PULSE.steps + 1) * 2;
    this.tailPositions = new Float32Array(PULSE.count * perPulse * 3);
    this.tailColors = new Float32Array(PULSE.count * perPulse * 3);
    this.headPositions = new Float32Array(PULSE.count * 3).fill(HIDDEN);
    const index: number[] = [];
    for (let p = 0; p < PULSE.count; p++) {
      for (let k = 0; k < PULSE.steps; k++) {
        const a = p * perPulse + k * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    this.tails.setIndex(index);
    this.tails.setAttribute("position", new THREE.BufferAttribute(this.tailPositions, 3));
    this.tails.setAttribute("color", new THREE.BufferAttribute(this.tailColors, 3));
    this.heads.setAttribute("position", new THREE.BufferAttribute(this.headPositions, 3));
    this.pulses = Array.from({ length: PULSE.count }, (_, i) => this.spawn(i * 0.42 + Math.random() * 0.4));
  }

  private spawn(wait: number): Pulse {
    const route = this.routes[Math.floor(Math.random() * this.routes.length)];
    return { route, s: 0, speed: PULSE.speed * (0.85 + Math.random() * 0.3), wait, next: 0 };
  }

  // The position and direction of travel at distance `s` along a route.
  private locate(route: Route, s: number) {
    const { points, cumulative } = route;
    let i = 0;
    while (i < points.length - 2 && s > cumulative[i + 1]) i++;
    const span = cumulative[i + 1] - cumulative[i];
    const f = Math.min(Math.max((s - cumulative[i]) / span, 0), 1);
    const [ax, az] = points[i];
    const [bx, bz] = points[i + 1];
    this.point.x = ax + (bx - ax) * f;
    this.point.z = az + (bz - az) * f;
    this.point.dx = (bx - ax) / span;
    this.point.dz = (bz - az) / span;
    return this.point;
  }

  update(delta: number, running: boolean) {
    const perPulse = (PULSE.steps + 1) * 2;
    for (let p = 0; p < PULSE.count; p++) {
      let pulse = this.pulses[p];
      if (running) {
        if (pulse.wait > 0) pulse.wait -= delta;
        else {
          pulse.s += pulse.speed * delta;
          while (pulse.next < pulse.route.stops.length && pulse.route.stops[pulse.next].at <= pulse.s) {
            this.signals.bump(pulse.route.stops[pulse.next].id);
            pulse.next++;
          }
          if (pulse.s > pulse.route.length + PULSE.tail) {
            pulse = this.pulses[p] = this.spawn(0.2 + Math.random() * 1.3);
          }
        }
      }
      const live = running && pulse.wait <= 0;
      for (let k = 0; k <= PULSE.steps; k++) {
        const f = k / PULSE.steps;
        const at = this.locate(pulse.route, Math.min(Math.max(pulse.s - PULSE.tail * f, 0), pulse.route.length));
        const half = PULSE.headWidth + (PULSE.tailWidth - PULSE.headWidth) * f;
        const o = (p * perPulse + k * 2) * 3;
        const y = live ? PULSE.y : HIDDEN;
        const pos = this.tailPositions;
        pos[o] = at.x - at.dz * half;
        pos[o + 1] = y;
        pos[o + 2] = at.z + at.dx * half;
        pos[o + 3] = at.x + at.dz * half;
        pos[o + 4] = y;
        pos[o + 5] = at.z - at.dx * half;
        const fade = live ? Math.pow(1 - f, 1.6) : 0;
        const col = this.tailColors;
        col[o] = col[o + 3] = this.color.r * fade;
        col[o + 1] = col[o + 4] = this.color.g * fade;
        col[o + 2] = col[o + 5] = this.color.b * fade;
      }
      const head = this.locate(pulse.route, Math.min(pulse.s, pulse.route.length));
      const shown = live && pulse.s <= pulse.route.length;
      this.headPositions[p * 3] = head.x;
      this.headPositions[p * 3 + 1] = shown ? PULSE.y + 0.01 : HIDDEN;
      this.headPositions[p * 3 + 2] = head.z;
    }
    this.tails.attributes.position.needsUpdate = true;
    this.tails.attributes.color.needsUpdate = true;
    this.heads.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.tails.dispose();
    this.heads.dispose();
  }
}

// A point's size is given at a distance of one unit with a 90 degree lens, so a glow that
// should measure `HEAD_GLOW` units on the sheet has to be scaled for the lens in use.
const HEAD_GLOW = 0.17;
const HEAD_SIZE = HEAD_GLOW / Math.tan(THREE.MathUtils.degToRad(VIEW.fov / 2));

export function Requests({ timeline, signals }: { timeline: Timeline; signals: Signals }) {
  const field = useMemo(() => new PulseField(buildRoutes(), signals), [signals]);
  const headColor = useMemo(() => new THREE.Color("#ffc878").multiplyScalar(2.2), []);
  const glow = useMemo(() => glowTexture(), []);
  useEffect(() => () => field.dispose(), [field]);

  useFrame((_, delta) => field.update(Math.min(delta, 0.1), timeline.running));

  return (
    <group>
      <mesh geometry={field.tails} renderOrder={4} frustumCulled={false}>
        <meshBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <points geometry={field.heads} renderOrder={5} frustumCulled={false}>
        <pointsMaterial map={glow} color={headColor} size={HEAD_SIZE} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}
