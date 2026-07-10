import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

// ---------------------------------------------------------------------------
// A single, mathematically correct Möbius strip built from a parametric
// BufferGeometry surface with a properly stitched half-twist seam.
//
// Elongated (oval) centerline · continuous 180° twist · matte graphite
// material · slow constant rotation revealing the twist naturally.
// ---------------------------------------------------------------------------

// Centerline base radius (Y axis). Elongation stretches X so the loop
// reads as a long horizontal oval that wraps around the hero text.
const R = 1.6;
const ELONG = 2.05;      // major-axis multiplier along X
const W = 0.42;          // ribbon half-width
const U_SEGMENTS = 320;  // resolution along the loop
const V_SEGMENTS = 14;   // resolution across the ribbon
const TWO_PI = Math.PI * 2;

// Cursor state for a whisper of parallax.
const mouseTarget = { x: 0, y: 0 };

/**
 * Build a Möbius strip as an indexed BufferGeometry.
 *
 * Parametric surface:
 *   x = (R + v·cos(u/2)) · cos(u) · elong
 *   y = (R + v·cos(u/2)) · sin(u)
 *   z =  v · sin(u/2)
 * with u ∈ [0, 2π), v ∈ [-W, W].
 *
 * The last column (u = 2π) is intentionally NOT duplicated; instead the
 * seam is stitched with triangles that connect column (uSegs-1) → column 0
 * with v flipped (j ↔ vSegs-j). This produces the characteristic Möbius
 * half-twist closure and computeVertexNormals yields continuous shading
 * across the join.
 */
