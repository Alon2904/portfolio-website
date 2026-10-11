import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "@react-three/drei";
import * as THREE from "three";
import { GATEWAY_PORTAL, LANES, type Part } from "./layout";
import type { PartMaterials } from "./materials";
import { circle, raise } from "./shapes";
import type { Signals } from "./state";

// Forms. Each stands on the sheet inside the footprint of its plan outline and reads as
// the thing it is. Every form is built from its part's four finishes, so the whole part
// glows and cools together as it lands.
type FormProps = { part: Part; mats: PartMaterials; signals: Signals };

// A screen: a dark bezel with the lit window inside it, facing +z.
function Screen({ width, height, mats }: { width: number; height: number; mats: PartMaterials }) {
  const bezel = 0.022;
  return (
    <group>
      <mesh material={mats.dark} position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
      </mesh>
      <mesh material={mats.light} position={[0, 0, 0.003]}>
        <planeGeometry args={[width - bezel * 2, height - bezel * 2]} />
      </mesh>
    </group>
  );
}

// A person: a head and a torso in the client tone, no face or limbs. Seated or
// standing at a device, they read as a user from every side, which the device alone
// never does from behind.
function Person({ mats, seated = false, scale = 1 }: { mats: PartMaterials; seated?: boolean; scale?: number }) {
  const torso = seated ? 0.14 : 0.2;
  return (
    <group scale={scale}>
      <mesh material={mats.main} position={[0, torso / 2 + 0.09, 0]}>
        <capsuleGeometry args={[0.085, torso, 6, 16]} />
      </mesh>
      <mesh material={mats.pale} position={[0, torso + 0.09 + 0.085 + 0.07, 0]}>
        <sphereGeometry args={[0.07, 24, 16]} />
      </mesh>
    </group>
  );
}

function Laptop({ mats }: FormProps) {
  const w = 0.74;
  const d = 0.5;
  const base = 0.036;
  return (
    <group>
      <mesh material={mats.main} position={[0, base / 2, 0.02]}>
        <RoundedBoxGeometry args={[w, base, d]} radius={0.012} smoothness={3} />
      </mesh>
      {/* the keyboard, and the trackpad in front of it */}
      <mesh material={mats.decal("keys")} rotation={[-Math.PI / 2, 0, 0]} position={[0, base + 0.001, -0.055]}>
        <planeGeometry args={[w * 0.84, d * 0.5]} />
      </mesh>
      <mesh material={mats.dark} position={[0, base + 0.001, 0.17]}>
        <boxGeometry args={[0.24, 0.002, 0.13]} />
      </mesh>
      {/* the lid, open and leaning back, with the screen on its inner face and a lit mark on its back */}
      <group position={[0, base, -0.22]} rotation={[-0.3, 0, 0]}>
        <mesh material={mats.main} position={[0, 0.24, -0.012]}>
          <RoundedBoxGeometry args={[w, 0.48, 0.024]} radius={0.01} smoothness={3} />
        </mesh>
        <group position={[0, 0.24, 0]}>
          <Screen width={w - 0.03} height={0.45} mats={mats} />
        </group>
        <mesh material={mats.light} position={[0, 0.24, -0.0255]}>
          <cylinderGeometry args={[0.035, 0.035, 0.003, 24]} />
        </mesh>
      </group>
      {/* the person sits in front of the laptop, facing its screen, a little to one side of it */}
      <group position={[0.26, 0, 0.46]}>
        <Person mats={mats} seated />
      </group>
    </group>
  );
}

