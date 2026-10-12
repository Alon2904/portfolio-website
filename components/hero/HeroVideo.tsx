"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Legend } from "./platform/Legend";
import { Placeholder } from "./platform/Placeholder";
import { LAST_ORDER, PARTS, TIMING, VIEW } from "./platform/layout";

// The hero is the 3D scene in ./Platform, rendered once to video by scripts/render-hero.mjs
// and played here: an intro clip of the build, then a loop clip of one full turn that
// joins to itself. The browser's video decoder does the work, so the page stays light on
// any device. The live scene is still what the page renders in capture mode, which is how
// the clips are made.
//
// Files in public/hero: intro.mp4 (the build), loop.mp4 (one turn), each also as -sm.mp4
// for phones, and still.jpg (the built platform, for reduced motion and for when the video
// will not play). H.264 only: VP9 came out larger for this material.

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

// "still" is the built platform as a picture (the loop's first frame), shown when the
// browser will not play the video on its own (iOS in Low Power Mode refuses muted
// autoplay) or the intro has not shown a frame in time.
type Clip = "intro" | "loop" | "still";

// Phones get a smaller encode of each clip, 720 wide rather than 1280: the hero is under
// 400 CSS pixels wide there, and the full-size loop alone is about 4 MB.
function Sources({ name }: { name: string }) {
  return (
    <>
      <source src={`/hero/${name}-sm.mp4`} type="video/mp4" media="(max-width: 639px)" />
      <source src={`/hero/${name}.mp4`} type="video/mp4" />
    </>
  );
}

// How long the intro may take to show its first frame before the still stands in.
const STALL_MS = 6000;

function Clips({ onLanded, onPlaying }: { onLanded: (n: number) => void; onPlaying: () => void }) {
  const intro = useRef<HTMLVideoElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const [clip, setClip] = useState<Clip>("intro");
  const holder = useRef<HTMLDivElement>(null);

  // The loop is fetched only once the intro has what it needs, so on a slow connection
  // the two do not split the bandwidth and hold each other up.
  const loadLoop = () => {
    const b = loop.current;
    if (!b || b.preload === "auto") return;
    b.preload = "auto";
    b.load();
  };

  // Muted autoplay is set on the element itself: React does not always write the
  // attribute, and without it the browser refuses to start.
  useEffect(() => {
    const a = intro.current;
    const b = loop.current;
    if (!a || !b) return;
    a.muted = true;
    b.muted = true;
    // the intro may have buffered before React was listening for it
    if (a.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) loadLoop();
    const toStill = () => setClip((c) => (c === "intro" && a.currentTime === 0 ? "still" : c));
    a.play().catch((e: DOMException) => {
      if (e.name === "NotAllowedError") toStill();
    });
    const stall = setTimeout(toStill, STALL_MS);
    return () => clearTimeout(stall);
  }, []);

  // The still stands for the finished build. A tap may be what the browser was waiting
  // for, so the first one starts the loop, which opens on the same frame as the still.
  useEffect(() => {
    if (clip !== "still") return;
    onLanded(LAST_ORDER);
    onPlaying();
    const retry = () => {
      loadLoop();
      loop.current?.play().catch(() => undefined);
    };
    document.addEventListener("click", retry, { once: true });
    document.addEventListener("touchend", retry, { once: true });
    return () => {
      document.removeEventListener("click", retry);
      document.removeEventListener("touchend", retry);
    };
  }, [clip, onLanded, onPlaying]);

  // Off screen, nothing plays.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const a = intro.current;
      // once the intro has ended, the loop is the clip that is on (or about to be)
      const current = clip === "still" ? null : clip === "loop" || a?.ended ? loop.current : a;
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
        onPlaying={() => {
          if (clip === "intro") onPlaying();
        }}
        // The clip can start from the server's markup before React is listening, so a
        // frame having played counts as playing too.
        onTimeUpdate={(e) => {
          if (clip !== "intro") return;
          if (e.currentTarget.currentTime > 0) onPlaying();
          onLanded(landedAt(e.currentTarget.currentTime));
        }}
        onCanPlayThrough={loadLoop}
        // The intro holds its last frame until the loop is actually playing, so a loop
        // that is still loading shows the built platform rather than nothing.
        onEnded={() => {
          onLanded(LAST_ORDER);
          loadLoop();
          loop.current?.play().catch(() => undefined);
        }}
      >
        <Sources name="intro" />
      </video>
      <video
        ref={loop}
        className="platform-clip"
        data-active={clip === "loop"}
        muted
        playsInline
        loop
        preload="none"
        onPlaying={() => {
          intro.current?.pause();
          setClip("loop");
        }}
      >
        <Sources name="loop" />
      </video>
      {clip === "still" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/hero/still.jpg" alt="" className="platform-clip" data-active />
      )}
    </div>
  );
}

export function HeroVideo({ live }: { live: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const capture = useCaptureMode();
  const [landed, setLanded] = useState(0);
  const [playing, setPlaying] = useState(false);
  const markPlaying = useCallback(() => setPlaying(true), []);

  if (capture) return <>{live}</>;

  return (
    <figure className="platform-figure" aria-label="A cloud architecture drawn as a plan, then built, then running">
      <div className="platform-canvas" data-ready={reduced || playing}>
        <Placeholder />
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/hero/still.jpg" alt="" className="platform-fade" style={VIDEO_STYLE} />
        ) : (
          <Clips onLanded={setLanded} onPlaying={markPlaying} />
        )}
      </div>
      <Legend landed={reduced ? LAST_ORDER : landed} />
    </figure>
  );
}
