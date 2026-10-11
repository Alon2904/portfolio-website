"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, FXAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { Requests, Wiring } from "./platform/Flow";
import { Legend } from "./platform/Legend";
import { Placeholder } from "./platform/Placeholder";
import { BOARD, LAST_ORDER, PARTS, VIEW, idleYaw, smoothstep } from "./platform/layout";
import { Board, Grounding, PageShadow, PartMesh, PlanOutline } from "./platform/Stage";
import { Signals, Timeline } from "./platform/state";

// A cloud architecture built the way Alon builds one: a sheet arrives and the plan is
// drawn on it as thin lines, wiring included; the parts then gather in from around it as
// shapes of light and cool into solids as they lock into their outlines; and once the last part
// lands the system runs for as long as the page is open, with requests travelling the
// wiring from the clients through the gateway to the services and on to the AI service
// and the data.

const BOARD_INDEX = PARTS.findIndex((p) => p.kind === "board");

type SceneProps = { animate: boolean; go: { current: boolean }; onProgress: (landed: number) => void };

const Scene = memo(function Scene({ animate, go, onProgress }: SceneProps) {
  const rotator = useRef<THREE.Group>(null);
  const floater = useRef<THREE.Group>(null);
  const timeline = useMemo(() => new Timeline(animate), [animate]);
  const signals = useMemo(() => new Signals(), []);
  const elapsed = useRef(0);
  const reported = useRef(-1);

  // Runs ahead of every other frame callback, so each part reads this frame's numbers.
  // Time is counted here rather than read from the clock: the clock restarts whenever the
  // scene is paused off screen, and the build must only ever play once.
  useFrame((_, delta) => {
    // The build waits for the go: the scene draws a few frames first, out of sight, so
    // the shaders are compiled and the first second of the build is not lost to them.
    if (go.current) elapsed.current += Math.min(delta, 0.1);
    timeline.update(elapsed.current);
    signals.decay(delta);
    if (reported.current !== timeline.landed) {
      reported.current = timeline.landed;
      onProgress(timeline.landed);
    }
    if (rotator.current) rotator.current.rotation.y = animate ? idleYaw(timeline.run) : VIEW.heroYaw;
    if (floater.current) floater.current.position.y = animate ? Math.sin(elapsed.current * 0.55) * 0.045 * smoothstep(-1.5, 1, timeline.run) : 0;
  }, -1);

  return (
    <group ref={rotator} rotation={[0, VIEW.heroYaw, 0]}>
      <PageShadow index={BOARD_INDEX} timeline={timeline} />
      <group ref={floater}>
        <Board index={BOARD_INDEX} timeline={timeline} />
        {PARTS.map((part, i) =>
          part.kind === "board" ? null : (
            <group key={part.id}>
              <PlanOutline part={part} index={i} timeline={timeline} />
              <Grounding part={part} index={i} timeline={timeline} signals={signals} />
              <PartMesh part={part} index={i} timeline={timeline} signals={signals} />
            </group>
          ),
        )}
        <Wiring timeline={timeline} />
        <Requests timeline={timeline} signals={signals} />
      </group>
    </group>
  );
});

// The sheet turns, so the frame is fitted to the circle its corners sweep: the sheet
// fills the frame at its widest and is never cut off, at any angle or any width. The
// canvas itself reaches past the frame on every side (VIEW.bleed), so the fit is scaled
// up by the same share.
const SWEEP = Math.hypot(BOARD.width / 2 - BOARD.radius, BOARD.depth / 2 - BOARD.radius) + BOARD.radius;
const CANVAS_SCALE = 1 + VIEW.bleed * 2;
const FIT = { halfWidth: SWEEP * 1.04 * CANVAS_SCALE, halfHeight: (SWEEP * Math.sin(VIEW.elevation) + 0.75) * CANVAS_SCALE };
const CANVAS_STYLE = { position: "absolute", inset: `${-VIEW.bleed * 100}%`, width: "auto", height: "auto", pointerEvents: "none" } as const;

// The effects run on every pixel of the canvas, so the cost of the scene is its pixel
// count, not its geometry. Rather than a fixed pixel ratio, the scene gets a pixel
// budget: a phone, whose canvas is small, renders at its full sharpness, and a wide
// desktop canvas is held to the same total. Measured: steady at 60 frames a second up
// to about 1.5 million pixels, and no visible difference in the still from 2 million.
const PIXEL_BUDGET = 1_250_000;
const FRAME_ASPECT = 4 / 3;