function buildMobiusGeometry(
  uSegs: number,
  vSegs: number,
  radius: number,
  halfWidth: number,
  elongation: number,
): THREE.BufferGeometry {
  const uRes = uSegs;         // no duplicated seam column
  const vRes = vSegs + 1;     // include both v edges
  const vertCount = uRes * vRes;

  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);

  for (let j = 0; j < vRes; j++) {
    const v = -halfWidth + (2 * halfWidth * j) / vSegs;
    for (let i = 0; i < uRes; i++) {
      const u = (TWO_PI * i) / uSegs;
      const c = Math.cos(u);
      const s = Math.sin(u);
      const ch = Math.cos(u / 2);
      const sh = Math.sin(u / 2);
      const r = radius + v * ch;

      const idx = j * uRes + i;
      positions[idx * 3 + 0] = r * c * elongation;
      positions[idx * 3 + 1] = r * s;
      positions[idx * 3 + 2] = v * sh;

      uvs[idx * 2 + 0] = i / uSegs;
      uvs[idx * 2 + 1] = j / vSegs;
    }
  }

  const indices: number[] = [];
  for (let j = 0; j < vSegs; j++) {
    for (let i = 0; i < uRes; i++) {
      const iNext = (i + 1) % uRes;
      // Möbius seam: when wrapping i = uRes-1 → 0, flip v.
      const seam = i === uRes - 1;
      const jTop = j;
      const jBot = j + 1;
      const jTopNext = seam ? vSegs - jTop : jTop;
      const jBotNext = seam ? vSegs - jBot : jBot;

      const a = jTop * uRes + i;
      const b = jBot * uRes + i;
      const c = jTopNext * uRes + iNext;
      const d = jBotNext * uRes + iNext;

      // Two triangles per quad, wound so normals face outward.
      indices.push(a, c, d, a, d, b);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}

const MobiusMesh = ({
  quality,
}: {
  quality: QualitySettings;
}) => {
  const outerRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.75);

  // Adaptive tesselation — high quality on desktop, lighter on low-end.
  const [uSegs, vSegs] = useMemo(() => {
    if (quality.tier === 'high') return [U_SEGMENTS, V_SEGMENTS];
    if (quality.tier === 'mid') return [220, 10];
    return [160, 8];
  }, [quality.tier]);

  const geometry = useMemo(
    () => buildMobiusGeometry(uSegs, vSegs, R, W, ELONG),
    [uSegs, vSegs],
  );

  // Matte graphite/charcoal — dielectric (metalness = 0), soft roughness so
  // the directional light reads as a gentle sheen across the twist, never
  // as chrome or plastic.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#20232a'),
        roughness: 0.72,
        metalness: 0.0,
        side: THREE.DoubleSide,
        flatShading: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Entrance scale-in (once, then holds at 1).
    if (outerRef.current) {
      scaleRef.current += (1 - scaleRef.current) * Math.min(1, delta * 2);
      outerRef.current.scale.setScalar(scaleRef.current);

      // Fixed presentation tilt: ~30° back on X, subtle whisper of parallax
      // from the pointer. No easing / bounce — just a slow lerp toward the
      // resting pose so it settles smoothly on load.
      const baseX = -0.52; // ~ -29.8°
      const baseY = 0.14;  // ~ +8°
      const targetX = baseX + mouseTarget.y * 0.05;
      const targetY = baseY + mouseTarget.x * 0.06;
      outerRef.current.rotation.x += (targetX - outerRef.current.rotation.x) * 0.04;
      outerRef.current.rotation.y += (targetY - outerRef.current.rotation.y) * 0.04;
    }

    // Constant-velocity rotation around the strip's local Y axis — one full
    // revolution every 30s. This carries the twist smoothly through the
    // light so the ribbon's surface orientation continuously changes.
    if (rotorRef.current) {
      const period = 30; // seconds per revolution
      rotorRef.current.rotation.y = (t * TWO_PI) / period;
    }
  });

  return (
    <group ref={outerRef}>
      <group ref={rotorRef}>
        <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Starfield — preserved exactly as before (panning background layer).
// ---------------------------------------------------------------------------
const WideStarfield = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { positions, sizes } = useMemo(() => {
    const N = 320;
    const pos = new Float32Array(N * 3);
    const sz = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = -6 - Math.random() * 8;
      sz[i] = 0.6 + Math.random() * 1.6;
    }
    return { positions: pos, sizes: sz };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.x = Math.sin(t * 0.04) * 1.4;
    groupRef.current.position.y = Math.cos(t * 0.03) * 0.6;
    groupRef.current.rotation.z = t * 0.008;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={sizes.length} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          sizeAttenuation
          color="#F3ECDD"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

const FpsReporter = ({ report }: { report: (dt: number) => void }) => {
  const meterRef = useRef(new FpsMeter(60));
  useFrame((_, delta) => {
    meterRef.current.push(delta);
    report(delta);
    (window as unknown as { __mobiusFps?: number }).__mobiusFps = meterRef.current.avg();
  });
  return null;
};

const Scene = ({
  quality,
}: {
  quality: QualitySettings & { report: (dt: number) => void };
}) => {
  const { camera, size } = useThree();

  // Fit-to-view: the elongated Möbius has extents ≈ (R+W)·ELONG on X and
  // (R+W) on Y. Target ~75% of viewport width so the loop wraps around the
  // hero text with room to spare in the centre.
  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const halfWidth = (R + W) * ELONG * 1.35; // 1/0.75 padding
    const halfHeight = (R + W) * 1.55;
    const aspect = size.width / Math.max(1, size.height);
    const fovRad = (persp.fov * Math.PI) / 180;
    const zForHeight = halfHeight / Math.tan(fovRad / 2);
    const zForWidth = halfWidth / (Math.tan(fovRad / 2) * aspect);
    const z = Math.max(zForHeight, zForWidth);
    camera.position.set(0, 0.3, z);
    camera.lookAt(0, 0, 0);
    persp.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return (
    <>
      {/* Realistic ambient lighting — soft global fill + one directional
          key that reveals the twist as it rolls through the light. */}
      <ambientLight intensity={0.55} color="#c8d3e0" />
      <hemisphereLight intensity={0.35} color="#e2e8f2" groundColor="#0a0d14" />
      <directionalLight
        position={[6, 8, 5]}
        intensity={2.1}
        color="#fdf7e8"
        castShadow={false}
      />
      {/* Cool counter-fill from the opposite side so the far edge of the
          ribbon reads instead of falling into pure black. */}
      <directionalLight
        position={[-5, -2, 4]}
        intensity={0.55}
        color="#93a3b8"
        castShadow={false}
      />

      {quality.enableStarfield && <WideStarfield />}
      <MobiusMesh quality={quality} />
      <FpsReporter report={quality.report} />
    </>
  );
};

const LoadingIndicator = () => (
  <Html center>
    <div className="flex items-center gap-2 text-xs text-white/40 font-medium tracking-wider uppercase">
      <div className="w-1.5 h-1.5 rounded-full bg-[#F3D46C] animate-pulse" />
      Loading
    </div>
  </Html>
);

export const MobiusStrip = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [visible, setVisible] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const quality = useAdaptiveQuality();

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) return setHasWebGL(false);
    } catch {
      return setHasWebGL(false);
    }

    const onMove = (e: PointerEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let idleId: number | undefined;
    let toId: ReturnType<typeof setTimeout> | undefined;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => setShouldRender(true), { timeout: 1000 });
    } else {
      toId = setTimeout(() => setShouldRender(true), 100);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (toId) clearTimeout(toId);
    };
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [shouldRender]);

  if (!hasWebGL) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-50 pointer-events-none z-0" />
    );
  }

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {shouldRender && (
        <Canvas
          dpr={quality.dpr}
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0.3, 8], fov: 42 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.0;
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setHasWebGL(false);
            });
          }}
        >
          <Suspense fallback={<LoadingIndicator />}>
            <Scene quality={quality} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export default MobiusStrip;
