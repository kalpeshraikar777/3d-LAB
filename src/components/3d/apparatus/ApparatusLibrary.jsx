/*
 * Shared 3D Apparatus Library
 * Scale: 1 Three.js unit = 20 cm real-world
 * All apparatus are reusable React components with correct proportional dimensions.
 */
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

// ============================================================
// SHARED UTILS (Meniscus, Droplet, RecordButton)
// ============================================================
export const Meniscus = ({ radius, color, opacity=0.7 }) => (
  <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.005, 0]}>
    <torusGeometry args={[radius * 0.92, radius * 0.08, 16, 32]} />
    <meshStandardMaterial color={color} transparent opacity={opacity + 0.15} />
  </mesh>
);

export const Droplet = ({ position, color="#ffffff", scale=1 }) => (
  <mesh position={position} scale={[scale, scale * 1.5, scale]}>
    <sphereGeometry args={[0.008, 16, 16]} />
    <meshPhysicalMaterial color={color} transparent opacity={0.8} transmission={0.9} roughness={0} />
  </mesh>
);

export const RecordButton = ({ position=[0,0,0], onClick, isGlowing=false }) => {
  const [hov, setHov] = useState(false);
  return (
    <group position={position}
      onPointerOver={() => { setHov(true); document.body.style.cursor='pointer'; }}
      onPointerOut={() => { setHov(false); document.body.style.cursor='auto'; }}
      onClick={(e) => { e.stopPropagation(); if(onClick) onClick(); }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.05, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshStandardMaterial color="#d00" emissive={isGlowing || hov ? "#ff0000" : "#000"} emissiveIntensity={isGlowing || hov ? 0.8 : 0} />
      </mesh>
      <Text position={[0, 0.045, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.035} color="#fff" anchorX="center">REC</Text>
    </group>
  );
};

// ============================================================
// BURETTE (50 mL, 60cm tall = 3 units, 1cm dia = 0.05 units)
// ============================================================
export const Burette = forwardRef(({ position = [0,0,0], fillLevel = 1.0, liquidColor = '#e0ffff', stopcockGlowing = false, onStopcockClick, onStopcockDown, onStopcockUp, label = true }, ref) => {
  const stopcockRef = useRef();
  const groupRef = useRef();
  const [hov, setHov] = useState(false);

  useImperativeHandle(ref, () => groupRef.current);

  useFrame((state) => {
    if (stopcockGlowing && stopcockRef.current) {
      stopcockRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.15);
    } else if (stopcockRef.current) {
      stopcockRef.current.scale.setScalar(1);
    }
  });

  const tubeH = 2.8; // main tube
  const dia = 0.05;
  const fillH = fillLevel * tubeH * 0.9;

  return (
    <group ref={groupRef} position={position}>
      {/* Glass tube */}
      <mesh position={[0, tubeH/2 + 0.2, 0]}>
        <cylinderGeometry args={[dia, dia, tubeH, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0} transmission={0.9} thickness={0.5} />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, 0.2 + fillH/2, 0]}>
        <cylinderGeometry args={[dia*0.9, dia*0.9, fillH, 16]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
      </mesh>
      {fillLevel > 0 && (
        <group position={[0, 0.2 + fillH, 0]}>
          <Meniscus radius={dia*0.9} color={liquidColor} opacity={0.6} />
        </group>
      )}
      {/* Nozzle tip */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} transmission={0.9} />
      </mesh>
      {/* Stopcock handle */}
      <mesh
        ref={stopcockRef}
        position={[0, 0.2, 0.04]}
        rotation={[0, 0, Math.PI/2]}
        onPointerOver={() => { if(stopcockGlowing){ setHov(true); document.body.style.cursor='pointer'; }}}
        onPointerOut={() => { setHov(false); document.body.style.cursor='auto'; }}
        onClick={(e) => { if(stopcockGlowing && onStopcockClick){ e.stopPropagation(); onStopcockClick(); }}}
        onPointerDown={(e) => { if(stopcockGlowing && onStopcockDown){ e.stopPropagation(); onStopcockDown(); }}}
        onPointerUp={(e) => { if(stopcockGlowing && onStopcockUp){ e.stopPropagation(); onStopcockUp(); }}}
        onPointerLeave={(e) => { if(stopcockGlowing && onStopcockUp){ e.stopPropagation(); onStopcockUp(); }}}
      >
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color={stopcockGlowing ? "#00ffcc" : "#333"} emissive={stopcockGlowing ? "#00ffcc" : "#000"} emissiveIntensity={stopcockGlowing ? 0.8 : 0} />
      </mesh>
      {/* Graduation marks (simplified) */}
      {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
        <mesh key={i} position={[dia+0.005, 0.2 + (i/10)*tubeH*0.9, 0]}>
          <boxGeometry args={[0.01, 0.002, 0.01]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}
      {label && <Text position={[0, tubeH+0.4, 0]} fontSize={0.08} color="#00ffcc" anchorX="center">Burette (50 mL)</Text>}
    </group>
  );
});

// ============================================================
// BURETTE STAND (60cm = 3 units tall, 20cm base = 1 unit)
// ============================================================
export const BuretteStand = ({ position = [0,0,0], label = true }) => (
  <group position={position}>
    {/* Base plate — solid, compact */}
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.5, 0.04, 0.4]} />
      <meshStandardMaterial color="#3a3a3a" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Vertical rod — 1.8 units (≈36cm) */}
    <mesh position={[0.2, 0.92, 0]} castShadow>
      <cylinderGeometry args={[0.018, 0.018, 1.84, 12]} />
      <meshStandardMaterial color="#505050" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Horizontal clamp arm */}
    <mesh position={[0, 1.55, 0]} castShadow>
      <boxGeometry args={[0.45, 0.025, 0.05]} />
      <meshStandardMaterial color="#2a2a2a" metalness={0.75} />
    </mesh>
    {/* Clamp ring that grips the burette */}
    <mesh position={[-0.18, 1.55, 0]}>
      <torusGeometry args={[0.055, 0.009, 8, 16]} />
      <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
    </mesh>
    {label && <Text position={[0, -0.08, 0.3]} fontSize={0.05} color="#666" anchorX="center">Stand</Text>}
  </group>
);


