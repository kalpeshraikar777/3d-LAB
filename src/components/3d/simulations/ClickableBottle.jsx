import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

export const ClickableBottle = ({ position, color, label, isGlowing, onClick, visible = true }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isGlowing) {
      // Pulse animation if it's the active item
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    } else {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  if (!visible) return null;

  return (
    <group 
      position={position}
      ref={meshRef}
      onPointerOver={() => {
        if(isGlowing) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        if(isGlowing) {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
          // Play click sound
          new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(er=>er);
          onClick();
        }
      }}
    >
      {/* Bottle Body */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0} />
      </mesh>
      
      {/* Bottle Neck */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.05, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0} />
      </mesh>

      {/* Liquid */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.3, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Glow Effect if active */}
      {isGlowing && (
        <pointLight position={[0, 0.5, 0]} color={color} intensity={1} distance={2} />
      )}
      
      {/* Label outline (box) */}
      <mesh position={[0, 0.2, 0.16]}>
        <planeGeometry args={[0.15, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};

export default ClickableBottle;
