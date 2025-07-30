import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import { User, Map, MessageCircle, Users, BookOpen } from 'lucide-react';
import * as THREE from 'three';

interface FloatingNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const FloatingMenuItem = ({ 
  position, 
  icon: Icon, 
  label, 
  isActive, 
  onClick,
  delay = 0 
}: {
  position: [number, number, number];
  icon: React.ComponentType<any>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  delay?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Floating animation with delay
      groupRef.current.position.y = position[1] + Math.sin(time * 2 + delay) * 0.2;
      
      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(time * 1.5 + delay) * 0.1;
      
      // Scale animations
      const targetScale = isActive ? 1.3 : hovered ? 1.1 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        {/* Main container */}
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial
            color={isActive ? "#D4AF37" : hovered ? "#87CEEB" : "#2A2A2A"}
            emissive={isActive ? "#D4AF37" : "#000000"}
            emissiveIntensity={isActive ? 0.3 : 0}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Glowing border */}
        <mesh>
          <boxGeometry args={[1.1, 1.1, 0.1]} />
          <meshStandardMaterial
            color="#D4AF37"
            emissive="#D4AF37"
            emissiveIntensity={isActive ? 0.5 : 0.1}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Icon and label using HTML overlay */}
        <Html
          center
          transform
          occlude
          position={[0, 0, 0.11]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Icon 
              className={`w-6 h-6 mb-1 ${
                isActive ? 'text-background' : 'text-goldenrod'
              }`} 
            />
            <span 
              className={`text-xs font-medium ${
                isActive ? 'text-background' : 'text-white'
              }`}
            >
              {label}
            </span>
          </div>
        </Html>
      </Float>
    </group>
  );
};

const ConnectingLines = ({ positions, activeIndex }: { positions: [number, number, number][]; activeIndex: number }) => {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      const time = state.clock.getElapsedTime();
      linesRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <group ref={linesRef}>
      {positions.map((pos, index) => {
        if (index === positions.length - 1) return null;
        
        const nextPos = positions[index + 1];
        const midPoint = [
          (pos[0] + nextPos[0]) / 2,
          (pos[1] + nextPos[1]) / 2,
          (pos[2] + nextPos[2]) / 2
        ] as [number, number, number];
        
        const distance = Math.sqrt(
          Math.pow(nextPos[0] - pos[0], 2) +
          Math.pow(nextPos[1] - pos[1], 2) +
          Math.pow(nextPos[2] - pos[2], 2)
        );

        return (
          <mesh key={index} position={midPoint}>
            <cylinderGeometry args={[0.01, 0.01, distance]} />
            <meshStandardMaterial
              color="#D4AF37"
              emissive="#D4AF37"
              emissiveIntensity={activeIndex === index || activeIndex === index + 1 ? 0.5 : 0.1}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const BackgroundParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const count = 500;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#D4AF37"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  className = "" 
}) => {
  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'matches', icon: MessageCircle, label: 'Connections' },
    { id: 'discover', icon: Map, label: 'Discover' },
    { id: 'dates', icon: BookOpen, label: 'Dates & Journal' },
    { id: 'circle', icon: Users, label: 'Circle' },
  ];

  // Arrange in a flowing wave pattern
  const positions: [number, number, number][] = tabs.map((_, index) => {
    const x = (index - 2) * 2.5; // Spread horizontally
    const y = Math.sin(index * 0.8) * 1.2; // Wave pattern
    const z = Math.cos(index * 0.8) * 0.5; // Slight depth variation
    return [x, y, z];
  });

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#D4AF37" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#87CEEB" />
        <spotLight
          position={[0, 10, 5]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          color="#D4AF37"
        />
        
        <BackgroundParticles />
        <ConnectingLines positions={positions} activeIndex={activeIndex} />
        
        {tabs.map((tab, index) => (
          <FloatingMenuItem
            key={tab.id}
            position={positions[index]}
            icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            delay={index * 0.5}
          />
        ))}
      </Canvas>
    </div>
  );
};