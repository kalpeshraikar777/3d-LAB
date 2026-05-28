import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

export const TitrationRig = ({ flaskLiquidColor = '#aa0044', flaskLiquidVolume = 0.5, isDripping = false, stopcockGlowing = false, onStopcockClick, buretteFillLevel = 1.9 }) => {
  const dropRef = useRef();
  const stopcockRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Drip animation
  useFrame((state) => {
    if (isDripping && dropRef.current) {
      dropRef.current.position.y -= 0.05;
      if (dropRef.current.position.y < -0.8) {
        dropRef.current.position.y = 1.0; // Reset to top of burette nozzle
      }
      dropRef.current.visible = true;
    } else if (dropRef.current) {
      dropRef.current.visible = false;
    }
    
    // Stopcock glow pulse
    if (stopcockGlowing && stopcockRef.current) {
      stopcockRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.2);
    } else if (stopcockRef.current) {
      stopcockRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Stand Base */}
      <mesh position={[1, -1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Stand Pole */}
      <mesh position={[1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Burette Clamp */}
      <mesh position={[0.5, 1, 0]} castShadow>
        <boxGeometry args={[1, 0.05, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Burette Glass */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0} transmission={0.9} />
      </mesh>
      
      {/* Burette Nozzle */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>

      {/* Stopcock (Valve) - INTERACTIVE */}
      <mesh 
        ref={stopcockRef}
        position={[0, 0.45, 0.05]} 
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        onPointerOver={() => {
          if (stopcockGlowing) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          if (stopcockGlowing && onStopcockClick) {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = 'auto';
            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3').play().catch(er=>er);
            onStopcockClick();
          }
        }}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
        <meshStandardMaterial color={stopcockGlowing ? "#00ffcc" : "#111"} emissive={stopcockGlowing ? "#00ffcc" : "#000"} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Liquid in Burette (Clear EDTA) */}
      <mesh position={[0, 0.55 + (buretteFillLevel / 2), 0]}>
        <cylinderGeometry args={[0.09, 0.09, buretteFillLevel, 16]} />
        <meshStandardMaterial color="#e0ffff" transparent opacity={0.6} />
      </mesh>

      {/* Dripping Drop */}
      <mesh ref={dropRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#e0ffff" transparent opacity={0.8} />
      </mesh>

      {/* Conical Flask */}
      <group position={[0, -0.7, 0]}>
        {/* Flask Glass - Cone body */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.4, 0.6, 32]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0} transmission={0.9} />
        </mesh>
        
        {/* Flask Glass - Neck */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 32]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0} transmission={0.9} />
        </mesh>

        {/* Liquid in Flask */}
        <mesh position={[0, -0.3 + (flaskLiquidVolume * 0.3), 0]}>
          <cylinderGeometry args={[0.3, 0.38, flaskLiquidVolume * 0.6, 32]} />
          <meshStandardMaterial color={flaskLiquidColor} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
};

export default TitrationRig;
