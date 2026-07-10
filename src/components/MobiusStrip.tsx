import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useAdaptiveQuality, type QualitySettings } from '@/lib/perf/useAdaptiveQuality';
import { FpsMeter } from '@/lib/perf/fpsMeter';

// Shared cursor state (normalized -1..1).
const mouseTarget = { x: 0, y: 0, active: 0 };

// Palette — deep charcoal / slate-teal with bronze + gold accents
const SLATE_TEAL = new THREE.Color('#325755');
const CHARCOAL = new THREE.Color('#141618');
const BRONZE = new THREE.Color('#563218');
const GOLD = new THREE.Color('#F3D46C');
const DEEP_TEAL = new THREE.Color('#1a2c2b');

// Möbius parameters — R = major radius of loop, W = half band-width
const R = 1.55;
const W = 0.62;

/**
 * Parametric Möbius strip centerline:
 *   x = (R + w·cos(θ/2)) · cos(θ)
 *   y = (R + w·cos(θ/2)) · sin(θ)
 *   z =  w·sin(θ/2)
 * A single full revolution θ ∈ [0, 2π] yields the classic half-twist —
 * following a point around returns it to the opposite side; two circuits
 * bring it home.
 */
function mobiusAt(theta: number, w: number, out: THREE.Vector3) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const rr = R + w * c;
  out.set(rr * Math.cos(theta), rr * Math.sin(theta), w * s);
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
 * Precompute per-instance metadata: base θ offset, cross-section w offset
 * (two rails of plates riding the strip), scale jitter, tint.
 */
