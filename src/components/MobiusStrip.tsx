import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

// Shared cursor state (normalized -1..1). Updated by a window listener.
const mouseTarget = { x: 0, y: 0, active: 0 };

// Palette from the Dribbble reference (Igor Backstrom — Möbius strip).
const COPPER_A = new THREE.Color('#905429');
const COPPER_B = new THREE.Color('#F3D46C');
const TEAL_A = new THREE.Color('#325755');
const TEAL_B = new THREE.Color('#576253');

// Möbius parametrization: strip of half-width w, main radius R.
const R = 1.35;
const HALF_W = 0.42;

function mobiusPoint(u: number, v: number, out: THREE.Vector3) {
  const c = Math.cos(u / 2);
  const s = Math.sin(u / 2);
  const rr = R + v * c;
  out.set(rr * Math.cos(u), rr * Math.sin(u), v * s);
}

function buildInstances(count: number) {
  const positions = new Float32Array(count * 3);
  const quats = new Float32Array(count * 4);
  const scales = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const p = new THREE.Vector3();
  const pu = new THREE.Vector3();
  const pv = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const bitangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const tmpColor = new THREE.Color();

  // Two rows of tiles across the band width so the strip reads as a filled ring.
  const rows = 2;
  const perRow = Math.max(1, Math.floor(count / rows));
  const total = perRow * rows;

  const rng = mulberry32(1337);

  for (let r = 0; r < rows; r++) {
    // v position within the band: two bands centered around ±HALF_W/2
    const vBase = (r === 0 ? -0.5 : 0.5) * HALF_W;
    for (let i = 0; i < perRow; i++) {
      const idx = r * perRow + i;
      const u = (i / perRow) * Math.PI * 2;

      // Jitter along v and slight radial jitter for scattered edge look
      const v = vBase + (rng() - 0.5) * HALF_W * 0.35;

      mobiusPoint(u, v, p);

      // Finite-difference frame
      const eps = 0.003;
      mobiusPoint(u + eps, v, pu);
      mobiusPoint(u, v + eps, pv);
      tangent.subVectors(pu, p).normalize();
      bitangent.subVectors(pv, p).normalize();
      normal.crossVectors(tangent, bitangent).normalize();
      // Re-orthogonalize bitangent so basis is clean
      bitangent.crossVectors(normal, tangent).normalize();

      // Build rotation matrix from basis: X=tangent, Y=bitangent, Z=normal
      m.makeBasis(tangent, bitangent, normal);
      q.setFromRotationMatrix(m);

      // Small random spin around the tile normal for the "scattered shingle" feel
      const spin = (rng() - 0.5) * 0.18; // ~±5°
      const spinQ = new THREE.Quaternion().setFromAxisAngle(normal, spin);
      q.multiply(spinQ);

      positions[idx * 3 + 0] = p.x;
      positions[idx * 3 + 1] = p.y;
      positions[idx * 3 + 2] = p.z;
      quats[idx * 4 + 0] = q.x;
      quats[idx * 4 + 1] = q.y;
      quats[idx * 4 + 2] = q.z;
      quats[idx * 4 + 3] = q.w;

      // Tile size: long along tangent, short across bitangent — thin shingles
      const sx = 0.11 + rng() * 0.03;
      const sy = HALF_W * 0.55 + rng() * 0.05;
      const sz = 1;
      scales[idx * 3 + 0] = sx;
      scales[idx * 3 + 1] = sy;
      scales[idx * 3 + 2] = sz;

      // Face color: front vs back of the twisted band via sign(cos(u/2))
      // The twist flips sides every full turn — use combined sign of cos(u/2) and row
      const side = Math.sign(Math.cos(u / 2)) * (r === 0 ? 1 : -1);
      const warm = side > 0;
      const a = warm ? COPPER_A : TEAL_A;
      const b = warm ? COPPER_B : TEAL_B;
      tmpColor.copy(a).lerp(b, rng());
      colors[idx * 3 + 0] = tmpColor.r;
      colors[idx * 3 + 1] = tmpColor.g;
      colors[idx * 3 + 2] = tmpColor.b;
    }
  }

  return { positions, quats, scales, colors, count: total };
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

const TiledMobius = ({
  tileCount,
  enableCursorTilt,
}: {
  tileCount: number;
  enableCursorTilt: boolean;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0.6);

  const { positions, quats, scales, colors, count } = useMemo(
    () => buildInstances(tileCount),
    [tileCount],
  );

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        metalness: 0.85,
        roughness: 0.38,
        side: THREE.DoubleSide,
        vertexColors: true,
      }),
    [],
  );

  // Apply per-instance matrices + colors once
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const colorArr = new THREE.InstancedBufferAttribute(colors, 3);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for (let i = 0; i < count; i++) {
      p.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      q.set(quats[i * 4], quats[i * 4 + 1], quats[i * 4 + 2], quats[i * 4 + 3]);
      s.set(scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2]);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute('color', colorArr);
    // Instanced meshes use `instanceColor` for per-instance tint
    mesh.instanceColor = colorArr;
  }, [positions, quats, scales, colors, count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Entrance
    scaleRef.current += (1 - scaleRef.current) * Math.min(1, delta * 3);
    groupRef.current.scale.setScalar(scaleRef.current);

    // Baseline slow rotation
    groupRef.current.rotation.y += delta * 0.28;

    // Cursor tilt
    if (enableCursorTilt) {
      const targetX = mouseTarget.y * 0.18;
      const targetZ = mouseTarget.x * 0.14;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        frustumCulled={false}
      />
    </group>
  );
};

const OrbitingLight = () => {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.5;
    ref.current.position.set(Math.cos(t) * 3.2, Math.sin(t * 0.7) * 1.6, Math.sin(t) * 3.2);
  });
  return <pointLight ref={ref} intensity={0.9} color="#F3D46C" distance={12} />;
};

const Starfield = ({ count = 160 }: { count?: number }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = -3 - Math.random() * 5;
    }
    return arr;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#F3ECDD"
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const FpsReporter = ({ report }: { report: (dt: number) => void }) => {
  const meterRef = useRef(new FpsMeter(60));
  useFrame((_, delta) => {
    meterRef.current.push(delta);
    report(delta);
    // expose for verification
    (window as unknown as { __mobiusFps?: number }).__mobiusFps = meterRef.current.avg();
  });
  return null;
};

const Scene = ({ quality }: { quality: QualitySettings & { report: (dt: number) => void } }) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 3.4);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return (
    <>
      <ambientLight intensity={0.18} />
      {/* Warm key light */}
      <pointLight position={[3, 2.5, 3.5]} intensity={1.6} color="#F3D46C" distance={14} />
      {/* Cool rim light */}
      <pointLight position={[-3.5, -1.5, -2]} intensity={1.1} color="#325755" distance={14} />
      {quality.enableOrbitLight && <OrbitingLight />}
      {quality.enableStarfield && <Starfield />}
      <TiledMobius tileCount={quality.tileCount} enableCursorTilt={quality.enableCursorTilt} />
      <FpsReporter report={quality.report} />
    </>
  );
};

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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] max-w-[95vw] max-h-[95vw] opacity-95 pointer-events-none z-0"
    >
      {shouldRender && (
        <Canvas
          dpr={quality.dpr}
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0, 3.4], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setHasWebGL(false);
            });
          }}
        >
          <Scene quality={quality} />
        </Canvas>
      )}
    </div>
  );
};
