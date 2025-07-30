import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating particles background
function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    const colors = new Float32Array(2000 * 3);
    
    for (let i = 0; i < 2000; i++) {
      // Random positions in a large sphere
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      // Gold and blue color variations
      const isGold = Math.random() > 0.6;
      if (isGold) {
        colors[i * 3] = 0.831; // Gold R
        colors[i * 3 + 1] = 0.686; // Gold G  
        colors[i * 3 + 2] = 0.216; // Gold B
      } else {
        colors[i * 3] = 0.2; // Blue R
        colors[i * 3 + 1] = 0.4; // Blue G
        colors[i * 3 + 2] = 0.8; // Blue B
      }
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.1;
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={1.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Floating geometric shapes
function FloatingGeometry() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-8, 4, -5]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[2, 2, 2]} />
          <MeshDistortMaterial
            color="#D4AF37"
            transparent
            opacity={0.3}
            distort={0.3}
            speed={2}
          />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[8, -3, -8]} rotation={[Math.PI / 4, 0, 0]}>
          <octahedronGeometry args={[1.5]} />
          <MeshDistortMaterial
            color="#3B82F6"
            transparent
            opacity={0.4}
            distort={0.2}
            speed={1.5}
          />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1.5} floatIntensity={2.5}>
        <mesh position={[0, 6, -10]} rotation={[0, Math.PI / 3, 0]}>
          <tetrahedronGeometry args={[1.2]} />
          <MeshDistortMaterial
            color="#D4AF37"
            transparent
            opacity={0.25}
            distort={0.4}
            speed={2.5}
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.8}>
        <mesh position={[-6, -4, -6]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <dodecahedronGeometry args={[1]} />
          <MeshDistortMaterial
            color="#60A5FA"
            transparent
            opacity={0.35}
            distort={0.3}
            speed={1.8}
          />
        </mesh>
      </Float>
    </>
  );
}

// Central pulsing sphere
function CentralSphere() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.setScalar(pulse);
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -15]}>
      <sphereGeometry args={[3, 64, 64]} />
      <MeshDistortMaterial
        color="#D4AF37"
        transparent
        opacity={0.15}
        distort={0.4}
        speed={1.5}
        roughness={0.4}
      />
    </mesh>
  );
}

export const Hero3DBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#D4AF37" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
        
        <ParticleField />
        <FloatingGeometry />
        <CentralSphere />
      </Canvas>
    </div>
  );
};