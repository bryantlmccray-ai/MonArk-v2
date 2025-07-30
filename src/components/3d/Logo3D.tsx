import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, Text3D, MeshDistortMaterial, Sphere, Ring } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface Logo3DProps {
  scale?: number;
  rotationSpeed?: number;
  floatIntensity?: number;
}

// 3D Logo Components
function LogoSphere() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <sphereGeometry args={[1.8, 64, 64]} />
      <MeshDistortMaterial
        color="#D4AF37"
        transparent
        opacity={0.3}
        distort={0.2}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function FloatingRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = state.clock.elapsedTime * 0.4;
      ring1Ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -state.clock.elapsedTime * 0.3;
      ring2Ref.current.rotation.z = state.clock.elapsedTime * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ring3Ref.current.rotation.z = -state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <ringGeometry args={[2.2, 2.5, 32]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          transparent 
          opacity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      <mesh ref={ring2Ref} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.8, 3.1, 32]} />
        <meshStandardMaterial 
          color="#3B82F6" 
          transparent 
          opacity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh ref={ring3Ref} position={[0, 0, 0]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <ringGeometry args={[3.4, 3.7, 32]} />
        <meshStandardMaterial 
          color="#60A5FA" 
          transparent 
          opacity={0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
    </>
  );
}

function CentralText() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.8}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          position={[-1.8, 0.2, 1]}
        >
          MonArk
          <meshStandardMaterial 
            color="#D4AF37"
            metalness={0.9}
            roughness={0.1}
          />
        </Text3D>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={0.1}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.01}
          position={[-1.2, -0.6, 1.2]}
        >
          Date well.
          <meshStandardMaterial 
            color="#FFFFFF"
            metalness={0.5}
            roughness={0.3}
          />
        </Text3D>
      </Float>
    </group>
  );
}

function ParticleField3D() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    const colors = new Float32Array(1000 * 3);
    
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      const isGold = Math.random() > 0.7;
      if (isGold) {
        colors[i * 3] = 0.831;
        colors[i * 3 + 1] = 0.686;
        colors[i * 3 + 2] = 0.216;
      } else {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.8;
      }
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        transparent
        opacity={0.6}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

export const Logo3D: React.FC<Logo3DProps> = ({ 
  scale = 1, 
  rotationSpeed = 1, 
  floatIntensity = 1 
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1}
          color="#D4AF37"
        />
        <pointLight 
          position={[-10, -10, -10]} 
          intensity={0.5}
          color="#3B82F6"
        />
        
        <group scale={scale}>
          <ParticleField3D />
          <LogoSphere />
          <FloatingRings />
          <CentralText />
        </group>
      </Canvas>
    </div>
  );
};

export default Logo3D;