// ============================================================
// CONICAL FLASK / ERLENMEYER (250mL, 10cm=0.5u tall, 8cm=0.4u base)
// ============================================================
export const ConicalFlask = forwardRef(({ position=[0,0,0], liquidColor='#ffffff', liquidLevel=0, label=true, isGlowing=false, onClick, showLabel="Conical Flask" }, ref) => {
  const groupRef = useRef();
  const [hov, setHov] = useState(false);
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing){setHov(true); document.body.style.cursor='pointer';}}}
      onPointerOut={() => { setHov(false); document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Body - cone shape */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.2, 0.5, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.35 : 0.2} roughness={0} transmission={0.85} thickness={0.5} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.1, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Liquid */}
      {liquidLevel > 0 && (
        <group position={[0, -0.25 + (liquidLevel * 0.25), 0]}>
          <mesh>
            <cylinderGeometry args={[0.06 + (0.14 * (1-liquidLevel)), 0.19, liquidLevel * 0.5, 32]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.75} />
          </mesh>
          <group position={[0, (liquidLevel * 0.5) / 2, 0]}>
            <Meniscus radius={0.06 + (0.14 * (1-liquidLevel))} color={liquidColor} opacity={0.75} />
          </group>
        </group>
      )}
      {/* Glow */}
      {isGlowing && <pointLight position={[0, 0.2, 0]} color="#00ffcc" intensity={1} distance={1} />}
      {label && <Text position={[0, -0.35, 0.25]} fontSize={0.05} color="#888" anchorX="center">{showLabel}</Text>}
    </group>
  );
});

// ============================================================
// BEAKER (250mL, 9cm=0.45u tall, 7cm=0.35u dia)
// ============================================================
export const Beaker = forwardRef(({ position=[0,0,0], size='250mL', liquidColor='#e0ffff', liquidLevel=0, label=true, isGlowing=false, onClick, showLabel }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);
  const h = size === '100mL' ? 0.35 : 0.45;
  const d = size === '100mL' ? 0.25 : 0.35;

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Glass body */}
      <mesh castShadow>
        <cylinderGeometry args={[d/2, d/2, h, 32, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.35 : 0.18} roughness={0} transmission={0.9} side={2} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[d/2, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {/* Liquid */}
      {liquidLevel > 0 && (
        <group position={[0, -h/2 + (liquidLevel * h)/2, 0]}>
          <mesh>
            <cylinderGeometry args={[d/2*0.95, d/2*0.95, liquidLevel * h, 32]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
          </mesh>
          <group position={[0, (liquidLevel * h)/2, 0]}>
            <Meniscus radius={d/2*0.95} color={liquidColor} opacity={0.7} />
          </group>
        </group>
      )}
      {/* Spout */}
      <mesh position={[d/2-0.01, h/2, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.03, 0.03, 0.04]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.1, 0]} color="#00ffcc" intensity={1} distance={1} />}
      {label && <Text position={[0, -h/2-0.05, d/2+0.05]} fontSize={0.04} color="#888" anchorX="center">{showLabel || `Beaker (${size})`}</Text>}
    </group>
  );
});

