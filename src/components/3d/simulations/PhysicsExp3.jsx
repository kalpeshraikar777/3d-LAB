import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';
import * as THREE from 'three';

/* ──── CONSTANTS ──── */
const LAMBDA = 650e-9;   // 650 nm red laser
const LINES_PER_M = 600e3; // 600 lines/mm
const D = 1 / LINES_PER_M; // grating spacing

// Diffraction angles for orders m = -2,-1,0,+1,+2
const orders = [-2, -1, 0, 1, 2];
const SCREEN_DIST = 2.2; // in scene units (1 unit ≈ ~45cm)

const sinTheta = (m) => m * LAMBDA * LINES_PER_M;
const tanTheta = (m) => {
  const s = sinTheta(m);
  if (Math.abs(s) >= 1) return null;
  return s / Math.sqrt(1 - s * s);
};

/* ──── PRIMITIVES ──── */

const LaserModule = ({ position = [0, 0, 0], isOn = false, isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.3, 0.12, 0.1]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Aperture */}
    <mesh position={[0.16, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
      <meshStandardMaterial color={isOn ? '#ff2200' : '#550000'} emissive={isOn ? '#ff0000' : '#000'} emissiveIntensity={isOn ? 2.0 : 0} />
    </mesh>
    {/* Power button */}
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
      <meshStandardMaterial color={isGlowing ? '#00ff44' : '#003311'} emissive={isGlowing ? '#00ff44' : '#000'} emissiveIntensity={isGlowing ? 1.5 : 0} />
    </mesh>
    <Text position={[0, -0.12, 0]} fontSize={0.04} color="#aaa" anchorX="center">LASER 650nm</Text>
  </group>
);

const OpticalBench = ({ position = [0, 0, 0] }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[5.0, 0.04, 0.15]} />
      <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* Scale markings every 0.5 units */}
    {Array.from({ length: 11 }).map((_, i) => (
      <mesh key={i} position={[-2.5 + i * 0.5, 0.025, 0.08]}>
        <boxGeometry args={[0.005, 0.01, 0.005]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    ))}
    <Text position={[0, -0.08, 0]} fontSize={0.04} color="#666" anchorX="center">Optical Bench (150 cm)</Text>
  </group>
);

const DiffractionGrating = ({ position = [0, 0, 0], isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.02, 0.3, 0.25]} />
      <meshStandardMaterial
        color={isGlowing ? '#aaddff' : '#6699cc'}
        emissive={isGlowing ? '#0033aa' : '#000'}
        emissiveIntensity={isGlowing ? 1.0 : 0}
        transparent opacity={0.7}
        metalness={0.2} roughness={0.1}
      />
    </mesh>
    {/* Grating lines pattern */}
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={i} position={[0.01, -0.13 + i * 0.024, 0]}>
        <boxGeometry args={[0.005, 0.002, 0.24]} />
        <meshStandardMaterial color="#334" transparent opacity={0.4} />
      </mesh>
    ))}
    <Text position={[0, 0.2, 0]} fontSize={0.042} color={isGlowing ? '#88ccff' : '#aaa'} anchorX="center">600 lines/mm</Text>
  </group>
);

const Screen = ({ position = [0, 0, 0], showPattern = false, revealedOrders = [] }) => (
  <group position={position}>
    {/* White screen */}
    <mesh>
      <boxGeometry args={[0.04, 0.8, 0.7]} />
      <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
    </mesh>
    {/* Diffraction spots */}
    {showPattern && orders.map(m => {
      const tan = tanTheta(m);
      if (tan === null) return null;
      const y = tan * 0.3; // scaled spot position
      const visible = revealedOrders.includes(m);
      return visible ? (
        <mesh key={m} position={[0.03, y, 0]}>
          <sphereGeometry args={[m === 0 ? 0.04 : 0.028, 16, 16]} />
          <meshBasicMaterial color={m === 0 ? '#ffffff' : '#ff3300'} />
          {m !== 0 && (
            <pointLight color="#ff2200" intensity={0.5} distance={0.3} />
          )}
        </mesh>
      ) : null;
    })}
    <Text position={[0, -0.5, 0]} fontSize={0.04} color="#888" anchorX="center">Screen</Text>
  </group>
);

