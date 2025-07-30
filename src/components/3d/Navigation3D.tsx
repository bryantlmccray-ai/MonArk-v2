import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Environment } from '@react-three/drei';
import { User, Map, MessageCircle, Users, BookOpen } from 'lucide-react';
import * as THREE from 'three';

interface Navigation3DProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const NavigationNode = ({ 
  position, 
  icon, 
  label, 
  isActive, 
  onClick,
  index 
}: {
  position: [number, number, number];
  icon: React.ComponentType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && textRef.current) {
      // Floating animation
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + index) * 0.1;
      textRef.current.position.y = position[1] + Math.sin(time * 2 + index) * 0.1 - 0.8;
      
      // Rotation animation
      meshRef.current.rotation.y += 0.01;
      
      // Active state pulsing
      if (isActive) {
        const scale = 1 + Math.sin(time * 4) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
      
      // Hover effects
      if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else if (!isActive) {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          position={position}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={isActive ? "#D4AF37" : hovered ? "#87CEEB" : "#4A4A4A"}
            emissive={isActive ? "#D4AF37" : "#000000"}
            emissiveIntensity={isActive ? 0.3 : 0}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </Float>
      
      <Text
        ref={textRef}
        position={[position[0], position[1] - 0.8, position[2]]}
        fontSize={0.15}
        color={isActive ? "#D4AF37" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        {label}
      </Text>
      
      {/* Icon representation as a smaller sphere */}
      <mesh position={[position[0], position[1], position[2] + 0.1]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#FFFFFF" : "#D4AF37"}
          emissive={isActive ? "#FFFFFF" : "#D4AF37"}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = new Float32Array(1000 * 3);
  for (let i = 0; i < particles.length; i += 3) {
    particles[i] = (Math.random() - 0.5) * 20;
    particles[i + 1] = (Math.random() - 0.5) * 20;
    particles[i + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#D4AF37" opacity={0.6} transparent />
    </points>
  );
};

const NavigationRing = ({ radius, activeIndex }: { radius: number; activeIndex: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005;
      // Highlight the active section
      const time = state.clock.getElapsedTime();
      const intensity = 0.3 + Math.sin(time * 3) * 0.2;
      (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.05, 16, 100]} />
      <meshStandardMaterial
        color="#D4AF37"
        emissive="#D4AF37"
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

export const Navigation3D: React.FC<Navigation3DProps> = ({ 
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

  // Arrange navigation items in a circle
  const radius = 2;
  const positions: [number, number, number][] = tabs.map((_, index) => {
    const angle = (index / tabs.length) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ];
  });

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#87CEEB" />
        
        <Environment preset="night" />
        
        <ParticleField />
        <NavigationRing radius={radius + 0.5} activeIndex={activeIndex} />
        
        {tabs.map((tab, index) => (
          <NavigationNode
            key={tab.id}
            position={positions[index]}
            icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            index={index}
          />
        ))}
        
        {/* Central logo sphere */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color="#1A1A1A"
              emissive="#D4AF37"
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </Float>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};