function Phone({ mats }: FormProps) {
  const w = 0.3;
  const h = 0.58;
  const t = 0.032;
  return (
    <group>
      {/* a small stand holds the phone up, leaning back a little */}
      <mesh material={mats.dark} position={[0, 0.02, 0.02]}>
        <RoundedBoxGeometry args={[0.24, 0.04, 0.18]} radius={0.012} smoothness={3} />
      </mesh>
      <group position={[0, 0.03, 0.03]} rotation={[-0.2, 0, 0]}>
        <mesh material={mats.main} position={[0, h / 2, -t / 2]}>
          <RoundedBoxGeometry args={[w, h, t]} radius={0.03} smoothness={4} />
        </mesh>
        <group position={[0, h / 2, 0]}>
          <Screen width={w - 0.026} height={h - 0.026} mats={mats} />
        </group>
        {/* the camera notch, and the camera on the back */}
        <mesh material={mats.dark} position={[0, h - 0.03, 0.004]}>
          <boxGeometry args={[0.08, 0.013, 0.002]} />
        </mesh>
        <mesh material={mats.dark} position={[-0.08, h - 0.08, -t - 0.001]}>
          <boxGeometry args={[0.07, 0.07, 0.004]} />
        </mesh>
      </group>
      {/* the person stands in front of the phone, a little to one side of it */}
      <group position={[0.18, 0, 0.32]}>
        <Person mats={mats} />
      </group>
    </group>
  );
}

function Monitor({ mats }: FormProps) {
  const w = 0.8;
  const h = 0.48;
  return (
    <group>
      <mesh material={mats.main} position={[0, 0.011, -0.02]}>
        <RoundedBoxGeometry args={[0.36, 0.022, 0.24]} radius={0.009} smoothness={3} />
      </mesh>
      <mesh material={mats.dark} position={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.08, 0.18, 0.03]} />
      </mesh>
      <group position={[0, 0.17 + h / 2, 0]}>
        <mesh material={mats.main} position={[0, 0, -0.016]}>
          <RoundedBoxGeometry args={[w, h, 0.032]} radius={0.014} smoothness={3} />
        </mesh>
        <Screen width={w - 0.03} height={h - 0.03} mats={mats} />
        {/* a light on the chin, and a light bar across the back */}
        <mesh material={mats.light} position={[0, -h / 2 + 0.01, 0.002]}>
          <boxGeometry args={[0.02, 0.006, 0.002]} />
        </mesh>
        <mesh material={mats.light} position={[0, 0.02, -0.0335]}>
          <boxGeometry args={[w * 0.5, 0.012, 0.003]} />
        </mesh>
      </group>
      {/* the person sits in front of the monitor, facing it, a little to one side of it */}
      <group position={[0.3, 0, 0.44]}>
        <Person mats={mats} seated />
      </group>
    </group>
  );
}