// ============================================================
// PIPETTE (25mL, 45cm=2.25u long)
// ============================================================
export const Pipette = forwardRef(({ position=[0,0,0], isGlowing=false, onClick, label=true, fillLevel=0 }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Main tube */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.0, 12]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.4 : 0.2} roughness={0} transmission={0.85} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.85} />
      </mesh>
      {/* Tip */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.005, 0.02, 0.1, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Liquid fill */}
      {fillLevel > 0 && (
        <mesh position={[0, -0.5 + fillLevel*0.5, 0]}>
          <cylinderGeometry args={[0.018, 0.018, fillLevel * 1.0, 12]} />
          <meshStandardMaterial color="#e0ffff" transparent opacity={0.6} />
        </mesh>
      )}
      {isGlowing && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={0.8} distance={1} />}
      {label && <Text position={[0.05, 0.5, 0]} fontSize={0.04} color="#888" anchorX="left">Pipette (25 mL)</Text>}
    </group>
  );
});

// ============================================================
// REAGENT BOTTLE (100mL, 12cm=0.6u tall, 4cm=0.2u dia)
// ============================================================
export const ReagentBottle = forwardRef(({ position=[0,0,0], liquidColor='#e0ffff', labelText='Reagent', isGlowing=false, onClick, visible=true }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);
  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.4 : 0.25} roughness={0} transmission={0.8} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.1, 0.1, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.85} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.06, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.35, 16]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
      </mesh>
      {/* Label plate */}
      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={[0.15, 0.12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <Text position={[0, 0, 0.11]} fontSize={0.03} color="#000" anchorX="center" maxWidth={0.14}>{labelText}</Text>
      {isGlowing && <pointLight position={[0, 0.2, 0]} color="#00ffcc" intensity={1} distance={1} />}
    </group>
  );
});

// ============================================================
// DROPPER / PASTEUR PIPETTE (15cm=0.75u long)
// ============================================================
export const Dropper = forwardRef(({ position=[0,0,0], liquidColor='#aa0044', labelText='Dropper', isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.4 : 0.2} transmission={0.85} />
      </mesh>
      {/* Tip */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.003, 0.012, 0.08, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Rubber bulb */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#b22" />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={0.8} distance={0.8} />}
      <Text position={[0.05, 0, 0]} fontSize={0.035} color="#888" anchorX="left">{labelText}</Text>
    </group>
  );
});

// ============================================================
// WASH BOTTLE (500mL, 20cm=1u tall, squeeze plastic)
// ============================================================
export const WashBottle = forwardRef(({ position=[0,0,0], isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.8, 16]} />
        <meshStandardMaterial color="#e8e8f0" transparent opacity={0.6} />
      </mesh>
      {/* Nozzle tube */}
      <mesh position={[0.05, 0.55, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <meshStandardMaterial color="#e8e8f0" transparent opacity={0.5} />
      </mesh>
      {/* Water inside */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.11, 0.14, 0.55, 16]} />
        <meshStandardMaterial color="#d0e8ff" transparent opacity={0.4} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.2, 0]} color="#00ffcc" intensity={0.8} distance={1} />}
      <Text position={[0, -0.5, 0.17]} fontSize={0.04} color="#888" anchorX="center">Wash Bottle</Text>
    </group>
  );
});

// ============================================================
// WEIGHING BALANCE (digital, 12cmx12cm pan)
// ============================================================
export const WeighingBalance = forwardRef(({ position=[0,0,0], reading='0.000', isOn=false, isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Base body */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.12, 0.5]} />
        <meshStandardMaterial color="#ddd" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Pan */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial color="#ccc" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Display panel */}
      <mesh position={[0, 0.15, -0.2]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.35, 0.15, 0.02]} />
        <meshStandardMaterial color={isOn ? "#112" : "#222"} />
      </mesh>
      {/* Display text */}
      {isOn && (
        <Text position={[0, 0.16, -0.18]} rotation={[-0.3, 0, 0]} fontSize={0.06} color="#0f0" anchorX="center">
          {reading} g
        </Text>
      )}
      {/* Power button */}
      <mesh position={[0.25, 0.07, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
        <meshStandardMaterial color={isGlowing ? "#00ffcc" : (isOn ? "#0a0" : "#600")} emissive={isGlowing ? "#00ffcc" : "#000"} emissiveIntensity={isGlowing ? 0.8 : 0} />
      </mesh>
      {isGlowing && <pointLight position={[0.25, 0.15, 0.2]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, -0.1, 0.3]} fontSize={0.04} color="#888" anchorX="center">Weighing Balance</Text>
    </group>
  );
});

