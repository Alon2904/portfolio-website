import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "@react-three/drei";
import * as THREE from "three";
import { LANES, type Part } from "./layout";
import type { PartMaterials } from "./materials";
import { circle, raise } from "./shapes";
import type { Signals } from "./state";

// Forms. Each stands on the sheet inside the footprint of its plan outline and reads as
// the thing it is. Every form is built from its part's four finishes, so the whole part
// glows and cools together as it lands.
type FormProps = { part: Part; mats: PartMaterials; signals: Signals };

function Laptop({ mats }: FormProps) {
  return (
    <group>
      <mesh material={mats.main} position={[0, 0.019, 0.03]}>
        <RoundedBoxGeometry args={[0.6, 0.03, 0.4]} radius={0.012} smoothness={3} />
      </mesh>
      <mesh material={mats.dark} position={[0, 0.0355, 0]}>
        <boxGeometry args={[0.5, 0.004, 0.2]} />
      </mesh>
      {/* the lid, open and leaning back, with the screen on its inner face */}
      <group position={[0, 0.034, -0.17]} rotation={[-0.32, 0, 0]}>
        <mesh material={mats.main} position={[0, 0.19, 0]}>
          <RoundedBoxGeometry args={[0.6, 0.38, 0.022]} radius={0.01} smoothness={3} />
        </mesh>
        <mesh material={mats.light} position={[0, 0.19, 0.0125]}>
          <boxGeometry args={[0.54, 0.32, 0.004]} />
        </mesh>
      </group>
    </group>
  );
}

function Phone({ mats }: FormProps) {
  return (
    <group>
      <group position={[0, 0, 0.08]} rotation={[-0.34, 0, 0]}>
        <mesh material={mats.main} position={[0, 0.235, 0]}>
          <RoundedBoxGeometry args={[0.25, 0.46, 0.03]} radius={0.013} smoothness={3} />
        </mesh>
        <mesh material={mats.light} position={[0, 0.235, 0.0165]}>
          <boxGeometry args={[0.21, 0.41, 0.004]} />
        </mesh>
      </group>
      {/* a small stand behind it */}
      <mesh material={mats.dark} position={[0, 0.11, -0.06]} rotation={[0.48, 0, 0]}>
        <boxGeometry args={[0.1, 0.25, 0.014]} />
      </mesh>
    </group>
  );
}

function Monitor({ mats }: FormProps) {
  return (
    <group>
      <mesh material={mats.main} position={[0, 0.012, 0]}>
        <RoundedBoxGeometry args={[0.3, 0.022, 0.2]} radius={0.009} smoothness={3} />
      </mesh>
      <mesh material={mats.dark} position={[0, 0.1, -0.03]}>
        <boxGeometry args={[0.05, 0.17, 0.03]} />
      </mesh>
      <mesh material={mats.main} position={[0, 0.33, 0]}>
        <RoundedBoxGeometry args={[0.64, 0.4, 0.032]} radius={0.014} smoothness={3} />
      </mesh>
      <mesh material={mats.light} position={[0, 0.33, 0.0175]}>
        <boxGeometry args={[0.58, 0.34, 0.004]} />
      </mesh>
      {/* the title bar of a window */}
      <mesh material={mats.dark} position={[0, 0.4825, 0.0185]}>
        <boxGeometry args={[0.58, 0.035, 0.004]} />
      </mesh>
    </group>
  );
}

