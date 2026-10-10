import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

export function roundedRect(width: number, depth: number, radius: number) {
  const x = width / 2;
  const y = depth / 2;
  const r = radius;
  const s = new THREE.Shape();
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x, y - r);
  s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  s.lineTo(-x + r, y);
  s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-x, -y + r);
  s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

export function circle(radius: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, radius, 0, Math.PI * 2, false);
  return s;
}

// A flat shape raised into a solid that stands on y = 0 and keeps the shape's footprint,
// with a machined chamfer on its top and bottom edges. Flat faces stay flat and curved
// walls shade smoothly: only neighbouring faces within the crease angle share normals.
export function raise(shape: THREE.Shape, height: number, chamfer: number, curveSegments = 12) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: height - chamfer * 2,
    bevelEnabled: true,
    bevelThickness: chamfer,
    bevelSize: chamfer,
    bevelOffset: -chamfer,
    bevelSegments: 1,
    curveSegments,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, chamfer, 0);
  return toCreasedNormals(g, Math.PI / 8);
}