// ============================================================
// WATCH GLASS (10cm=0.5u dia, 1.5cm=0.075u deep)
// ============================================================
export const WatchGlass = forwardRef(({ position=[0,0,0], hasPowder=false, isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <sphereGeometry args={[0.25, 32, 16, 0, Math.PI*2, 0, 0.3]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} roughness={0} transmission={0.9} side={2} />
      </mesh>
      {hasPowder && (
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      )}
      {isGlowing && <pointLight position={[0, 0.1, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, -0.05, 0.28]} fontSize={0.035} color="#888" anchorX="center">Watch Glass</Text>
    </group>
  );
});

// ============================================================
// SPATULA (15cm=0.75u long, flat metal blade)
// ============================================================
export const Spatula = forwardRef(({ position=[0,0,0], rotation=[0,0,0], isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position} rotation={rotation}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Handle */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Blade */}
      <mesh position={[0.25, 0, 0]}>
        <boxGeometry args={[0.15, 0.003, 0.025]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.05, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, 0.05, 0]} fontSize={0.03} color="#888" anchorX="center">Spatula</Text>
    </group>
  );
});

// ============================================================
// STIRRING ROD (30cm=1.5u, 0.5cm=0.025u dia, glass)
// ============================================================
export const StirringRod = forwardRef(({ position=[0,0,0], rotation=[0,0,0], isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position} rotation={rotation}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0.05, 0.5, 0]} fontSize={0.03} color="#888" anchorX="left">Stirring Rod</Text>
    </group>
  );
});

// ============================================================
// WHITE TILE (15cmx15cmx1cm = 0.75x0.75x0.05)
// ============================================================
export const WhiteTile = ({ position=[0,0,0] }) => (
  <group position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.75, 0.05, 0.75]} />
      <meshStandardMaterial color="#f8f8f8" roughness={0.8} />
    </mesh>
    <Text position={[0, 0.04, 0.4]} fontSize={0.04} color="#999" anchorX="center">White Tile</Text>
  </group>
);

// ============================================================
// VOLUMETRIC FLASK (250mL, 25cm=1.25u tall)
// ============================================================
export const VolumetricFlask = forwardRef(({ position=[0,0,0], liquidColor='#ffffff', liquidLevel=0, isGlowing=false, onClick, label=true }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Spherical body */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.2, 32, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.35 : 0.18} roughness={0} transmission={0.9} />
      </mesh>
      {/* Narrow neck */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {/* Flat bottom */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {/* Liquid */}
      {liquidLevel > 0 && (
        <mesh position={[0, -0.1 + liquidLevel*0.1, 0]}>
          <sphereGeometry args={[0.18 * Math.min(liquidLevel, 1), 32, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
        </mesh>
      )}
      {/* Graduation mark on neck */}
      <mesh position={[0, 0.22, 0.035]}>
        <boxGeometry args={[0.07, 0.003, 0.002]} />
        <meshBasicMaterial color="#00f" />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.2, 0]} color="#00ffcc" intensity={0.8} distance={1} />}
      {label && <Text position={[0, -0.3, 0.25]} fontSize={0.04} color="#888" anchorX="center">Vol. Flask (250 mL)</Text>}
    </group>
  );
});

// ============================================================
// MEASURING CYLINDER (100mL, 20cm=1u tall, 3cm=0.15u dia)
// ============================================================
export const MeasuringCylinder = forwardRef(({ position=[0,0,0], liquidLevel=0, liquidColor='#e0ffff', isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.075, 1.0, 16, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={isGlowing ? 0.35 : 0.18} transmission={0.85} side={2} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.075, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {/* Spout */}
      <mesh position={[0.07, 0.5, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.02, 0.04, 0.03]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {liquidLevel > 0 && (
        <mesh position={[0, -0.5 + (liquidLevel * 0.5), 0]}>
          <cylinderGeometry args={[0.07, 0.07, liquidLevel * 1.0, 16]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Graduation marks */}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <mesh key={i} position={[0.076, -0.45 + i*0.1, 0]}>
          <boxGeometry args={[0.008, 0.002, 0.015]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}
      {isGlowing && <pointLight position={[0, 0.2, 0]} color="#00ffcc" intensity={0.5} distance={0.8} />}
      <Text position={[0, -0.6, 0.1]} fontSize={0.04} color="#888" anchorX="center">Meas. Cylinder</Text>
    </group>
  );
});

// ============================================================
// FUNNEL (10cm=0.5u dia, 15cm=0.75u tall)
// ============================================================
export const Funnel = forwardRef(({ position=[0,0,0], isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Cone */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.25, 0.35, 32, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} side={2} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.1, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, -0.35, 0.1]} fontSize={0.035} color="#888" anchorX="center">Funnel</Text>
    </group>
  );
});

