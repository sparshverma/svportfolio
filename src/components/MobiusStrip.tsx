import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, N8AO, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

export type LightingPreset = 'studio-soft' | 'warm-rim' | 'cool-fill';

const PRESET_LABELS: Record<LightingPreset, string> = {
  'studio-soft': 'Studio Soft',
  'warm-rim': 'Warm Rim',
  'cool-fill': 'Cool Fill',
};


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

const MobiusMesh = ({
  finalScale = 1,
  phase = 0,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  widthOffset = 0,
}: {
  enableCursorTilt?: boolean;
  finalScale?: number;
  phase?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  /** Lateral offset along the ribbon's local width (twisted binormal) so
   *  multiple rings become parallel tracks of one wider Möbius surface. */
  widthOffset?: number;
}) => {



  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0.6 * finalScale);

  // Flat, thin shingle: width along local X (0.5), height on Y (0.02), depth on Z (0.15).
  const geometry = useMemo(() => new THREE.BoxGeometry(0.5, 0.02, 0.15), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        metalness: 1.0,
        roughness: 0.65,
        envMapIntensity: 1.1,
        clearcoat: 0.15,
        clearcoatRoughness: 0.85,
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
      basis: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
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
      scaleRef.current += (finalScale - scaleRef.current) * Math.min(1, delta * 3);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    const t = state.clock.getElapsedTime();
    const {
      pos, scale, tangent, normal, binormal,
      twistedNormal, twistedBinormal, basis, quat, m,
    } = scratch;

    for (let i = 0; i < PLATE_COUNT; i++) {
      // Per-plate angle around the loop, advancing continuously.
      const theta = (i / PLATE_COUNT) * TWO_PI + t * 0.2 + phase;
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

      // Lateral offset along the twisted binormal — this shifts the plate
      // sideways across the ribbon's width, so a stack of rings with
      // different widthOffsets forms parallel tracks of one Möbius surface.
      if (widthOffset !== 0) {
        pos.x += twistedBinormal.x * widthOffset;
        pos.y += twistedBinormal.y * widthOffset;
        pos.z += twistedBinormal.z * widthOffset;
      }

      // Compose basis so plate axes map to the ribbon frame:
      //   local X (length, 0.5) → tangent   — forward along the path
      //   local Y (thickness, 0.02) → twisted normal — flat face normal
      //   local Z (width, 0.15) → twisted binormal — across the ribbon
      basis.makeBasis(tangent, twistedNormal, twistedBinormal);
      quat.setFromRotationMatrix(basis);
      m.compose(pos, quat, scale);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });



  // Nested groups: outer positions this link in the chain and applies the
  // perpendicular alternation (so adjacent rings interlock); inner is the
  // scaling/tilting group that animates on mount.
  return (
    <group position={position} rotation={rotation}>

      <group ref={groupRef}>
        <instancedMesh
          ref={meshRef}
          args={[geometry, material, PLATE_COUNT]}
          frustumCulled={false}
          castShadow
          receiveShadow
        />

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

const Lights = ({ preset }: { preset: LightingPreset }) => {
  // Each preset drives environment intensity, ambient tone, and a three-point
  // rig. The key light casts a soft PCF shadow with a small bias to avoid
  // acne on the thin plates.
  const cfg = useMemo(() => {
    switch (preset) {
      case 'warm-rim':
        return {
          env: 'sunset' as const,
          envIntensity: 0.7,
          ambient: { color: '#3d2a1a', intensity: 0.2 },
          key: { pos: [6, 7, 5] as const, color: '#ffb26b', intensity: 2.2 },
          fill: { pos: [-5, 2, 3] as const, color: '#4a2a1a', intensity: 0.4 },
          rim: { pos: [-2, 4, -6] as const, color: '#ffd7a8', intensity: 1.4 },
        };
      case 'cool-fill':
        return {
          env: 'dawn' as const,
          envIntensity: 0.9,
          ambient: { color: '#c8d6e6', intensity: 0.35 },
          key: { pos: [5, 8, 4] as const, color: '#eaf2ff', intensity: 1.4 },
          fill: { pos: [-6, 3, 4] as const, color: '#8ab6ff', intensity: 1.1 },
          rim: { pos: [1, 4, -6] as const, color: '#b8d0ff', intensity: 0.7 },
        };
      case 'studio-soft':
      default:
        return {
          env: 'apartment' as const,
          envIntensity: 0.85,
          ambient: { color: '#f4efe6', intensity: 0.3 },
          key: { pos: [5, 8, 5] as const, color: '#fff2d6', intensity: 1.6 },
          fill: { pos: [-6, 3, 2] as const, color: '#b8cfe6', intensity: 0.7 },
          rim: { pos: [0, 4, -6] as const, color: '#ffffff', intensity: 0.5 },
        };
    }
  }, [preset]);

  return (
    <>
      <Environment preset={cfg.env} background={false} environmentIntensity={cfg.envIntensity} />
      <ambientLight intensity={cfg.ambient.intensity} color={cfg.ambient.color} />
      <directionalLight
        position={cfg.key.pos as unknown as [number, number, number]}
        intensity={cfg.key.intensity}
        color={cfg.key.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
        shadow-radius={8}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight
        position={cfg.fill.pos as unknown as [number, number, number]}
        intensity={cfg.fill.intensity}
        color={cfg.fill.color}
      />
      <directionalLight
        position={cfg.rim.pos as unknown as [number, number, number]}
        intensity={cfg.rim.intensity}
        color={cfg.rim.color}
      />
    </>
  );
};

const Scene = ({
  quality,
  preset,
}: {
  quality: QualitySettings & { report: (dt: number) => void };
  preset: LightingPreset;
}) => {
  const { camera, size } = useThree();

  const STRIP_SCALE = 0.75;
  const ringRadius = R * STRIP_SCALE;
  const chainTiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);


  const strips = useMemo(() => {
    // Five rings that share centreline, orientation, and phase — but each is
    // shifted laterally along the ribbon's twisted binormal. Together they
    // read as a single wider Möbius strip made of five parallel tracks that
    // continuously flip 180° over one lap.
    const N = 5;
    const trackSpacing = 0.17; // width between adjacent tracks
    return Array.from({ length: N }, (_, i) => {
      const widthOffset = (i - (N - 1) / 2) * trackSpacing;
      return {
        phase: 0,
        rotation: [0, 0, 0] as [number, number, number],
        position: [0, 0, 0] as [number, number, number],
        widthOffset,
      };
    });
  }, []);



  // Fit-to-view: bounding sphere of a single ring (all rings share centre).
  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const halfExtent = ringRadius * 1.4;
    const aspect = size.width / Math.max(1, size.height);
    const fovRad = (persp.fov * Math.PI) / 180;
    const zForHeight = halfExtent / Math.tan(fovRad / 2);
    const zForWidth = halfExtent / (Math.tan(fovRad / 2) * aspect);
    const z = Math.max(zForHeight, zForWidth);
    camera.position.set(0, 0.2, z);
    camera.lookAt(0, 0, 0);
    persp.updateProjectionMatrix();
  }, [camera, size.width, size.height, ringRadius]);

  // Shared presentation tilt + cursor parallax on the outer group; inner
  // spin group rotates all rings together as a single composite.
  useFrame((_, delta) => {
    const g = chainTiltRef.current;
    if (g) {
      const baseX = -Math.PI / 3;         // -60°
      const baseY = (20 * Math.PI) / 180; // +20°
      if (quality.enableCursorTilt) {
        const targetX = baseX + mouseTarget.y * 0.08;
        const targetY = baseY + mouseTarget.x * 0.1;
        g.rotation.x += (targetX - g.rotation.x) * 0.05;
        g.rotation.y += (targetY - g.rotation.y) * 0.05;
      } else {
        g.rotation.x += (baseX - g.rotation.x) * 0.05;
        g.rotation.y += (baseY - g.rotation.y) * 0.05;
      }
    }
    const s = spinRef.current;
    if (s) {
      s.rotation.y += delta * 0.25;
      s.rotation.x += delta * 0.08;
    }
  });

  return (
    <>
      {/* Soft indoor HDRI — diffuse reflections for a brushed matte look. */}
      <Environment preset="apartment" background={false} />

      {/* Natural three-point lighting: warm key from upper right, soft cool
          fill from the left, and a subtle rim from behind for depth. */}
      <ambientLight intensity={0.25} color="#f4efe6" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.6}
        color="#ffe6c2"
        castShadow={false}
      />
      <directionalLight
        position={[-6, 3, 2]}
        intensity={0.7}
        color="#b8cfe6"
        castShadow={false}
      />
      <directionalLight
        position={[0, 4, -6]}
        intensity={0.5}
        color="#ffffff"
        castShadow={false}
      />



      {quality.enableStarfield && <WideStarfield />}
      <group ref={chainTiltRef}>
        <group ref={spinRef}>
          {strips.map((s, i) => (
            <MobiusMesh
              key={i}
              enableCursorTilt={quality.enableCursorTilt}
              finalScale={STRIP_SCALE}
              phase={s.phase}
              rotation={s.rotation}
              position={s.position}
              widthOffset={s.widthOffset}
            />

          ))}
        </group>
      </group>
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
  );
};

export default MobiusStrip;
