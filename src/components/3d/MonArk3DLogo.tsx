// Add font file for 3D text - this would normally be loaded from public/fonts/
// For now, we'll create a simpler version without external font dependencies

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Text, Center } from '@react-three/drei';
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
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <MeshDistortMaterial
        color="#D4AF37"
        transparent
        opacity={0.3}
        distort={0.15}
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

  useFrame((state) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = state.clock.elapsedTime * 0.4;
      ring1Ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -state.clock.elapsedTime * 0.3;
      ring2Ref.current.rotation.z = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          transparent 
          opacity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      <mesh ref={ring2Ref} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.9, 2.1, 32]} />
        <meshStandardMaterial 
          color="#3B82F6" 
          transparent 
          opacity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </>
  );
}

function CentralText() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Center>
          <Text
            fontSize={0.4}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="middle"
            position={[0, 0.1, 0.8]}
          >
            MonArk
            <meshStandardMaterial 
              color="#D4AF37"
              metalness={0.9}
              roughness={0.1}
            />
          </Text>
        </Center>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
        <Center>
          <Text
            fontSize={0.15}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.05}
            textAlign="center"
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="middle"
            position={[0, -0.35, 0.9]}
          >
            Date well.
            <meshStandardMaterial 
              color="#FFFFFF"
              metalness={0.5}
              roughness={0.3}
            />
          </Text>
        </Center>
      </Float>
    </group>
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
      className={`${sizeClasses[size]} ${className} ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[5, 5, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1}
          color="#D4AF37"
        />
        <pointLight 
          position={[-5, -5, -5]} 
          intensity={0.5}
          color="#3B82F6"
        />
        
        <LogoSphere />
        <FloatingRings />
        <CentralText />
      </Canvas>
    </div>
  );
};