// ============================================================
// MAGNETIC STIRRER (20cmx15cm base)
// ============================================================
export const MagneticStirrer = forwardRef(({ position=[0,0,0], isOn=false, isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  const barRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  useFrame((state, delta) => {
    if (isOn && barRef.current) {
      barRef.current.rotation.y += delta * 8;
    }
  });

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Base plate */}
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.12, 0.75]} />
        <meshStandardMaterial color="#ddd" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Speed knob */}
      <mesh position={[0.35, 0.1, 0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
        <meshStandardMaterial color={isGlowing ? "#00ffcc" : "#333"} emissive={isGlowing ? "#00ffcc" : "#000"} emissiveIntensity={isGlowing ? 0.5 : 0} />
      </mesh>
      {/* Power LED */}
      <mesh position={[-0.35, 0.07, 0.35]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color={isOn ? "#0f0" : "#333"} emissive={isOn ? "#0f0" : "#000"} emissiveIntensity={isOn ? 1 : 0} />
      </mesh>
      {/* Stir bar (3cm=0.15u) - positioned above for beaker */}
      <mesh ref={barRef} position={[0, 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.2, 0]} color="#00ffcc" intensity={0.5} distance={0.8} />}
      <Text position={[0, -0.1, 0.45]} fontSize={0.04} color="#888" anchorX="center">Magnetic Stirrer</Text>
    </group>
  );
});

// ============================================================
// DIGITAL METER (pH / Conductivity / Potentiometer)
// ============================================================
export const DigitalMeter = forwardRef(({ position=[0,0,0], reading='0.00', unit='', labelText='Meter', isOn=false, isGlowing=false, onClick, buttons=[] }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Box body */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.25, 0.15]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Display */}
      <mesh position={[0, 0.04, 0.076]}>
        <planeGeometry args={[0.35, 0.12]} />
        <meshStandardMaterial color={isOn ? "#0a1a0a" : "#111"} />
      </mesh>
      {isOn && (
        <Text position={[0, 0.04, 0.08]} fontSize={0.05} color="#0f0" anchorX="center">
          {reading} {unit}
        </Text>
      )}
      {/* Power button */}
      <mesh position={[-0.18, -0.08, 0.076]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 12]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color={isOn ? "#0a0" : "#600"} />
      </mesh>
      {/* Extra buttons */}
      {buttons.map((btn, i) => (
        <mesh key={i} position={[-0.05 + i*0.08, -0.08, 0.076]}>
          <boxGeometry args={[0.04, 0.02, 0.01]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
      {isGlowing && <pointLight position={[0, 0.15, 0.1]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, 0.16, 0.08]} fontSize={0.035} color="#888" anchorX="center">{labelText}</Text>
    </group>
  );
});

// ============================================================
// ELECTRODE (Generic — Pt, Glass pH, Calomel, Conductivity)
// ============================================================
export const Electrode = forwardRef(({ position=[0,0,0], type='platinum', isGlowing=false, onClick, label=true }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  const config = {
    platinum: { color: '#ccc', tipColor: '#e0e0e0', label: 'Pt Electrode', length: 0.75 },
    calomel: { color: '#eee', tipColor: '#d4a574', label: 'Calomel Ref.', length: 1.0 },
    ph: { color: '#eee', tipColor: '#d0e8ff', label: 'pH Electrode', length: 1.0 },
    conductivity: { color: '#ccc', tipColor: '#888', label: 'Conductivity Cell', length: 0.75 },
  }[type] || { color: '#ccc', tipColor: '#ccc', label: 'Electrode', length: 0.75 };

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, config.length, 12]} />
        <meshPhysicalMaterial color={config.color} transparent opacity={0.3} transmission={0.8} />
      </mesh>
      {/* Sensing tip */}
      <mesh position={[0, -config.length/2 - 0.03, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color={config.tipColor} metalness={type==='platinum' ? 0.9 : 0.2} roughness={0.2} />
      </mesh>
      {/* Wire connector at top */}
      <mesh position={[0, config.length/2 + 0.02, 0]}>
        <cylinderGeometry args={[0.025, 0.015, 0.04, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      {label && <Text position={[0.06, 0, 0]} fontSize={0.03} color="#888" anchorX="left">{config.label}</Text>}
    </group>
  );
});

// ============================================================
// HOT PLATE (25cmx25cm surface)
// ============================================================
export const HotPlate = forwardRef(({ position=[0,0,0], isOn=false, isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>
      {/* Heating surface */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 32]} />
        <meshStandardMaterial color={isOn ? "#ff4400" : "#555"} emissive={isOn ? "#ff2200" : "#000"} emissiveIntensity={isOn ? 0.8 : 0} />
      </mesh>
      {/* Temp knob */}
      <mesh position={[0.25, 0.07, 0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
        <meshStandardMaterial color={isGlowing ? "#00ffcc" : "#333"} emissive={isGlowing ? "#00ffcc" : "#000"} emissiveIntensity={isGlowing ? 0.5 : 0} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.15, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, -0.1, 0.35]} fontSize={0.04} color="#888" anchorX="center">Hot Plate</Text>
    </group>
  );
});

// ============================================================
// COLORIMETER
// ============================================================
export const Colorimeter = forwardRef(({ position=[0,0,0], reading='0.000', isOn=false, isGlowing=false, onClick, chamberOpen=false }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.35, 0.35]} />
        <meshStandardMaterial color="#ddd" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Chamber lid */}
      <mesh position={[0, 0.2, 0]} rotation={[chamberOpen ? -0.8 : 0, 0, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#bbb" />
      </mesh>
      {/* Display */}
      <mesh position={[-0.15, 0.08, 0.176]}>
        <planeGeometry args={[0.25, 0.1]} />
        <meshStandardMaterial color={isOn ? "#0a1a0a" : "#111"} />
      </mesh>
      {isOn && (
        <Text position={[-0.15, 0.08, 0.18]} fontSize={0.04} color="#0f0" anchorX="center">
          A = {reading}
        </Text>
      )}
      {/* Filter wheel label */}
      <mesh position={[0.22, 0.08, 0.176]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial color="#ff8800" />
      </mesh>
      <Text position={[0.22, 0.08, 0.18]} fontSize={0.02} color="#000" anchorX="center">620nm</Text>
      {isGlowing && <pointLight position={[0, 0.25, 0.1]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0, -0.22, 0.2]} fontSize={0.04} color="#888" anchorX="center">Colorimeter</Text>
    </group>
  );
});

