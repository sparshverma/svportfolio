import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MobiusStripGeometry = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate Möbius strip geometry using parametric equations
  const geometry = useMemo(() => {
    const segments = 80;
    const width = 0.5;
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * Math.PI * 2;
      
      for (let j = -1; j <= 1; j += 0.5) {
        const v = j * width;
        
        // Möbius strip parametric equations
        const x = (1 + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
        const y = (1 + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
        const z = (v / 2) * Math.sin(u / 2);
        
        vertices.push(x, y, z);
      }
    }

    // Create faces
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < 4; j++) {
        const a = i * 5 + j;
        const b = i * 5 + j + 1;
        const c = (i + 1) * 5 + j + 1;
        const d = (i + 1) * 5 + j;

        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, []);

  // Gentle automatic rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#10b981"
        emissive="#34d399"
        emissiveIntensity={0.6}
        metalness={0.7}
        roughness={0.3}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

export const MobiusStrip = () => {
  const [shouldRender, setShouldRender] = useState(false);

  // Defer Three.js initialization to prevent forced reflow during initial paint
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setShouldRender(true), { timeout: 1000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(id);
    }
  }, []);

  if (!shouldRender) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-50 pointer-events-none z-0" />
    );
  }

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-50 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4ade80" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />
        <MobiusStripGeometry />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
};