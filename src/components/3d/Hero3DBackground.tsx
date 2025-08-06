import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Interactive floating particles background
function ParticleField({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const ref = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    const colors = new Float32Array(3000 * 3);
    
    for (let i = 0; i < 3000; i++) {
      // Random positions in a large sphere
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      // Gold and taupe color variations (using design system colors)
      const isGold = Math.random() > 0.6;
      if (isGold) {
        colors[i * 3] = 0.831; // Gold R
        colors[i * 3 + 1] = 0.686; // Gold G  
        colors[i * 3 + 2] = 0.216; // Gold B
      } else {
        colors[i * 3] = 0.651; // Taupe R
        colors[i * 3 + 1] = 0.608; // Taupe G
        colors[i * 3 + 2] = 0.549; // Taupe B
      }
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      // Mouse interaction
      const mouseInfluence = 0.3;
      ref.current.rotation.x = state.clock.elapsedTime * 0.08 + mousePosition.y * mouseInfluence;
      ref.current.rotation.y = state.clock.elapsedTime * 0.04 + mousePosition.x * mouseInfluence;
      
      // Gentle floating motion
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={2}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

// Interactive floating geometric shapes
function FloatingGeometry({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const shapes = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (shapes.current) {
      // Mouse interaction - shapes follow mouse movement subtly
      shapes.current.rotation.x = mousePosition.y * 0.1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      shapes.current.rotation.y = mousePosition.x * 0.1 + state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={shapes}>
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={2.5}>
        <mesh position={[-8, 4, -5]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <MeshDistortMaterial
            color="#D4AF37"
            transparent
            opacity={0.15}
            distort={0.4}
            speed={1.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={2.5} floatIntensity={2}>
        <mesh position={[8, -3, -8]} rotation={[Math.PI / 4, 0, 0]}>
          <octahedronGeometry args={[1.8]} />
          <MeshDistortMaterial
            color="#A67C52"
            transparent
            opacity={0.2}
            distort={0.3}
            speed={2}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.8} floatIntensity={3}>
        <mesh position={[0, 6, -10]} rotation={[0, Math.PI / 3, 0]}>
          <tetrahedronGeometry args={[1.5]} />
          <MeshDistortMaterial
            color="#D4AF37"
            transparent
            opacity={0.12}
            distort={0.5}
            speed={2.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={1} floatIntensity={2.2}>
        <mesh position={[-6, -4, -6]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <dodecahedronGeometry args={[1.2]} />
          <MeshDistortMaterial
            color="#A67C52"
            transparent
            opacity={0.18}
            distort={0.35}
            speed={1.6}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>
      </Float>

      {/* Additional interactive shapes */}
      <Float speed={1.7} rotationIntensity={1.3} floatIntensity={2.8}>
        <mesh position={[5, 2, -12]} rotation={[Math.PI / 3, 0, Math.PI / 4]}>
          <icosahedronGeometry args={[1]} />
          <MeshDistortMaterial
            color="#D4AF37"
            transparent
            opacity={0.1}
            distort={0.6}
            speed={2.5}
            roughness={0}
            metalness={1}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Interactive central pulsing sphere
function CentralSphere({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current) {
      // Dynamic pulsing based on mouse interaction
      const basePulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      const mousePulse = hovered ? 1.2 : 1;
      const finalScale = basePulse * mousePulse;
      
      ref.current.scale.setScalar(finalScale);
      ref.current.rotation.y = state.clock.elapsedTime * 0.3 + mousePosition.x * 0.2;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.1 + mousePosition.y * 0.1;
      
      // Subtle position shift based on mouse
      ref.current.position.x = mousePosition.x * 2;
      ref.current.position.y = mousePosition.y * 2;
    }
  });

  return (
    <mesh 
      ref={ref} 
      position={[0, 0, -15]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[3.5, 64, 64]} />
      <MeshDistortMaterial
        color={hovered ? "#F4D03F" : "#D4AF37"}
        transparent
        opacity={hovered ? 0.25 : 0.08}
        distort={hovered ? 0.6 : 0.3}
        speed={hovered ? 3 : 1.2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

export const Hero3DBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    setMousePosition({ x, y });
  }, []);

  return (
    <div 
      className="absolute inset-0 w-full h-full cursor-none"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        shadows
      >
        {/* Enhanced lighting for more dramatic effect */}
        <ambientLight intensity={0.2} />
        <pointLight 
          position={[10, 10, 10]} 
          intensity={1.2} 
          color="#D4AF37" 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#A67C52" />
        <pointLight position={[0, 10, -5]} intensity={0.6} color="#F4D03F" />
        
        {/* Interactive components */}
        <ParticleField mousePosition={mousePosition} />
        <FloatingGeometry mousePosition={mousePosition} />
        <CentralSphere mousePosition={mousePosition} />
        
        {/* Subtle orbit controls for desktop interaction */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          rotateSpeed={0.1}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* Interactive cursor indicator */}
      <div 
        className="absolute pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: `${(mousePosition.x + 1) * 50}%`,
          top: `${(-mousePosition.y + 1) * 50}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-2 h-2 bg-goldenrod rounded-full opacity-30 animate-pulse" />
      </div>
    </div>
  );
};