function budgetedPixelRatio(frameWidth: number) {
  if (!frameWidth) return 1.5;
  const width = frameWidth * CANVAS_SCALE;
  const ratio = Math.sqrt(PIXEL_BUDGET / (width * (width / FRAME_ASPECT)));
  return Math.min(2, Math.max(1, Math.round(ratio * 20) / 20));
}

function Rig() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);
  useLayoutEffect(() => {
    const t = Math.tan(THREE.MathUtils.degToRad(VIEW.fov / 2));
    const distance = Math.max(FIT.halfWidth / (t * aspect), FIT.halfHeight / t);
    camera.position.set(0, VIEW.targetY + distance * Math.sin(VIEW.elevation), distance * Math.cos(VIEW.elevation));
    camera.lookAt(0, VIEW.targetY, 0);
  }, [camera, aspect]);
  return null;
}

// A studio built from light panels rather than a downloaded HDR: a large soft top light,
// a warm key from the front right, a cool fill from the left and a rim from behind. The
// parts pick these up as reflections, and the reflections travel as the sheet turns.
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 7, 0]} target={[0, 0, 0]} scale={[10, 10, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#fff1df" position={[6, 4, 7]} target={[0, 0, 0]} scale={[5, 4, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#cfe0ff" position={[-8, 3, 2]} target={[0, 0, 0]} scale={[5, 4, 1]} />
      <Lightformer form="rect" intensity={1.7} color="#e6f0ff" position={[0, 3, -9]} target={[0, 0, 0]} scale={[10, 3, 1]} />
    </Environment>
  );
}

// Ambient occlusion for the crevices, bloom for whatever is brighter than white (the
// requests, the core, a part still forming), then tone mapping and anti-aliasing. Tone
// mapping has to be an effect here: the composer switches the renderer's own tone
// mapping off. FXAA rather than SMAA: SMAA ships 90 KB of lookup textures for an edge
// quality that does not show at this pixel density.
function Effects({ occlusion }: { occlusion: boolean }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO enabled={occlusion} halfRes aoRadius={0.5} intensity={2.6} distanceFalloff={0.8} quality="medium" />
      <Bloom luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} mipmapBlur radius={0.7} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <FXAA />
    </EffectComposer>
  );
}

// Warm-up: every material's shader is compiled in parallel where the GPU allows it,
// then two frames are drawn with the canvas still hidden (the effects compile their own
// shaders on the first), and only then is the scene shown and the build started.
function Warmup({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const compiled = useRef(false);
  const frames = useRef(0);
  useEffect(() => {
    let live = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (live) compiled.current = true;
      });
    return () => {
      live = false;
    };
  }, [gl, scene, camera]);
  useFrame(() => {
    if (!compiled.current || frames.current > 2) return;
    frames.current += 1;
    if (frames.current === 2) onReady();
  });
  return null;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export function Platform() {
  const reduced = usePrefersReducedMotion();
  const [landed, setLanded] = useState(0);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const [lean, setLean] = useState(false); // a lighter render, once the frame rate has dropped
  const [frameWidth, setFrameWidth] = useState(0);
  const holder = useRef<HTMLDivElement>(null);
  const go = useRef(false);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    const ro = new ResizeObserver(([e]) => setFrameWidth(Math.round(e.contentRect.width)));
    io.observe(el);
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  // With reduced motion the scene is a still: once it has drawn, it only redraws on demand.
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setSettled(true), 1500);
    return () => window.clearTimeout(id);
  }, [ready]);
  const frameloop = !visible && ready ? "never" : reduced && settled ? "demand" : "always";
  const pixelRatio = lean ? Math.min(1.25, budgetedPixelRatio(frameWidth)) : budgetedPixelRatio(frameWidth);

  return (
    <figure ref={holder} className="platform-figure" aria-label="A cloud architecture drawn as a plan, then built, then running">
      <div className="platform-canvas" data-ready={ready}>
        <Placeholder />
        <Canvas
          dpr={[1, pixelRatio]}
          frameloop={frameloop}
          camera={{ fov: VIEW.fov, near: 4, far: 60, position: [0, 9, 14] }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          style={CANVAS_STYLE}
        >
          <Rig />
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 9, 7]} intensity={1.3} />
          <Studio />
          <Scene animate={!reduced} go={go} onProgress={setLanded} />
          <Effects occlusion={!lean} />
          <PerformanceMonitor onDecline={() => setLean(true)} />
          <Warmup
            onReady={() => {
              go.current = true;
              setReady(true);
            }}
          />
        </Canvas>
      </div>
      <Legend landed={reduced ? LAST_ORDER : landed} />
    </figure>
  );
}
