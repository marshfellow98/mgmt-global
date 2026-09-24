'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

/* ============================================================================
   GlobeScene — phase-two interior for PinnedSection.

   A wireframe globe in the brand gold. Four waypoints sit on its surface, and
   as scroll progress runs from 0 to 1 an arc draws itself between them while
   the globe rotates so the current stop faces the viewer.

   Nothing here knows about scrolling. It reads progress from a ref that the
   wrapper (Globe.tsx) keeps up to date through the same useScrollProgress hook
   PathDiagram used. That is the whole point of the contract: this file could
   be swapped back out and no page would notice.

   Design decisions worth keeping:

   - Everything is procedural. No model file, no texture, no external asset
     to license, host, or lose. The globe is a sphere geometry with a
     wireframe material — its own segments become the latitude and longitude
     lines.
   - Flat materials only (MeshBasicMaterial). No lights, no shadows, no
     environment map. It looks like a drawing, not a render, which suits the
     rest of the site and costs almost nothing per frame.
   - The scene does its own smoothing. Progress arrives in whatever cadence
     scrolling produces; useFrame lerps rotation and arc length toward it at
     60fps so motion is continuous regardless of input rate.
   ============================================================================ */

const GOLD = '#E1A13F';
const GOLD_PALE = '#EFCFA0';
const GRID = '#3B4E66';
const R = 1.7;

export type GlobeWaypoint = { lat: number; lon: number; label: string };

function toVec(lat: number, lon: number, r = R): THREE.Vector3 {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    r * Math.cos(la) * Math.cos(lo),
    r * Math.sin(la),
    r * Math.cos(la) * Math.sin(lo)
  );
}

/* A great-circle-ish arc lifted off the surface, sampled into points. */
function arcPoints(a: THREE.Vector3, b: THREE.Vector3, n = 48): THREE.Vector3[] {
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.28);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(n);
}

function Scene({
  progressRef, waypoints,
}: { progressRef: MutableRefObject<number>; waypoints: GlobeWaypoint[] }) {
  const group = useRef<THREE.Group>(null);
  const shown = useRef(0);

  const pts = useMemo(() => waypoints.map((w) => toVec(w.lat, w.lon)), [waypoints]);

  // One arc per segment between consecutive waypoints, pre-sampled.
  const arcs = useMemo(
    () => pts.slice(0, -1).map((p, i) => arcPoints(p, pts[i + 1])),
    [pts]
  );

  // Refs to the drawn arcs and node meshes so useFrame can update cheaply.
  // The arc's material carries dashOffset; that's all we touch, so type it
  // by that rather than importing the Line2 class from three-stdlib.
  type ArcLine = { material: { dashOffset: number } };
  const arcRefs = useRef<(ArcLine | null)[]>([]);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Mesh | null)[]>([]);

  const segs = Math.max(waypoints.length - 1, 1);

  useFrame(() => {
    // Ease toward the incoming progress so motion is continuous.
    const target = progressRef.current;
    shown.current += (target - shown.current) * 0.12;
    const p = shown.current;

    // Rotate so the point currently being travelled toward faces the camera.
    // Camera sits on +z, and a point faces it when its longitude is 90°.
    const fi = Math.min(Math.floor(p * segs), segs - 1);
    const ft = p * segs - fi;
    const lonA = waypoints[fi].lon;
    const lonB = waypoints[Math.min(fi + 1, waypoints.length - 1)].lon;
    const lon = lonA + (lonB - lonA) * ft;
    const targetY = THREE.MathUtils.degToRad(90 - lon);
    if (group.current) {
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.08;
      group.current.rotation.x = THREE.MathUtils.degToRad(-12); // slight tilt reads as depth
    }

    // Draw each arc up to where progress has reached it.
    arcs.forEach((_, i) => {
      const line = arcRefs.current[i];
      if (!line) return;
      const local = THREE.MathUtils.clamp(p * segs - i, 0, 1);
      // drei Line exposes the material's dash offset; we use it to reveal.
      line.material.dashOffset = -local;
    });

    // Light up nodes that have been reached, pulse the one being approached.
    waypoints.forEach((_, i) => {
      const at = i / segs;
      const reached = p >= at - 0.01;
      const node = nodeRefs.current[i];
      const halo = haloRefs.current[i];
      if (node) {
        (node.material as THREE.MeshBasicMaterial).color.set(reached ? GOLD : '#5A6B82');
      }
      if (halo) {
        const near = 1 - Math.min(Math.abs(p - at) / 0.06, 1);
        const s = 1 + near * 1.8;
        halo.scale.setScalar(s);
        (halo.material as THREE.MeshBasicMaterial).opacity = near * 0.35;
      }
    });
  });

  return (
    <group ref={group}>
      {/* The globe. Wireframe segments double as lat/long lines. */}
      <mesh>
        <sphereGeometry args={[R, 28, 18]} />
        <meshBasicMaterial color={GRID} wireframe transparent opacity={0.8} />
      </mesh>

      {/* A faint solid core so the far side of the wireframe reads dimmer. */}
      <mesh>
        <sphereGeometry args={[R * 0.985, 32, 24]} />
        <meshBasicMaterial color="#05070A" transparent opacity={0.6} />
      </mesh>

      {/* Arcs. dashSize equals the full length, so dashOffset from 0 to -1
          reveals the line progressively. */}
      {arcs.map((points, i) => (
        <Line
          key={`arc-${i}`}
          ref={(el) => { arcRefs.current[i] = el as unknown as ArcLine; }}
          points={points}
          color={GOLD}
          lineWidth={2.4}
          dashed
          dashScale={1}
          dashSize={1}
          gapSize={1}
          transparent
          opacity={0.95}
        />
      ))}

      {/* Waypoints */}
      {pts.map((v, i) => (
        <group key={`wp-${i}`} position={v}>
          <mesh ref={(el) => { haloRefs.current[i] = el; }}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshBasicMaterial color={GOLD_PALE} transparent opacity={0} />
          </mesh>
          <mesh ref={(el) => { nodeRefs.current[i] = el; }}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={GRID} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function GlobeScene({
  progressRef, waypoints,
}: { progressRef: MutableRefObject<number>; waypoints: GlobeWaypoint[] }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      /* Camera distance is derived, not guessed:
           visible height = 2 * z * tan(fov/2)
           z = (diameter / fill) / (2 * tan(fov/2))
         With R=1.7, fov=38 and a 95% fill that gives z=5.20. Anything
         closer clips the globe on all four sides. Recompute if R or fov
         changes — scripts/verify.mjs checks this. */
      camera={{ position: [0, 0, 5.20], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene progressRef={progressRef} waypoints={waypoints} />
    </Canvas>
  );
}