// A wall across the lanes with a portal for each one, so requests visibly pass through it.
function Gateway({ part, mats }: FormProps) {
  const [t, h, l] = part.size;
  const portal = { width: 0.4, height: 0.26 };
  const cuts = [-l / 2, ...LANES.flatMap((z) => [z - portal.width / 2, z + portal.width / 2]), l / 2];
  const piers = [0, 2, 4, 6].map((i) => ({ from: cuts[i], to: cuts[i + 1] }));
  const beam = h - portal.height;
  return (
    <group>
      {piers.map((p) => (
        <mesh key={p.from} material={mats.dark} position={[0, portal.height / 2, (p.from + p.to) / 2]}>
          <boxGeometry args={[t - 0.04, portal.height, p.to - p.from]} />
        </mesh>
      ))}
      <mesh material={mats.main} position={[0, portal.height + beam / 2, 0]}>
        <RoundedBoxGeometry args={[t, beam, l]} radius={0.022} smoothness={3} />
      </mesh>
      {/* both faces: a light strip over the portals and three slots above it */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (t / 2 + 0.002), 0, 0]}>
          <mesh material={mats.light} position={[0, portal.height + 0.075, 0]}>
            <boxGeometry args={[0.008, 0.024, l - 0.3]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} material={mats.dark} position={[0, h - 0.11 - i * 0.075, 0]}>
              <boxGeometry args={[0.008, 0.022, l - 0.5]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh material={mats.pale} position={[0, h + 0.002, 0]}>
        <boxGeometry args={[t - 0.07, 0.008, l - 0.14]} />
      </mesh>
    </group>
  );
}

// A server on a recessed plinth: three rack units on each long face, each with a light.
function Service({ part, mats }: FormProps) {
  const [w, h, d] = part.size;
  const plinth = 0.05;
  const body = h - plinth - 0.012;
  const rows = [0.2, 0.5, 0.8].map((f) => plinth + body * f);
  return (
    <group>
      <mesh material={mats.dark} position={[0, plinth / 2, 0]}>
        <boxGeometry args={[w - 0.1, plinth, d - 0.1]} />
      </mesh>
      <mesh material={mats.main} position={[0, plinth + body / 2, 0]}>
        <RoundedBoxGeometry args={[w, body, d]} radius={0.028} smoothness={3} />
      </mesh>
      <mesh material={mats.pale} position={[0, plinth + body + 0.004, 0]}>
        <RoundedBoxGeometry args={[w - 0.14, 0.014, d - 0.14]} radius={0.006} smoothness={2} />
      </mesh>
      {[-1, 1].map((side) =>
        rows.map((y) => (
          <group key={`${side}:${y}`} position={[0, y, side * (d / 2 + 0.002)]}>
            <mesh material={mats.dark} position={[-0.07, 0, 0]}>
              <boxGeometry args={[w - 0.3, 0.018, 0.008]} />
            </mesh>
            <mesh material={mats.light} position={[w / 2 - 0.1, 0, 0]}>
              <boxGeometry args={[0.05, 0.022, 0.008]} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}

// An open frame with a faceted core turning inside two rings. The lane runs underneath it.
function AiService({ part, mats, signals }: FormProps) {
  const [w, h, d] = part.size;
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const centre = h * 0.54;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (core.current) {
      core.current.rotation.set(t * 0.35, t * 0.55, 0);
      core.current.position.y = centre + Math.sin(t * 1.3) * 0.018;
    }
    if (ringA.current) ringA.current.rotation.set(Math.PI / 2 + Math.sin(t * 0.5) * 0.5, t * 0.7, 0);
    if (ringB.current) ringB.current.rotation.set(t * 0.45, 0, Math.PI / 3 + t * 0.3);
    if (coreMat.current) coreMat.current.emissiveIntensity = 2.3 + Math.sin(t * 1.7) * 0.35 + signals.level(part.id) * 1.8;
  });

  const bar = 0.034;
  const foot = 0.03;
  const x = (w - bar) / 2;
  const z = (d - bar) / 2;
  const corners = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx, sz] as const));
  const levels = [foot + bar / 2, h - bar / 2];
  return (
    <group>
      {corners.map(([sx, sz]) => (
        <group key={`${sx}:${sz}`} position={[sx * x, 0, sz * z]}>
          <mesh material={mats.dark} position={[0, foot / 2, 0]}>
            <boxGeometry args={[0.1, foot, 0.1]} />
          </mesh>
          <mesh material={mats.main} position={[0, (h + foot) / 2, 0]}>
            <boxGeometry args={[bar, h - foot, bar]} />
          </mesh>
        </group>
      ))}
      {levels.map((y) =>
        [-1, 1].map((s) => (
          <group key={`${y}:${s}`}>
            <mesh material={mats.main} position={[0, y, s * z]}>
              <boxGeometry args={[w - bar * 2, bar, bar]} />
            </mesh>
            <mesh material={mats.main} position={[s * x, y, 0]}>
              <boxGeometry args={[bar, bar, d - bar * 2]} />
            </mesh>
          </group>
        )),
      )}
      <mesh ref={core} position={[0, centre, 0]}>
        <icosahedronGeometry args={[0.19, 0]} />
        <meshStandardMaterial ref={coreMat} color="#0a6b5d" emissive="#45f2d2" emissiveIntensity={2.3} roughness={0.25} flatShading />
      </mesh>
      <group position={[0, centre, 0]}>
        <mesh ref={ringA} material={mats.light}>
          <torusGeometry args={[0.3, 0.007, 8, 72]} />
        </mesh>
        <mesh ref={ringB} material={mats.light}>
          <torusGeometry args={[0.26, 0.006, 8, 72]} />
        </mesh>
      </group>
    </group>
  );
}