const MeasuringRuler = ({ position = [0, 0, 0], isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.02, 0.7, 0.04]} />
      <meshStandardMaterial color={isGlowing ? '#ffee88' : '#e8d88a'} emissive={isGlowing ? '#554400' : '#000'} emissiveIntensity={isGlowing ? 0.6 : 0} roughness={0.8} />
    </mesh>
    {Array.from({ length: 8 }).map((_, i) => (
      <mesh key={i} position={[0.012, -0.3 + i * 0.09, 0]}>
        <boxGeometry args={[0.008, 0.002, 0.04]} />
        <meshBasicMaterial color="#555" />
      </mesh>
    ))}
    <Text position={[0, 0.42, 0]} fontSize={0.04} color={isGlowing ? '#ffee44' : '#999'} anchorX="center">Ruler</Text>
  </group>
);

/* ──── LASER BEAM ──── */
const LaserBeam = ({ from = [0, 0, 0], to = [1, 0, 0], color = '#ff3300' }) => {
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const angleY = Math.atan2(dx, dz);
  return (
    <mesh position={mid} rotation={[0, angleY, 0]}>
      <cylinderGeometry args={[0.006, 0.006, length, 6]} rotation={[Math.PI / 2, 0, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
};

/* ──── OBSERVATION TABLE UI ──── */
const ObsPanel = ({ orders: revOrders, screenDist, position = [0, 0, 0] }) => {
  const rows = revOrders.map(m => {
    const tan = tanTheta(m);
    if (tan === null) return null;
    const xn = Math.round(tan * screenDist * 100 * 10) / 10; // cm
    const theta = Math.atan(tan) * 180 / Math.PI;
    const lambdaCalc = Math.abs(m) > 0
      ? (Math.sin(theta * Math.PI / 180) / (LINES_PER_M * Math.abs(m))) * 1e9
      : 0;
    return { m, xn, theta: theta.toFixed(2), lambdaCalc: lambdaCalc.toFixed(1) };
  }).filter(Boolean);

  return (
    <group position={position}>
      <mesh><planeGeometry args={[2.5, 1.0]} /><meshBasicMaterial color="#080820" /></mesh>
      <Text position={[0, 0.42, 0.01]} fontSize={0.055} color="#00ffcc" anchorX="center">Diffraction Measurements</Text>
      {rows.map((r, i) => (
        <Text key={i} position={[0, 0.25 - i * 0.12, 0.01]} fontSize={0.042} color="#aaddff" anchorX="center">
          {`m=${r.m}  xn=${r.xn}cm  θ=${r.theta}°  λ=${r.lambdaCalc}nm`}
        </Text>
      ))}
    </group>
  );
};

/* ──────────────────── MAIN ──────────────────── */
const REVEAL_ORDER = [0, 1, -1, 2, -2];

const PhysicsExp3 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [laserOn, setLaserOn] = useState(false);
  const [gratingAligned, setGratingAligned] = useState(false);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [revealedOrders, setRevealedOrders] = useState([]);
  const [measuring, setMeasuring] = useState(false);
  const [done, setDone] = useState(false);

  const revealTimer = useRef(0);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  useFrame((state, delta) => {
    if (!gratingAligned || revealIdx >= REVEAL_ORDER.length - 1) return;
    revealTimer.current += delta;
    if (revealTimer.current > 0.7) {
      revealTimer.current = 0;
      const next = revealIdx + 1;
      setRevealIdx(next);
      const m = REVEAL_ORDER[next];
      setRevealedOrders(prev => [...prev, m]);

      if (next === REVEAL_ORDER.length - 1) {
        playSuccess();
        setCurrentStep(3);

        // Auto log observations
        const obs = {};
        [1, 2].forEach((order, i) => {
          const tan = tanTheta(order);
          if (!tan) return;
          const xn = (tan * SCREEN_DIST * 45).toFixed(1); // cm (1 unit = 45cm)
          const theta = Math.atan(tan) * 180 / Math.PI;
          const lambda = (Math.sin(theta * Math.PI / 180) / (LINES_PER_M * order)) * 1e9;
          obs[i] = { 0: String(order), 1: (SCREEN_DIST * 45).toFixed(0), 2: String(2 * parseFloat(xn)), 3: xn, 4: theta.toFixed(2), 5: lambda.toFixed(1) };
        });
        setObservations(obs);
      }
    }
  });

  const showPattern = gratingAligned;

  const instructions = [
    '① Click LASER module to power ON',
    '② Click Diffraction Grating to align it on optical bench',
    '③ Diffraction orders appearing on screen...',
    '④ Click Ruler to measure spot positions',
    '⑤ All measured! Open Notebook to see λ calculation',
  ];

  // Beam positions (scene coordinates)
  const laserPos = [-2.0, -0.9, 0];
  const gratingPos = [0, -0.9, 0];
  const screenPos = [SCREEN_DIST, -0.9, 0];

  return (
    <group>
      {/* Optical bench */}
      <OpticalBench position={[0, -1.0, 0]} />

      {/* Laser */}
      <LaserModule
        position={laserPos}
        isOn={laserOn}
        isGlowing={currentStep === 0}
        onClick={() => {
          if (currentStep !== 0) return;
          playClick();
          setLaserOn(true);
          setCurrentStep(1);
        }}
      />

      {/* Main laser beam (laser → grating) */}
      {laserOn && (
        <LaserBeam from={[-1.83, -0.9, 0]} to={[-0.01, -0.9, 0]} />
      )}

      {/* Transmitted beam (grating → screen, only m=0) */}
      {showPattern && revealedOrders.includes(0) && (
        <LaserBeam from={[0.01, -0.9, 0]} to={[screenPos[0] - 0.02, -0.9, 0]} />
      )}

      {/* Diffracted beams for m=±1, ±2 */}
      {showPattern && orders.filter(m => m !== 0).map(m => {
        if (!revealedOrders.includes(m)) return null;
        const tan = tanTheta(m);
        if (!tan) return null;
        const endY = -0.9 + tan * SCREEN_DIST;
        return (
          <LaserBeam
            key={m}
            from={[0.01, -0.9, 0]}
            to={[screenPos[0] - 0.02, endY, 0]}
            color="#ff1100"
          />
        );
      })}

      {/* Grating */}
      <DiffractionGrating
        position={gratingPos}
        isGlowing={currentStep === 1}
        onClick={() => {
          if (currentStep !== 1 || !laserOn) return;
          playClick();
          setGratingAligned(true);
          setCurrentStep(2);
        }}
      />

      {/* Screen */}
      <Screen
        position={screenPos}
        showPattern={showPattern}
        revealedOrders={revealedOrders}
      />

      {/* Ruler */}
      <MeasuringRuler
        position={[screenPos[0], -0.5, 0.12]}
        isGlowing={currentStep === 3}
        onClick={() => {
          if (currentStep !== 3) return;
          playClick();
          setMeasuring(true);
          setDone(true);
          setCurrentStep(4);
        }}
      />

      {/* Measurement panel */}
      {(currentStep >= 3) && (
        <group position={[0, 0.2, -1.85]} rotation={[0.15, 0, 0]}>
          <ObsPanel
            orders={revealedOrders}
            screenDist={SCREEN_DIST * 45}
            position={[0, 0, 0]}
          />
        </group>
      )}

      {/* Done badge */}
      {done && (
        <group position={[0, 0.85, 0]}>
          <mesh><planeGeometry args={[3.0, 0.3]} /><meshBasicMaterial color="#002200" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.09} color="#00ff88" anchorX="center" position={[0, 0, 0.01]}>
            ✅ Wavelength λ = 650 nm confirmed from diffraction pattern
          </Text>
        </group>
      )}

      {/* Instruction */}
      <group position={[0, 1.55, -2.0]} rotation={[0.15, 0, 0]}>
        <Text fontSize={0.075} color="#00ffcc" anchorX="center">
          {instructions[Math.min(currentStep, instructions.length - 1)]}
        </Text>
      </group>
    </group>
  );
};

export default PhysicsExp3;
