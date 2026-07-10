import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

// ---------------------------------------------------------------------------
// A single, mathematically correct Möbius strip built from a parametric
// BufferGeometry surface with a properly stitched half-twist seam.
//
// Glossy PBR material · smooth blue→purple vertex-color gradient across the
// ribbon · slow constant rotation on Y with a whisper of X wobble.
// ---------------------------------------------------------------------------

const R = 1.6;
const ELONG = 1.9;
const W = 0.22;          // slim ribbon so the twist reads clearly
const U_SEGMENTS = 400;  // extra resolution across the twist
const V_SEGMENTS = 40;
const TWO_PI = Math.PI * 2;

const mouseTarget = { x: 0, y: 0 };

/**
 * Build a Möbius strip as an indexed BufferGeometry with a smooth vertex-
 * color gradient across u (loop progress).
 *
 * The last column (u = 2π) is intentionally NOT duplicated; the seam is
 * stitched with triangles connecting column (uSegs-1) → column 0 with v
 * flipped (j ↔ vSegs-j). This produces the characteristic Möbius half-
 * twist closure and computeVertexNormals yields continuous shading across
 * the join.
 */
function buildMobiusGeometry(
  uSegs: number,
  vSegs: number,
  radius: number,
  halfWidth: number,
  elongation: number,
  colorA: THREE.Color,
  colorB: THREE.Color,
  colorMid: THREE.Color,
): THREE.BufferGeometry {
  const uRes = uSegs;
  const vRes = vSegs + 1;
  const vertCount = uRes * vRes;

  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const colors = new Float32Array(vertCount * 3);

  const tmp = new THREE.Color();

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

      // Seamless cyclic gradient along the loop: A → mid → B → mid → A.
      const phase = i / uSegs;
      if (phase < 0.25)      tmp.copy(colorA).lerp(colorMid, phase * 4);
      else if (phase < 0.5)  tmp.copy(colorMid).lerp(colorB, (phase - 0.25) * 4);
      else if (phase < 0.75) tmp.copy(colorB).lerp(colorMid, (phase - 0.5) * 4);
      else                   tmp.copy(colorMid).lerp(colorA, (phase - 0.75) * 4);
      colors[idx * 3 + 0] = tmp.r;
      colors[idx * 3 + 1] = tmp.g;
      colors[idx * 3 + 2] = tmp.b;
    }
  }

  const indices: number[] = [];
  for (let j = 0; j < vSegs; j++) {
    for (let i = 0; i < uRes; i++) {
      const iNext = (i + 1) % uRes;
      const seam = i === uRes - 1;
      const jTop = j;
      const jBot = j + 1;
      const jTopNext = seam ? vSegs - jTop : jTop;
      const jBotNext = seam ? vSegs - jBot : jBot;

      const a = jTop * uRes + i;
      const b = jBot * uRes + i;
      const c = jTopNext * uRes + iNext;
      const d = jBotNext * uRes + iNext;

      indices.push(a, c, d, a, d, b);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}

type MobiusMeshProps = {
  quality: QualitySettings;
  primaryColor: string;
  secondaryColor: string;
  midColor: string;
  rotationSpeed: number; // revolutions per second
  mouseTilt: boolean;
};

const MobiusMesh = ({
  quality,
  primaryColor,
  secondaryColor,
  midColor,
  rotationSpeed,
  mouseTilt,
}: MobiusMeshProps) => {
  const outerRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.75);

  const [uSegs, vSegs] = useMemo(() => {
    if (quality.tier === 'high') return [U_SEGMENTS, V_SEGMENTS];
    if (quality.tier === 'mid') return [280, 28];
    return [200, 18];
  }, [quality.tier]);

  const geometry = useMemo(
    () =>
      buildMobiusGeometry(
        uSegs,
        vSegs,
        R,
        W,
        ELONG,
        new THREE.Color(primaryColor),
        new THREE.Color(secondaryColor),
        new THREE.Color(midColor),
      ),
    [uSegs, vSegs, primaryColor, secondaryColor, midColor],
  );


  // Glossy dielectric-leaning PBR: enough metalness to catch highlights as
  // the ribbon rolls through the light, low roughness for a polished sheen.
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.25,
        metalness: 0.7,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        side: THREE.DoubleSide,
        flatShading: false,
        envMapIntensity: 0.9,
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

    if (outerRef.current) {
      scaleRef.current += (1 - scaleRef.current) * Math.min(1, delta * 2);
      outerRef.current.scale.setScalar(scaleRef.current);

      // Horizontal "infinity" presentation: tilt strongly on X so we view
      // the loop nearly from above, giving it a wide, flat silhouette.
      const baseX = -1.15; // ~ -66°
      const baseY = 0.14;
      const wobble = Math.sin(t * 0.35) * 0.04;
      const mx = mouseTilt ? mouseTarget.y * 0.04 : 0;
      const my = mouseTilt ? mouseTarget.x * 0.06 : 0;
      const targetX = baseX + wobble + mx;
      const targetY = baseY + my;
      outerRef.current.rotation.x += (targetX - outerRef.current.rotation.x) * 0.04;
      outerRef.current.rotation.y += (targetY - outerRef.current.rotation.y) * 0.04;
    }

    if (rotorRef.current) {
      rotorRef.current.rotation.y = t * TWO_PI * rotationSpeed;
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
// Starfield — preserved (panning background layer).
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

type SceneProps = {
  quality: QualitySettings & { report: (dt: number) => void };
  primaryColor: string;
  secondaryColor: string;
  midColor: string;
  rotationSpeed: number;
  mouseTilt: boolean;
  cameraDrift: boolean;
};

const Scene = ({
  quality,
  primaryColor,
  secondaryColor,
  midColor,
  rotationSpeed,
  mouseTilt,
  cameraDrift,
}: SceneProps) => {
  const { camera, size } = useThree();
  const baseZRef = useRef(8);

  // Frame the tilted, flattened loop to roughly fill the canvas horizontally
  // while leaving generous vertical breathing room.
  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const halfWidth = (R + W) * ELONG * 1.5;
    const halfHeight = (R + W) * 1.8;
    const aspect = size.width / Math.max(1, size.height);
    const fovRad = (persp.fov * Math.PI) / 180;
    const zForHeight = halfHeight / Math.tan(fovRad / 2);
    const zForWidth = halfWidth / (Math.tan(fovRad / 2) * aspect);
    const z = Math.max(zForHeight, zForWidth);
    baseZRef.current = z;
    camera.position.set(0, 0.4, z);
    camera.lookAt(0, 0, 0);
    persp.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state) => {
    if (!cameraDrift) return;
    const t = state.clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.15) * 0.12;
    camera.position.y = 0.4 + Math.cos(t * 0.12) * 0.06;
    camera.position.z = baseZRef.current + Math.sin(t * 0.1) * 0.1;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#c8d3e0" />
      <hemisphereLight intensity={0.25} color="#e2e8f2" groundColor="#0a0d14" />
      <directionalLight position={[6, 8, 5]} intensity={1.6} color="#fdf7e8" />
      <directionalLight position={[-5, -2, 4]} intensity={0.5} color="#93a3b8" />
      <directionalLight position={[0, 2, -6]} intensity={1.2} color="#a78bfa" />

      <Environment preset="studio" />

      {quality.enableStarfield && <WideStarfield />}
      <MobiusMesh
        quality={quality}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        midColor={midColor}
        rotationSpeed={rotationSpeed}
        mouseTilt={mouseTilt}
      />
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

export type MobiusStripProps = {
  /** Gradient start color. Default: brand blue. */
  primaryColor?: string;
  /** Gradient end color. Default: brand purple. */
  secondaryColor?: string;
  /** Gradient mid-stop color (the highlight the twist passes through). Default: soft white. */
  midColor?: string;
  /** Full revolutions around Y axis per second. Default: 1/18 (~18s per turn). */
  rotationSpeed?: number;
  /** Whether the strip tilts subtly toward the cursor. Default: true. */
  mouseTilt?: boolean;
  /** Whether the camera drifts gently for parallax. Default: true. */
  cameraDrift?: boolean;
  /** Positioning wrapper class. Defaults to a full-bleed background layer. */
  containerClassName?: string;
};

export const MobiusStrip = ({
  primaryColor = '#3b82f6',
  secondaryColor = '#a855f7',
  midColor = '#f1f5ff',
  rotationSpeed = 1 / 18,
  mouseTilt = true,
  cameraDrift = true,
  containerClassName = 'absolute inset-0 pointer-events-none z-0',
}: MobiusStripProps = {}) => {
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
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-40 pointer-events-none z-0 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 0%, ${secondaryColor} 55%, transparent 75%)`,
        }}
      />
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
            <Scene
              quality={quality}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              midColor={midColor}
              rotationSpeed={rotationSpeed}
              mouseTilt={mouseTilt}
              cameraDrift={cameraDrift}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export default MobiusStrip;
