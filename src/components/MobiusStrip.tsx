import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

// Shared cursor state (normalized -1..1).
const mouseTarget = { x: 0, y: 0, active: 0 };

// Palette — Igor Backstrom Möbius reference.
const BG = '#010101';
const BRONZE = new THREE.Color('#563218');
const TEAL = new THREE.Color('#325755');
const GOLD = new THREE.Color('#F3D46C');
const BRONZE_DEEP = new THREE.Color('#2a1a0d');
const TEAL_DEEP = new THREE.Color('#1a2c2b');

// Möbius parameters.
const R = 1.35;      // main radius
const HALF_W = 0.42; // half band-width

function mobiusPoint(u: number, v: number, out: THREE.Vector3) {
  const c = Math.cos(u / 2);
  const s = Math.sin(u / 2);
  const rr = R + v * c;
  out.set(rr * Math.cos(u), rr * Math.sin(u), v * s);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build instance transforms + colors for a Möbius strip made of tightly
 * packed rectangular BLOCKS. Two rows across the width, N segments around.
 */
function buildInstances(segments: number) {
  const rows = 2;
  const count = segments * rows;

  const matrices = new Float32Array(count * 16);
  const colors = new Float32Array(count * 3);

  const p = new THREE.Vector3();
  const pu = new THREE.Vector3();
  const pv = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const bitangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  const rng = mulberry32(9173);

  // Tile size — width along the tangent direction chosen to just cover the
  // circumference (tight packing) with a subtle gap.
  const circumference = 2 * Math.PI * R;
  const tileTangential = (circumference / segments) * 0.92;
  const tileWidth = HALF_W * 0.92; // across the band (one row = half)

  for (let r = 0; r < rows; r++) {
    const vCenter = (r === 0 ? -0.5 : 0.5) * HALF_W;
    for (let i = 0; i < segments; i++) {
      const idx = r * segments + i;
      const u = (i / segments) * Math.PI * 2;

      mobiusPoint(u, vCenter, p);

      // Local frame via finite differences
      const eps = 0.003;
      mobiusPoint(u + eps, vCenter, pu);
      mobiusPoint(u, vCenter + eps, pv);
      tangent.subVectors(pu, p).normalize();
      bitangent.subVectors(pv, p).normalize();
      normal.crossVectors(tangent, bitangent).normalize();
      bitangent.crossVectors(normal, tangent).normalize();

      m.makeBasis(tangent, bitangent, normal);
      q.setFromRotationMatrix(m);

      // Tiny random spin around the tile normal for organic segmentation
      const spin = (rng() - 0.5) * 0.06;
      const spinQ = new THREE.Quaternion().setFromAxisAngle(normal, spin);
      q.multiply(spinQ);

      // Slight per-tile scale jitter
      const jitter = 0.94 + rng() * 0.12;
      scale.set(
        tileTangential * jitter,
        tileWidth * (0.9 + rng() * 0.15),
        0.035 + rng() * 0.02, // block thickness
      );

      m.compose(p, q, scale);
      m.toArray(matrices, idx * 16);

      // Face color: the twist means sign(cos(u/2)) tracks which "side" faces
      // outward. Combine with row so both faces get their own palette.
      const side = Math.sign(Math.cos(u / 2)) * (r === 0 ? 1 : -1);
      const warm = side > 0;
      const base = warm ? BRONZE : TEAL;
      const deep = warm ? BRONZE_DEEP : TEAL_DEEP;
      const highlight = warm ? GOLD : TEAL;
      const t1 = rng();
      const t2 = rng() * 0.35;
      tmpColor.copy(deep).lerp(base, t1).lerp(highlight, t2);
      colors[idx * 3 + 0] = tmpColor.r;
      colors[idx * 3 + 1] = tmpColor.g;
      colors[idx * 3 + 2] = tmpColor.b;
    }
  }

  return { matrices, colors, count };
}

const MobiusMesh = ({
  segments,
  enableCursorTilt,
}: {
  segments: number;
  enableCursorTilt: boolean;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0.6);

  const { matrices, colors, count } = useMemo(() => buildInstances(segments), [segments]);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        metalness: 0.75,
        roughness: 0.42,
        envMapIntensity: 1.6,
        vertexColors: true,
      }),
    [],
  );

  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.fromArray(matrices, i * 16);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
    mesh.instanceColor = colorAttr;
    colorAttr.needsUpdate = true;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [matrices, colors, count, geometry, material]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Entrance scale-in
    scaleRef.current += (1 - scaleRef.current) * Math.min(1, delta * 3);
    groupRef.current.scale.setScalar(scaleRef.current);

    // Continuous hypnotic rotation — tilt slightly on X so ring reads as 3D
    groupRef.current.rotation.y += delta * 0.32;
    const baseTiltX = Math.sin(t * 0.15) * 0.12 - 0.25;

    if (enableCursorTilt) {
      const targetX = baseTiltX + mouseTarget.y * 0.18;
      const targetZ = mouseTarget.x * 0.14;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.05;
    } else {
      groupRef.current.rotation.x += (baseTiltX - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      />
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
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.4, 3.6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Segments scale with tier: high=140, mid=100, low=64 (× 2 rows)
  const segments =
    quality.tier === 'high' ? 140 : quality.tier === 'mid' ? 100 : 64;

  return (
    <>
      {/* Custom studio environment — provides reflections for metallic tiles */}
      <Environment resolution={256} frames={1} background={false}>
        {/* Warm key */}
        <Lightformer
          form="rect"
          intensity={6}
          color="#F3D46C"
          position={[3, 3, 4]}
          rotation={[0, -Math.PI / 4, 0]}
          scale={[4, 4, 1]}
        />
        {/* Gold accent */}
        <Lightformer
          form="ring"
          intensity={3}
          color="#F3D46C"
          position={[0, 2, 3]}
          scale={[2, 2, 1]}
        />
        {/* Cool teal rim */}
        <Lightformer
          form="rect"
          intensity={3}
          color="#325755"
          position={[-4, -1, -3]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[4, 3, 1]}
        />
        {/* Bronze underglow */}
        <Lightformer
          form="rect"
          intensity={2}
          color="#563218"
          position={[0, -3, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[5, 3, 1]}
        />
      </Environment>

      {/* Moody ambient — deep shadows preserved */}
      <ambientLight intensity={0.18} color="#2a1e12" />

      {/* Directional key light for crisp specular edges */}
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.4}
        color="#F3D46C"
      />

      {/* Cool rim from behind */}
      <directionalLight
        position={[-4, -2, -4]}
        intensity={0.6}
        color="#325755"
      />

      <MobiusMesh segments={segments} enableCursorTilt={quality.enableCursorTilt} />
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
      mouseTarget.active = 1;
    };
    const onLeave = () => {
      mouseTarget.active = 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    let idleId: number | undefined;
    let toId: ReturnType<typeof setTimeout> | undefined;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => setShouldRender(true), { timeout: 1000 });
    } else {
      toId = setTimeout(() => setShouldRender(true), 100);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
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
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
      aria-hidden="true"
    >
      <div className="w-full h-full max-w-[900px] max-h-[900px] aspect-square">
        {shouldRender && (
          <Canvas
            dpr={quality.dpr}
            frameloop={visible ? 'always' : 'never'}
            camera={{ position: [0, 0.4, 3.6], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.05;
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
    </div>
  );
};

export default MobiusStrip;