// ============================================================
// CUVETTE (1cm path, 4.5cm tall)
// ============================================================
export const Cuvette = forwardRef(({ position=[0,0,0], liquidColor='#0055aa', liquidLevel=0.8, isGlowing=false, onClick, labelText='' }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <boxGeometry args={[0.05, 0.22, 0.05]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {liquidLevel > 0 && (
        <mesh position={[0, -0.11 + (liquidLevel*0.11), 0]}>
          <boxGeometry args={[0.045, liquidLevel*0.2, 0.045]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
        </mesh>
      )}
      {isGlowing && <pointLight position={[0, 0.1, 0]} color="#00ffcc" intensity={0.3} distance={0.3} />}
      {labelText && <Text position={[0, -0.15, 0.04]} fontSize={0.02} color="#888" anchorX="center">{labelText}</Text>}
    </group>
  );
});

// ============================================================
// OSTWALD VISCOMETER (U-tube, 25cm=1.25u tall)
// ============================================================
export const OstwaldViscometer = forwardRef(({ position=[0,0,0], liquidLevel=0.5, liquidColor='#e0ffff', isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      {/* Left arm (wider) */}
      <mesh position={[-0.08, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 12]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Right arm (capillary - narrower) */}
      <mesh position={[0.08, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.0, 12]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Upper bulb on right arm */}
      <mesh position={[0.08, 0.2, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {/* Lower bulb on right arm */}
      <mesh position={[0.08, -0.15, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.15} transmission={0.9} />
      </mesh>
      {/* U-bend at bottom */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI/2]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Upper etched mark */}
      <mesh position={[0.08, 0.35, 0.02]}>
        <boxGeometry args={[0.04, 0.003, 0.003]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      {/* Lower etched mark */}
      <mesh position={[0.08, 0.05, 0.02]}>
        <boxGeometry args={[0.04, 0.003, 0.003]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      {/* Liquid in left arm */}
      <mesh position={[-0.08, -0.25 + liquidLevel*0.25, 0]}>
        <cylinderGeometry args={[0.028, 0.028, liquidLevel*0.5, 12]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0.1]} color="#00ffcc" intensity={0.5} distance={0.8} />}
      <Text position={[0, -0.65, 0.1]} fontSize={0.035} color="#888" anchorX="center">Ostwald Viscometer</Text>
    </group>
  );
});

// ============================================================
// SUCTION BULB (5cm=0.25u dia rubber)
// ============================================================
export const SuctionBulb = forwardRef(({ position=[0,0,0], isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      <mesh position={[0, -0.14, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.06, 12]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={0.5} distance={0.5} />}
      <Text position={[0.15, 0, 0]} fontSize={0.03} color="#888" anchorX="left">Suction Bulb</Text>
    </group>
  );
});

// ============================================================
// STOPWATCH (digital)
// ============================================================
export const Stopwatch = forwardRef(({ position=[0,0,0], time='00:00.00', isRunning=false, isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <boxGeometry args={[0.2, 0.3, 0.04]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.04, 0.021]}>
        <planeGeometry args={[0.16, 0.1]} />
        <meshStandardMaterial color="#0a1a0a" />
      </mesh>
      <Text position={[0, 0.04, 0.025]} fontSize={0.04} color={isRunning ? "#0f0" : "#0a0"} anchorX="center">
        {time}
      </Text>
      {/* START/STOP button */}
      <mesh position={[0, -0.07, 0.021]}>
        <boxGeometry args={[0.08, 0.03, 0.01]} />
        <meshStandardMaterial color={isGlowing ? "#00ffcc" : "#444"} emissive={isGlowing ? "#00ffcc" : "#000"} emissiveIntensity={isGlowing ? 0.5 : 0} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0.05]} color="#00ffcc" intensity={0.3} distance={0.3} />}
      <Text position={[0, -0.2, 0.025]} fontSize={0.025} color="#888" anchorX="center">Stopwatch</Text>
    </group>
  );
});

