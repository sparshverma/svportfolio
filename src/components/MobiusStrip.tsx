import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

// ---------------------------------------------------------------------------
// Möbius ribbon — clean minimal spec:
//   • Exactly 120 instanced plates
//   • Plate geometry: 0.5 (W) × 0.02 (H) × 0.15 (D)
//   • Circular centerline, major radius R = 2.5
//   • Per-plate twist of θ/2 around the tangent axis → true 180° Möbius flip
// ---------------------------------------------------------------------------

const PLATE_COUNT = 120;
const R = 2.5;
const TWO_PI = Math.PI * 2;

// Palette — moody dark ribbon with warm gold accents
const SLATE = new THREE.Color('#2c4a48');
const CHARCOAL = new THREE.Color('#1a1c1e');
const BRONZE = new THREE.Color('#6b3f22');
const GOLD = new THREE.Color('#F3D46C');

// Cursor state for subtle parallax tilt.
const mouseTarget = { x: 0, y: 0 };

const MobiusMesh = ({ enableCursorTilt }: { enableCursorTilt: boolean }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0.6);

  // Flat, thin shingle: width along local X (0.5), height on Y (0.02), depth on Z (0.15).
  const geometry = useMemo(() => new THREE.BoxGeometry(0.5, 0.02, 0.15), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        metalness: 0.85,
        roughness: 0.4,
        vertexColors: true,
      }),
    [],
  );

  // Per-instance color tint (mostly slate/charcoal, sparse bronze/gold).
  const colors = useMemo(() => {
    const arr = new Float32Array(PLATE_COUNT * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < PLATE_COUNT; i++) {
      const roll = Math.random();
      let base: THREE.Color;
      if (roll < 0.6) base = SLATE;
      else if (roll < 0.85) base = CHARCOAL;
      else if (roll < 0.96) base = BRONZE;
      else base = GOLD;
      tmp.copy(CHARCOAL).lerp(base, 0.55 + Math.random() * 0.4);
      arr[i * 3 + 0] = tmp.r;
      arr[i * 3 + 1] = tmp.g;
      arr[i * 3 + 2] = tmp.b;
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const attr = new THREE.InstancedBufferAttribute(colors, 3);
    meshRef.current.instanceColor = attr;
    attr.needsUpdate = true;
  }, [colors]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Reusable scratch objects — no per-frame allocations.
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      scale: new THREE.Vector3(1, 1, 1),
      tangent: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      binormal: new THREE.Vector3(),
      twistedNormal: new THREE.Vector3(),
      twistedBinormal: new THREE.Vector3(),
      m: new THREE.Matrix4(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Entrance scale-in + fixed 3D presentation tilt.
    // Group tilt: X = -60° (tip back), Y = +20° (yaw).
    if (groupRef.current) {
      scaleRef.current += (1 - scaleRef.current) * Math.min(1, delta * 3);
      groupRef.current.scale.setScalar(scaleRef.current);

      const baseX = -Math.PI / 3;         // -60°
      const baseY = (20 * Math.PI) / 180; // +20°
      if (enableCursorTilt) {
        const targetX = baseX + mouseTarget.y * 0.1;
        const targetY = baseY + mouseTarget.x * 0.12;
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
      } else {
        groupRef.current.rotation.x += (baseX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (baseY - groupRef.current.rotation.y) * 0.05;
      }
    }

    const t = state.clock.getElapsedTime();
    const {
      pos, scale, tangent, normal, binormal,
      twistedNormal, twistedBinormal, m,
    } = scratch;

    for (let i = 0; i < PLATE_COUNT; i++) {
      // Per-plate angle around the loop, advancing continuously.
      const theta = (i / PLATE_COUNT) * TWO_PI + t * 0.2;
      const cT = Math.cos(theta);
      const sT = Math.sin(theta);

      // Centerline on the circle in the XY plane, radius R.
      pos.set(R * cT, R * sT, 0);

      // Frenet-style frame for a circle at this point.
      tangent.set(-sT, cT, 0);   // direction of travel
      normal.set(-cT, -sT, 0);   // radial inward
      binormal.set(0, 0, 1);     // world up

      // Möbius half-angle twist: α = θ / 2. Rotate the (normal, binormal)
      // cross-section frame around the tangent axis by α so it flips
      // exactly 180° over one full lap (θ: 0 → 2π ⇒ α: 0 → π).
      const alpha = theta / 2;
      const cA = Math.cos(alpha);
      const sA = Math.sin(alpha);

      twistedNormal.set(
        normal.x * cA + binormal.x * sA,
        normal.y * cA + binormal.y * sA,
        normal.z * cA + binormal.z * sA,
      );
      twistedBinormal.set(
        -normal.x * sA + binormal.x * cA,
        -normal.y * sA + binormal.y * cA,
        -normal.z * sA + binormal.z * cA,
      );

      // Compose basis so plate axes map to the ribbon frame:
      //   local X (length, 0.5) → tangent   — forward along the path
      //   local Y (thickness, 0.02) → twisted normal — flat face normal
      //   local Z (width, 0.15) → twisted binormal — across the ribbon
      m.makeBasis(tangent, twistedNormal, twistedBinormal);
      m.setPosition(pos);
      m.scale(scale);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, PLATE_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
};

const _UP = new THREE.Vector3(0, 0, 1);

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

  // Fit-to-view so the ribbon stays framed on portrait mobile and wide desktop.
  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const boundingR = R * 1.25;
    const aspect = size.width / Math.max(1, size.height);
    const fovRad = (persp.fov * Math.PI) / 180;
    const zForHeight = boundingR / Math.tan(fovRad / 2);
    const zForWidth = boundingR / (Math.tan(fovRad / 2) * aspect);
    const z = Math.max(zForHeight, zForWidth);
    camera.position.set(0, 0.2, z);
    camera.lookAt(0, 0, 0);
    persp.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return (
    <>
      {/* Clean minimal lighting: soft ambient + one sharp top-right-front key */}
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow={false}
      />

      {quality.enableStarfield && <WideStarfield />}
      <MobiusMesh enableCursorTilt={quality.enableCursorTilt} />
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
          camera={{ position: [0, 0.2, 6], fov: 45 }}
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
