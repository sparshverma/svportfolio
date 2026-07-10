import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

// Shared mouse state (normalized -1..1). Updated by a window listener so it
// works even when the canvas container is pointer-events-none.
const mouseTarget = { x: 0, y: 0, active: 0 };

const buildMobiusGeometry = () => {
  const R = 1;         // main radius
  const w = 0.35;      // half-width of the band
  const t = 0.06;      // thickness (tube offset)

  // Parametric surface: two "sheets" offset along the surface normal give the
  // band real thickness so it reads as a solid 3D object from any angle.
  const surface = (u: number, v: number, target: THREE.Vector3) => {
    const U = u * Math.PI * 2;
    // v in [0,1] -> map to [-w, w] for top sheet and back for bottom sheet,
    // with a thin rim so it forms a closed shell.
    const s = v < 0.5 ? 1 : -1;
    const local = (v < 0.5 ? v * 2 : (1 - v) * 2) * 2 - 1; // -1..1..-1
    const vv = local * w;

    // Base möbius point
    const cx = (R + (vv / 2) * Math.cos(U / 2)) * Math.cos(U);
    const cy = (R + (vv / 2) * Math.cos(U / 2)) * Math.sin(U);
    const cz = (vv / 2) * Math.sin(U / 2);

    // Approximate surface normal via finite differences
    const eps = 0.001;
    const p = new THREE.Vector3(cx, cy, cz);
    const du = new THREE.Vector3(
      (R + (vv / 2) * Math.cos((U + eps) / 2)) * Math.cos(U + eps) - cx,
      (R + (vv / 2) * Math.cos((U + eps) / 2)) * Math.sin(U + eps) - cy,
      (vv / 2) * Math.sin((U + eps) / 2) - cz,
    );
    const dv = new THREE.Vector3(
      (eps / 2) * Math.cos(U / 2) * Math.cos(U),
      (eps / 2) * Math.cos(U / 2) * Math.sin(U),
      (eps / 2) * Math.sin(U / 2),
    );
    const n = new THREE.Vector3().crossVectors(du, dv).normalize();

    target.set(p.x + n.x * t * s, p.y + n.y * t * s, p.z + n.z * t * s);
  };

  const geo = new ParametricGeometry(surface, 220, 40);
  geo.computeVertexNormals();
  return geo;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = viewMatrix * worldPos;
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uMouseStrength;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  void main() {
    // Traveling wave along U with a subtle secondary along V
    float wave = 0.5 + 0.5 * sin(vUv.x * 18.0 - uTime * 1.6);
    float wave2 = 0.5 + 0.5 * sin(vUv.y * 6.0 + uTime * 0.8);
    float mixer = clamp(wave * 0.7 + wave2 * 0.3, 0.0, 1.0);
    vec3 base = mix(uColorA, uColorB, mixer);

    // Fresnel rim
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.0);

    // Cursor proximity glow: project mouse (in NDC-ish space) onto world XY
    vec2 mp = uMouse * 2.0;
    float d = distance(vWorldPos.xy, mp);
    float hotspot = smoothstep(1.6, 0.0, d) * uMouseStrength;

    vec3 col = base * (0.55 + 0.35 * wave);
    col += base * fres * 1.4;
    col += mix(uColorA, uColorB, 0.5) * hotspot * 1.2;

    // Slight base emissive so it glows in the dark hero
    col += base * 0.15;

    gl_FragColor = vec4(col, 0.95);
  }
`;

const MobiusMesh = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => buildMobiusGeometry(), []);
  const scaleRef = useRef(0.6);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseStrength: { value: 0 },
      uColorA: { value: new THREE.Color('#22d3ee') },
      uColorB: { value: new THREE.Color('#a855f7') },
    }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = reducedMotion ? 0 : t;
      // Smooth mouse follow
      u.uMouse.value.x += (mouseTarget.x - u.uMouse.value.x) * 0.08;
      u.uMouse.value.y += (mouseTarget.y - u.uMouse.value.y) * 0.08;
      u.uMouseStrength.value += (mouseTarget.active - u.uMouseStrength.value) * 0.06;
    }
    if (meshRef.current) {
      // Entrance scale-in with overshoot
      const target = 1;
      scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 3);
      const s = scaleRef.current + Math.sin(Math.min(t, 1.2) * Math.PI) * 0.05;
      meshRef.current.scale.setScalar(s);

      // Baseline slow rotation + cursor-driven tilt
      const tiltX = reducedMotion ? 0 : mouseTarget.y * 0.35;
      const tiltY = reducedMotion ? 0 : mouseTarget.x * 0.55;
      meshRef.current.rotation.x += (tiltX + Math.sin(t * 0.15) * 0.1 - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (reducedMotion ? 0.001 : 0.004) + (tiltY - (meshRef.current.rotation.y % (Math.PI * 2))) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
};

const OrbitingLight = () => {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.6;
    ref.current.position.set(Math.cos(t) * 3, Math.sin(t * 0.8) * 2, Math.sin(t) * 3);
  });
  return <pointLight ref={ref} intensity={1.2} color="#a855f7" distance={10} />;
};

const Starfield = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = -2 - Math.random() * 4;
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#22d3ee"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const Scene = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 4);
  }, [camera]);
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#22d3ee" />
      <OrbitingLight />
      <Starfield />
      <MobiusMesh reducedMotion={reducedMotion} />
    </>
  );
};

export const MobiusStrip = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return setHasWebGL(false);
    } catch {
      return setHasWebGL(false);
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMq);

    const onMove = (e: PointerEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseTarget.active = 1;
    };
    const onLeave = () => { mouseTarget.active = 0; };
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
      mq.removeEventListener('change', onMq);
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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] max-w-[95vw] max-h-[95vw] opacity-70 pointer-events-none z-0"
    >
      {shouldRender && (
        <Canvas
          dpr={[1, 1.5]}
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0, 4], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setHasWebGL(false);
            });
          }}
        >
          <Scene reducedMotion={reducedMotion} />
        </Canvas>
      )}
    </div>
  );
};
