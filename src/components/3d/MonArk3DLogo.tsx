import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface MonArk3DLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

// 3D Logo Core Components
function LogoSphere() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      // Add pulsing effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ref.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.3]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <MeshDistortMaterial
        color="#D4AF37"
        transparent
        opacity={0.4}
        distort={0.2}
        speed={2}
        roughness={0.1}
        metalness={0.9}
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
      ring3Ref.current.rotation.z = -state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          transparent 
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      <mesh ref={ring2Ref} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.4, 1.6, 32]} />
        <meshStandardMaterial 
          color="#3B82F6" 
          transparent 
          opacity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={ring3Ref} position={[0, 0, 0]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <ringGeometry args={[1.7, 1.9, 32]} />
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

function FloatingOrbs() {
  const orb1Ref = useRef<THREE.Mesh>(null);
  const orb2Ref = useRef<THREE.Mesh>(null);
  const orb3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (orb1Ref.current) {
      orb1Ref.current.position.x = Math.cos(time * 0.8) * 2;
      orb1Ref.current.position.y = Math.sin(time * 0.6) * 1.5;
      orb1Ref.current.position.z = Math.sin(time * 0.4) * 0.5;
    }
    
    if (orb2Ref.current) {
      orb2Ref.current.position.x = Math.sin(time * 0.7) * -1.8;
      orb2Ref.current.position.y = Math.cos(time * 0.9) * 1.2;
      orb2Ref.current.position.z = Math.cos(time * 0.5) * 0.8;
    }
    
    if (orb3Ref.current) {
      orb3Ref.current.position.x = Math.cos(time * 0.5 + Math.PI) * 1.5;
      orb3Ref.current.position.y = Math.sin(time * 0.8 + Math.PI) * -1;
      orb3Ref.current.position.z = Math.sin(time * 0.6) * -0.3;
    }
  });

  return (
    <>
      <mesh ref={orb1Ref}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#D4AF37"
          metalness={1}
          roughness={0}
          emissive="#D4AF37"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh ref={orb2Ref}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          color="#3B82F6"
          metalness={1}
          roughness={0}
          emissive="#3B82F6"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh ref={orb3Ref}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color="#60A5FA"
          metalness={1}
          roughness={0}
          emissive="#60A5FA"
          emissiveIntensity={0.15}
        />
      </mesh>
    </>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    const colors = new Float32Array(500 * 3);
    
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      const isGold = Math.random() > 0.6;
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
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
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
        size={0.03}
        transparent
        opacity={0.8}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

export const MonArk3DLogo: React.FC<MonArk3DLogoProps> = ({ 
  size = 'lg',
  className = '',
  clickable = false,
  onClick
}) => {
  const sizeClasses = {
    sm: 'h-32 w-32',
    md: 'h-40 w-40', 
    lg: 'h-48 w-48',
    xl: 'h-64 w-64'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} ${clickable ? 'cursor-pointer' : ''} relative`}
      onClick={clickable ? onClick : undefined}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <spotLight 
          position={[4, 4, 4]} 
          angle={0.4} 
          penumbra={1} 
          intensity={1.2}
          color="#D4AF37"
        />
        <pointLight 
          position={[-4, -4, -4]} 
          intensity={0.6}
          color="#3B82F6"
        />
        <pointLight 
          position={[2, -2, 2]} 
          intensity={0.4}
          color="#60A5FA"
        />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <group>
            <ParticleField />
            <LogoSphere />
            <FloatingRings />
            <FloatingOrbs />
          </group>
        </Float>
      </Canvas>
      
      {/* Overlay text for better readability */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-primary font-bold text-lg md:text-xl lg:text-2xl mb-1 drop-shadow-lg">
            MonArk
          </div>
          <div className="text-white/80 text-xs md:text-sm font-light italic drop-shadow-md">
            Date well.
          </div>
        </div>
      </div>
    </div>
  );
};