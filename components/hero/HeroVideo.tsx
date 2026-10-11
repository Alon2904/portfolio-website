"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Legend } from "./platform/Legend";
import { Placeholder } from "./platform/Placeholder";
import { LAST_ORDER, PARTS, TIMING, VIEW } from "./platform/layout";

// The hero is the 3D scene in ./Platform, rendered once to video by scripts/render-hero.mjs
// and played here: an intro clip of the build, then a loop clip of one full turn that
// joins to itself. The browser's video decoder does the work, so the page stays light on
// any device. The live scene is still what the page renders in capture mode, which is how
// the clips are made.
//
// Files in public/hero: intro.mp4 (the build), loop.mp4 (one turn), still.jpg (the built
// platform, for reduced motion). H.264 only: VP9 came out larger for this material.

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

// Read after hydration, so the server's markup and the first client render agree.
const noSubscription = () => () => undefined;
function useCaptureMode() {
  return useSyncExternalStore(
    noSubscription,
    () => new URLSearchParams(window.location.search).get("capture") === "1",
    () => false,
  );
}

// The names under the scene light up as the parts land, timed from the intro clip.
const LOCK_AT = PARTS.map((p) =>
  p.order === 0 ? TIMING.boardSeconds : TIMING.landStart + (p.order - 1) * TIMING.landStagger + TIMING.landSeconds,
);
function landedAt(seconds: number) {
  let landed = LAST_ORDER;
  PARTS.forEach((p, i) => {
    if (seconds < LOCK_AT[i]) landed = Math.min(landed, p.order - 1);
  });
  return Math.max(0, landed);
}

// The video covers the same area the live canvas did: the frame plus its bleed.
const VIDEO_STYLE = {
  position: "absolute",
  inset: `${-VIEW.bleed * 100}%`,
  width: `${100 + VIEW.bleed * 200}%`,
  height: `${100 + VIEW.bleed * 200}%`,
  pointerEvents: "none",
} as const;

type Clip = "intro" | "loop";

function Clips({ onLanded, onPlaying }: { onLanded: (n: number) => void; onPlaying: () => void }) {
  const intro = useRef<HTMLVideoElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const [clip, setClip] = useState<Clip>("intro");
  const holder = useRef<HTMLDivElement>(null);

  // Muted autoplay is set on the element itself: React does not always write the
  // attribute, and without it the browser refuses to start.
  useEffect(() => {
    const a = intro.current;
    const b = loop.current;
    if (!a || !b) return;
    a.muted = true;
    b.muted = true;
    b.load();
    a.play().catch(() => undefined);
  }, []);

  // Off screen, nothing plays.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const current = clip === "intro" ? intro.current : loop.current;
      if (!current) return;
      if (e.isIntersecting) current.play().catch(() => undefined);
      else current.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [clip]);

  return (
    <div ref={holder} className="platform-fade" style={VIDEO_STYLE}>
      <video
        ref={intro}
        className="platform-clip"
        data-active={clip === "intro"}
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={onPlaying}
        // The clip can start from the server's markup before React is listening, so a
        // frame having played counts as playing too.
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > 0) onPlaying();
          onLanded(landedAt(e.currentTarget.currentTime));
        }}
        onEnded={() => {
          onLanded(LAST_ORDER);
          loop.current?.play().catch(() => undefined);
          setClip("loop");
        }}
      >
        <source src="/hero/intro.mp4" type="video/mp4" />
      </video>
      <video ref={loop} className="platform-clip" data-active={clip === "loop"} muted playsInline loop preload="auto">
        <source src="/hero/loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export function HeroVideo({ live }: { live: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const capture = useCaptureMode();
  const [landed, setLanded] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (capture) return <>{live}</>;

  return (
    <figure className="platform-figure" aria-label="A cloud architecture drawn as a plan, then built, then running">
      <div className="platform-canvas" data-ready={reduced || playing}>
        <Placeholder />
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/hero/still.jpg" alt="" className="platform-fade" style={VIDEO_STYLE} />
        ) : (
          <Clips onLanded={setLanded} onPlaying={() => setPlaying(true)} />
        )}
      </div>
      <Legend landed={reduced ? LAST_ORDER : landed} />
    </figure>
  );
}