// ============================================================
// THERMOMETER (30cm=1.5u, mercury type)
// ============================================================
export const Thermometer = forwardRef(({ position=[0,0,0], temperature=25, isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);
  const mercuryH = (temperature / 100) * 1.2;

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Mercury bulb */}
      <mesh position={[0, -0.78, 0]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {/* Mercury column */}
      <mesh position={[0, -0.75 + mercuryH/2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, mercuryH, 8]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {isGlowing && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={0.3} distance={0.4} />}
      <Text position={[0.04, 0, 0]} fontSize={0.03} color="#888" anchorX="left">{temperature}°C</Text>
    </group>
  );
});

// ============================================================
// DENSITY BOTTLE (25mL, 8cm=0.4u tall, glass stopper)
// ============================================================
export const DensityBottle = forwardRef(({ position=[0,0,0], isGlowing=false, onClick }, ref) => {
  const groupRef = useRef();
  useImperativeHandle(ref, () => groupRef.current);

  return (
    <group ref={groupRef} position={position}
      onPointerOver={() => { if(isGlowing) document.body.style.cursor='pointer'; }}
      onPointerOut={() => { document.body.style.cursor='auto'; }}
      onClick={(e) => { if(isGlowing && onClick){ e.stopPropagation(); onClick(); }}}
    >
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.02, 0.06, 0.06, 12]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} transmission={0.9} />
      </mesh>
      {/* Glass stopper */}
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} transmission={0.8} />
      </mesh>
      {isGlowing && <pointLight position={[0, 0.1, 0]} color="#00ffcc" intensity={0.3} distance={0.3} />}
      <Text position={[0, -0.2, 0.08]} fontSize={0.03} color="#888" anchorX="center">Density Bottle</Text>
    </group>
  );
});