// A wall across the lanes with a portal for each one, so requests visibly pass through
// it, and the same panel of ports and lights on both of its faces.
function Gateway({ part, mats }: FormProps) {
  const [t, h, l] = part.size;
  const portal = GATEWAY_PORTAL;
  const cuts = [-l / 2, ...LANES.flatMap((z) => [z - portal.width / 2, z + portal.width / 2]), l / 2];
  const piers = [0, 2, 4, 6].map((i) => ({ from: cuts[i], to: cuts[i + 1] }));
  const beam = h - portal.height;
  const lid = 0.012;
  return (
    <group>
      {piers.map((p) => (
        <mesh key={p.from} material={mats.dark} position={[0, portal.height / 2, (p.from + p.to) / 2]}>
          <boxGeometry args={[t - 0.04, portal.height + 0.01, p.to - p.from]} />
        </mesh>
      ))}
      <mesh material={mats.main} position={[0, portal.height + beam / 2, 0]}>
        <RoundedBoxGeometry args={[t, beam, l]} radius={0.024} smoothness={3} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} material={mats.decal("face")} rotation={[0, (side * Math.PI) / 2, 0]} position={[side * (t / 2 + 0.001), h / 2, 0]}>
          <planeGeometry args={[l, h]} />
        </mesh>
      ))}
      {/* a pale cap with a run of vents along it */}
      <mesh material={mats.pale} position={[0, h + lid / 2 - 0.004, 0]}>
        <boxGeometry args={[t - 0.06, lid, l - 0.12]} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} material={mats.dark} position={[0, h + lid - 0.003, -l / 2 + 0.3 + i * ((l - 0.6) / 10)]}>
          <boxGeometry args={[t - 0.12, 0.004, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

// A server on a recessed plinth: drive bays and lights on both long faces, vents on
// the short sides.
function Service({ part, mats }: FormProps) {
  const [w, h, d] = part.size;
  const plinth = 0.05;
  const body = h - plinth - 0.012;
  const mid = plinth + body / 2;
  return (
    <group>
      <mesh material={mats.dark} position={[0, plinth / 2, 0]}>
        <boxGeometry args={[w - 0.1, plinth, d - 0.1]} />
      </mesh>
      <mesh material={mats.main} position={[0, mid, 0]}>
        <RoundedBoxGeometry args={[w, body, d]} radius={0.028} smoothness={3} />
      </mesh>
      <mesh material={mats.pale} position={[0, plinth + body + 0.004, 0]}>
        <RoundedBoxGeometry args={[w - 0.14, 0.014, d - 0.14]} radius={0.006} smoothness={2} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={`front${side}`} material={mats.decal("front")} rotation={[0, side > 0 ? 0 : Math.PI, 0]} position={[0, mid, side * (d / 2 + 0.001)]}>
          <planeGeometry args={[w - 0.06, body - 0.05]} />
        </mesh>
      ))}
      {[1, -1].map((side) => (
        <mesh key={`side${side}`} material={mats.decal("side")} rotation={[0, (side * Math.PI) / 2, 0]} position={[side * (w / 2 + 0.001), mid, 0]}>
          <planeGeometry args={[d - 0.06, body - 0.05]} />
        </mesh>
      ))}
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

// A block of eight bricks, each a cartridge with its face on the sides that show. One
// of them is always just being put away.
function Storage({ part, mats }: FormProps) {
  const [w, h, d] = part.size;
  const lifted = useRef<THREE.Group>(null);
  const gap = 0.045;
  const bw = (w - gap) / 2;
  const bh = (h - gap) / 2;
  const bd = (d - gap) / 2;
  const topY = bh + gap + bh / 2;

  useFrame(({ clock }) => {
    if (lifted.current) lifted.current.position.y = topY + 0.045 + Math.sin(clock.elapsedTime * 1.1) * 0.025;
  });

  const bricks = [0, 1].flatMap((bx) => [0, 1].flatMap((by) => [0, 1].map((bz) => [bx, by, bz] as const)));
  const face = mats.decal("brick");
  return (
    <group>
      <mesh material={mats.dark} position={[0, h / 2, 0]}>
        <boxGeometry args={[w - 0.12, h - 0.1, d - 0.12]} />
      </mesh>
      {bricks.map(([bx, by, bz]) => {
        const isLifted = bx === 1 && by === 1 && bz === 1;
        const sx = bx ? 1 : -1;
        const sz = bz ? 1 : -1;
        return (
          <group
            key={`${bx}${by}${bz}`}
            ref={isLifted ? lifted : undefined}
            position={[(bx - 0.5) * (bw + gap), bh / 2 + by * (bh + gap), (bz - 0.5) * (bd + gap)]}
          >
            <mesh material={isLifted ? mats.pale : mats.main}>
              <RoundedBoxGeometry args={[bw, bh, bd]} radius={0.026} smoothness={3} />
            </mesh>
            <mesh material={face} rotation={[0, (sx * Math.PI) / 2, 0]} position={[sx * (bw / 2 + 0.001), 0, 0]}>
              <planeGeometry args={[bd - 0.04, bh - 0.04]} />
            </mesh>
            <mesh material={face} rotation={[0, sz > 0 ? 0 : Math.PI, 0]} position={[0, 0, sz * (bd / 2 + 0.001)]}>
              <planeGeometry args={[bw - 0.04, bh - 0.04]} />
            </mesh>
          </group>
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