// Three discs with a lit seam between them.
function Database({ part, mats }: FormProps) {
  const [w, h] = part.size;
  const r = w / 2;
  const seam = 0.045;
  const discH = (h - seam * 2) / 3;
  const disc = useMemo(() => raise(circle(r), discH, 0.02, 64), [r, discH]);
  useEffect(() => () => disc.dispose(), [disc]);
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={disc} material={mats.main} position={[0, i * (discH + seam), 0]} />
      ))}
      {[0, 1].map((i) => (
        <mesh key={`seam${i}`} material={mats.light} position={[0, discH + seam / 2 + i * (discH + seam), 0]}>
          <cylinderGeometry args={[r - 0.035, r - 0.035, seam, 64]} />
        </mesh>
      ))}
      <mesh material={mats.pale} position={[0, h + 0.003, 0]}>
        <cylinderGeometry args={[r * 0.64, r * 0.64, 0.008, 64]} />
      </mesh>
    </group>
  );
}

// A block of eight bricks. One of them is always just being put away.
function Storage({ part, mats }: FormProps) {
  const [w, h, d] = part.size;
  const lifted = useRef<THREE.Mesh>(null);
  const gap = 0.045;
  const bw = (w - gap) / 2;
  const bh = (h - gap) / 2;
  const bd = (d - gap) / 2;
  const topY = bh + gap + bh / 2;

  useFrame(({ clock }) => {
    if (lifted.current) lifted.current.position.y = topY + 0.045 + Math.sin(clock.elapsedTime * 1.1) * 0.025;
  });

  const bricks = [0, 1].flatMap((bx) => [0, 1].flatMap((by) => [0, 1].map((bz) => [bx, by, bz] as const)));
  return (
    <group>
      <mesh material={mats.dark} position={[0, h / 2, 0]}>
        <boxGeometry args={[w - 0.12, h - 0.1, d - 0.12]} />
      </mesh>
      {bricks.map(([bx, by, bz]) => {
        const isLifted = bx === 1 && by === 1 && bz === 1;
        return (
          <mesh
            key={`${bx}${by}${bz}`}
            ref={isLifted ? lifted : undefined}
            material={isLifted ? mats.pale : mats.main}
            position={[(bx - 0.5) * (bw + gap), bh / 2 + by * (bh + gap), (bz - 0.5) * (bd + gap)]}
          >
            <RoundedBoxGeometry args={[bw, bh, bd]} radius={0.026} smoothness={3} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Form(props: FormProps) {
  switch (props.part.kind) {
    case "laptop":
      return <Laptop {...props} />;
    case "phone":
      return <Phone {...props} />;
    case "monitor":
      return <Monitor {...props} />;
    case "gateway":
      return <Gateway {...props} />;
    case "service":
      return <Service {...props} />;
    case "ai":
      return <AiService {...props} />;
    case "database":
      return <Database {...props} />;
    case "storage":
      return <Storage {...props} />;
    default:
      return null;
  }
}