// ============================================================
// GRAPH DISPLAY PANEL (wall-mounted, live plot)
// ============================================================
export const GraphPanel = ({ position=[0,0,0], title='Graph', xLabel='X', yLabel='Y', dataPoints=[], xRange=[0,20], yRange=[0,10] }) => {
  const w = 3.2;  // 64 cm — much wider
  const h = 2.4;  // 48 cm — much taller
  const padL = 0.35;  // left padding (for Y labels + axis)
  const padB = 0.28;  // bottom padding (for X labels + axis)
  const padT = 0.20;  // top padding (for title)
  const padR = 0.15;  // right padding

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Map data coords → panel local coords
  const toX = (xv) => -w/2 + padL + ((xv - xRange[0]) / (xRange[1] - xRange[0])) * plotW;
  const toY = (yv) => -h/2 + padB + ((yv - yRange[0]) / (yRange[1] - yRange[0])) * plotH;

  const xTicks = 5;
  const yTicks = 5;

  return (
    <group position={position}>
      {/* Outer frame — dark navy panel */}
      <mesh>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.04]} />
        <meshStandardMaterial color="#0d1b2a" />
      </mesh>
      {/* Screen background */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#040d18" />
      </mesh>
      {/* Plot area inner background */}
      <mesh position={[-w/2 + padL + plotW/2, -h/2 + padB + plotH/2, 0.024]}>
        <planeGeometry args={[plotW, plotH]} />
        <meshStandardMaterial color="#050f1c" />
      </mesh>

      {/* ── Grid lines ── */}
      {Array.from({ length: xTicks + 1 }, (_, i) => {
        const xv = xRange[0] + (i / xTicks) * (xRange[1] - xRange[0]);
        const x = toX(xv);
        return (
          <group key={`gx${i}`}>
            {/* vertical grid line */}
            <mesh position={[x, -h/2 + padB + plotH/2, 0.026]}>
              <boxGeometry args={[0.003, plotH, 0.001]} />
              <meshBasicMaterial color="#1a2a3a" />
            </mesh>
            {/* tick on X axis */}
            <mesh position={[x, -h/2 + padB - 0.02, 0.026]}>
              <boxGeometry args={[0.004, 0.06, 0.001]} />
              <meshBasicMaterial color="#446688" />
            </mesh>
            {/* X tick label */}
            <Text position={[x, -h/2 + padB - 0.08, 0.027]} fontSize={0.055} color="#6688aa" anchorX="center">
              {xv.toFixed(xv % 1 === 0 ? 0 : 1)}
            </Text>
          </group>
        );
      })}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const yv = yRange[0] + (i / yTicks) * (yRange[1] - yRange[0]);
        const y = toY(yv);
        return (
          <group key={`gy${i}`}>
            {/* horizontal grid line */}
            <mesh position={[-w/2 + padL + plotW/2, y, 0.026]}>
              <boxGeometry args={[plotW, 0.003, 0.001]} />
              <meshBasicMaterial color="#1a2a3a" />
            </mesh>
            {/* tick on Y axis */}
            <mesh position={[-w/2 + padL - 0.02, y, 0.026]}>
              <boxGeometry args={[0.06, 0.004, 0.001]} />
              <meshBasicMaterial color="#446688" />
            </mesh>
            {/* Y tick label */}
            <Text position={[-w/2 + padL - 0.12, y, 0.027]} fontSize={0.055} color="#6688aa" anchorX="right">
              {yv.toFixed(yv % 1 === 0 ? 0 : 1)}
            </Text>
          </group>
        );
      })}

      {/* ── Axes ── */}
      {/* Y-axis line */}
      <mesh position={[toX(xRange[0]), -h/2 + padB + plotH/2, 0.028]}>
        <boxGeometry args={[0.007, plotH, 0.003]} />
        <meshBasicMaterial color="#336699" />
      </mesh>
      {/* X-axis line */}
      <mesh position={[-w/2 + padL + plotW/2, toY(yRange[0]), 0.028]}>
        <boxGeometry args={[plotW, 0.007, 0.003]} />
        <meshBasicMaterial color="#336699" />
      </mesh>

      {/* ── Labels ── */}
      <Text position={[0, h/2 - padT/2, 0.03]} fontSize={0.09} color="#00ffee" anchorX="center" fontWeight="bold">
        {title}
      </Text>
      <Text position={[-w/2 + padL + plotW/2, -h/2 + 0.06, 0.03]} fontSize={0.065} color="#88aacc" anchorX="center">
        {xLabel}
      </Text>
      <Text position={[-w/2 + 0.09, -h/2 + padB + plotH/2, 0.03]} fontSize={0.065} color="#88aacc" anchorX="center" rotation={[0,0,Math.PI/2]}>
        {yLabel}
      </Text>

      {/* ── Data points ── */}
      {dataPoints.map((pt, i) => {
        const px = toX(pt.x);
        const py = toY(pt.y);
        return (
          <mesh key={i} position={[px, py, 0.032]}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.8} />
          </mesh>
        );
      })}

      {/* ── Line segments connecting points ── */}
      {dataPoints.length > 1 && dataPoints.slice(1).map((pt, i) => {
        const prev = dataPoints[i];
        const px1 = toX(prev.x); const py1 = toY(prev.y);
        const px2 = toX(pt.x);   const py2 = toY(pt.y);
        const midX = (px1 + px2) / 2;
        const midY = (py1 + py2) / 2;
        const len = Math.sqrt((px2-px1)**2 + (py2-py1)**2);
        const angle = Math.atan2(py2-py1, px2-px1);
        return (
          <mesh key={`l${i}`} position={[midX, midY, 0.030]} rotation={[0,0,angle]}>
            <boxGeometry args={[len, 0.012, 0.003]} />
            <meshBasicMaterial color="#00ddbb" />
          </mesh>
        );
      })}

      {/* Subtle glow rim light at panel edge */}
      <pointLight position={[0, 0, 0.5]} color="#00ffcc" intensity={0.3} distance={2} />
    </group>
  );
};

// ============================================================
// RETORT STAND (for viscometer etc.)
// ============================================================
export const RetortStand = ({ position=[0,0,0] }) => (
  <group position={position}>
    <mesh position={[0, 0, 0]} castShadow>
      <boxGeometry args={[0.5, 0.04, 0.5]} />
      <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0.2, 1.5, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.025, 3.0, 12]} />
      <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
    </mesh>
    <Text position={[0, -0.06, 0.3]} fontSize={0.04} color="#888" anchorX="center">Retort Stand</Text>
  </group>
);