function buildInstanceData(segments: number) {
  const rows = 2;
  const count = segments * rows;

  const baseTheta = new Float32Array(count);
  const wOffset = new Float32Array(count);
  const spin = new Float32Array(count);
  const scaleX = new Float32Array(count);
  const scaleY = new Float32Array(count);
  const scaleZ = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const tmpColor = new THREE.Color();
  const rng = mulberry32(0x51ad);

  // Approximate arc length: 2πR — tile length picked so plates pack tightly.
  // Sleek shingles: thinner (Z), wider across the ribbon (Y), shorter along
  // the travel direction (X) so the loop reads as a continuous scaled track.
  const circumference = 2 * Math.PI * R;
  const plateLen = (circumference / segments) * 0.98;
  const plateWid = W * 0.98;

  for (let r = 0; r < rows; r++) {
    const wCenter = (r === 0 ? -0.5 : 0.5) * W;
    for (let i = 0; i < segments; i++) {
      const idx = r * segments + i;
      baseTheta[idx] = (i / segments) * Math.PI * 2;
      wOffset[idx] = wCenter;
      spin[idx] = (rng() - 0.5) * 0.02;

      const jx = 0.97 + rng() * 0.06;
      scaleX[idx] = plateLen * jx;
      scaleY[idx] = plateWid * (0.94 + rng() * 0.08);
      scaleZ[idx] = 0.055 + rng() * 0.02;

      // Distribute colors: mostly slate-teal + charcoal, sparse bronze/gold
      const roll = rng();
      let base: THREE.Color;
      if (roll < 0.55) base = SLATE_TEAL;
      else if (roll < 0.82) base = CHARCOAL;
      else if (roll < 0.94) base = BRONZE;
      else base = GOLD;

      tmpColor.copy(DEEP_TEAL).lerp(base, 0.55 + rng() * 0.45);
      colors[idx * 3 + 0] = tmpColor.r;
      colors[idx * 3 + 1] = tmpColor.g;
      colors[idx * 3 + 2] = tmpColor.b;
    }
  }

  return { baseTheta, wOffset, spin, scaleX, scaleY, scaleZ, colors, count };
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

  const data = useMemo(() => buildInstanceData(segments), [segments]);
  const { count, colors } = data;

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.62,
      envMapIntensity: 2.1,
      vertexColors: true,
    });

    // View-angle-driven metalness/roughness. Fresnel term (1 - N·V) pushes
    // metalness up and roughness down at grazing angles so plate edges
    // catch crisp specular highlights, while face-on pixels stay deep and
    // matte for moody contrast behind the hero text.
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         {
           float _ndv = clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0);
           float _fres = pow(1.0 - _ndv, 3.0);
           roughnessFactor = mix(roughnessFactor, 0.12, _fres * 0.85);
         }`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
         {
           float _ndv2 = clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0);
           float _fres2 = pow(1.0 - _ndv2, 3.0);
           metalnessFactor = mix(metalnessFactor, 1.0, _fres2 * 0.9);
         }`,
      );
    };
    return mat;
  }, []);

  // Per-instance colors
  useEffect(() => {
    if (!meshRef.current) return;
    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
    meshRef.current.instanceColor = colorAttr;
    colorAttr.needsUpdate = true;
  }, [colors]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Reusable scratch objects — zero per-frame allocations
  const scratch = useMemo(
    () => ({
      p: new THREE.Vector3(),
      pNext: new THREE.Vector3(),
      pWide: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      bitangent: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      spinQ: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const mesh = meshRef.current;
    if (!mesh) return;

    // Entrance scale-in — group otherwise stationary on primary axes.
    if (groupRef.current) {
      scaleRef.current += (1 - scaleRef.current) * Math.min(1, delta * 3);
      groupRef.current.scale.setScalar(scaleRef.current);

      // Fixed 3D presentation tilt: back on X (~ -52°) + yaw on Y (~ +20°)
      // so the viewer sees depth, perspective, and the signature half-twist.
      const baseTiltX = -0.9;
      const baseTiltY = 0.35;
      if (enableCursorTilt) {
        const targetX = baseTiltX + mouseTarget.y * 0.12;
        const targetY = baseTiltY + mouseTarget.x * 0.14;
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
      } else {
        groupRef.current.rotation.x += (baseTiltX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (baseTiltY - groupRef.current.rotation.y) * 0.05;
      }
    }

    // Global conveyor offset — advances every instance's θ.
    const flow = t * 0.24;
    const TWO_PI = Math.PI * 2;
    const eps = 0.004;

    const {
      p, pNext, pWide, tangent, bitangent, normal,
      m, q, spinQ, scale,
    } = scratch;

    for (let i = 0; i < count; i++) {
      // Progress wraps seamlessly via modulo — infinite loop.
      const theta = (data.baseTheta[i] + flow) % TWO_PI;
      const w = data.wOffset[i];
      const halfT = theta * 0.5;
      const cT = Math.cos(theta);
      const sT = Math.sin(theta);
      const cH = Math.cos(halfT);
      const sH = Math.sin(halfT);

      // Circular centerline (radius R) in the XY plane.
      // Tangent runs along the direction of travel.
      tangent.set(-sT, cT, 0);
      // Radial outward direction in the ring's plane.
      const radX = cT, radY = sT;
      // Frame's "bitangent" (across-strip) starts as radial-outward and
      // rotates around the tangent by θ/2 → after one lap (θ = 2π) the
      // bitangent has flipped exactly 180°: the defining Möbius half-twist.
      bitangent.set(radX * cH, radY * cH, sH);
      normal.crossVectors(tangent, bitangent).normalize();

      // Position: base ring point + across-strip offset along the twisted
      // bitangent. This carries the plate rails through the twist.
      p.set(R * cT + bitangent.x * w, R * sT + bitangent.y * w, bitangent.z * w);

      m.makeBasis(tangent, bitangent, normal);
      q.setFromRotationMatrix(m);
      spinQ.setFromAxisAngle(normal, data.spin[i]);
      q.multiply(spinQ);

      scale.set(data.scaleX[i], data.scaleY[i], data.scaleZ[i]);
      m.compose(p, q, scale);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
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

const FpsReporter = ({ report }: { report: (dt: number) => void }) => {
  const meterRef = useRef(new FpsMeter(60));
  useFrame((_, delta) => {
    meterRef.current.push(delta);
    report(delta);
    (window as unknown as { __mobiusFps?: number }).__mobiusFps = meterRef.current.avg();
  });
  return null;
};

/** Wide starfield spanning well beyond the Möbius bounds. */
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

const Scene = ({
  quality,
}: {
  quality: QualitySettings & { report: (dt: number) => void };
}) => {
  const { camera, size } = useThree();

  // Fit-to-view: bounding radius ≈ R + W. Scales the visible Möbius so it
  // stays perfectly framed on portrait mobile and wide desktop.
  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const fill = 0.72;
    const boundingR = (R + W) / fill;
    const aspect = size.width / Math.max(1, size.height);
    const fovRad = (persp.fov * Math.PI) / 180;
    const zForHeight = boundingR / Math.tan(fovRad / 2);
    const zForWidth = boundingR / (Math.tan(fovRad / 2) * aspect);
    const z = Math.max(zForHeight, zForWidth);
    camera.position.set(0, 0.2, z);
    camera.lookAt(0, 0, 0);
    persp.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // 200–300 plates target: high=280 (140×2), mid=200 (100×2), low=140 (70×2)
  const segments =
    quality.tier === 'high' ? 140 : quality.tier === 'mid' ? 100 : 70;

  return (
    <>

      {/* HDRI environment — provides real-world specular reflections that
          catch crisply on the beveled plate edges as they crawl. */}
      <Environment preset="studio" background={false} resolution={512} />

      {/* Overlay lightformers baked into scene.environment for warm gold
          rim highlights on top of the HDRI base. */}
      <Environment resolution={256} frames={1} background={false}>
        <Lightformer
          form="rect"
          intensity={5}
          color="#F3D46C"
          position={[3, 3, 4]}
          rotation={[0, -Math.PI / 4, 0]}
          scale={[4, 4, 1]}
        />
        <Lightformer
          form="ring"
          intensity={2.5}
          color="#F3D46C"
          position={[0, 2, 3]}
          scale={[2, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#325755"
          position={[-4, -1, -3]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[4, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#563218"
          position={[0, -3, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[5, 3, 1]}
        />
      </Environment>

      <ambientLight intensity={0.75} color="#4a5c5c" />

      {/* Sharp oblique key — intense gold highlights on plate edges */}
      <directionalLight
        position={[7, 5, 5]}
        intensity={5.5}
        color="#F3D46C"
        castShadow={false}
      />

      {/* Balanced counter-key on the opposite (right) side so the whole
          ribbon reads, not just the bottom-left. */}
      <directionalLight
        position={[-6, 3, 4]}
        intensity={3.8}
        color="#F3ECDD"
        castShadow={false}
      />

      {/* Edge-grazing fill for crisp specular on the opposite rim */}
      <directionalLight
        position={[-3, 2, 6]}
        intensity={2.4}
        color="#F3ECDD"
        castShadow={false}
      />

      {/* Cool rim from behind for silhouette */}
      <directionalLight
        position={[-4, -2, -4]}
        intensity={1.8}
        color="#7ab0aa"
      />

      {/* Warm underlight to lift the far-right section out of darkness */}
      <directionalLight
        position={[5, -3, 3]}
        intensity={1.6}
        color="#F3D46C"
      />

      <pointLight position={[0, -1, 4]} intensity={1.2} color="#F3D46C" distance={10} decay={1.5} />

      {quality.enableStarfield && <WideStarfield />}
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
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {shouldRender && (
        <Canvas
          dpr={quality.dpr}
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0.2, 4], fov: 45 }}
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
