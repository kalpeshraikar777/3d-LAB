import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────── */
const Breadboard = ({ position = [0, 0, 0] }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[3.0, 0.08, 1.8]} />
      <meshStandardMaterial color="#f5f0dc" roughness={0.8} />
    </mesh>
    {/* Power rails */}
    {[-0.82, 0.82].map((z, i) => (
      <mesh key={i} position={[0, 0.045, z]}>
        <boxGeometry args={[2.8, 0.005, 0.04]} />
        <meshStandardMaterial color={i === 0 ? '#cc2222' : '#222266'} />
      </mesh>
    ))}
    {/* Hole grid visual */}
    {Array.from({ length: 10 }).map((_, col) =>
      Array.from({ length: 6 }).map((_, row) => (
        <mesh key={`${col}-${row}`} position={[-1.2 + col * 0.27, 0.05, -0.6 + row * 0.24]}>
          <cylinderGeometry args={[0.012, 0.012, 0.06, 6]} />
          <meshStandardMaterial color="#999" />
        </mesh>
      ))
    )}
  </group>
);

const Inductor = ({ position = [0, 0, 0], label = 'L=10mH', isGlowing = false, onClick }) => (
  <group
    position={position}
    onClick={onClick}
    onPointerOver={() => { if (onClick) document.body.style.cursor = 'pointer'; }}
    onPointerOut={() => { if (onClick) document.body.style.cursor = 'auto'; }}
  >
    {/* Coil body */}
    {Array.from({ length: 8 }).map((_, i) => (
      <mesh key={i} position={[0, 0, -0.18 + i * 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.014, 8, 16]} />
        <meshStandardMaterial
          color={isGlowing ? '#ffdd44' : '#cc8800'}
          emissive={isGlowing ? '#886600' : '#000'}
          emissiveIntensity={isGlowing ? 0.8 : 0}
          metalness={0.7} roughness={0.3}
        />
      </mesh>
    ))}
    {/* Lead wires */}
    <mesh position={[0, 0, -0.25]}><cylinderGeometry args={[0.006, 0.006, 0.12, 6]} /><meshStandardMaterial color="#888" metalness={1} /></mesh>
    <mesh position={[0, 0, 0.25]}><cylinderGeometry args={[0.006, 0.006, 0.12, 6]} /><meshStandardMaterial color="#888" metalness={1} /></mesh>
    <Text position={[0, 0.12, 0]} fontSize={0.06} color={isGlowing ? '#ffff00' : '#fff'} anchorX="center">{label}</Text>
  </group>
);

const Capacitor = ({ position = [0, 0, 0], label = 'C=22µF', isGlowing = false, onClick }) => (
  <group
    position={position}
    onClick={onClick}
    onPointerOver={() => { if (onClick) document.body.style.cursor = 'pointer'; }}
    onPointerOut={() => { if (onClick) document.body.style.cursor = 'auto'; }}
  >
    <mesh>
      <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
      <meshStandardMaterial color={isGlowing ? '#44ddff' : '#2255cc'} emissive={isGlowing ? '#001166' : '#000'} emissiveIntensity={isGlowing ? 0.8 : 0} metalness={0.5} />
    </mesh>
    {/* Stripe */}
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.082, 0.082, 0.05, 16]} />
      <meshStandardMaterial color="#eee" />
    </mesh>
    {/* Leads */}
    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.006, 0.006, 0.1, 6]} /><meshStandardMaterial color="#888" metalness={1} /></mesh>
    <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.006, 0.006, 0.1, 6]} /><meshStandardMaterial color="#888" metalness={1} /></mesh>
    <Text position={[0.15, 0, 0]} fontSize={0.055} color={isGlowing ? '#44ddff' : '#fff'} anchorX="center">{label}</Text>
  </group>
);

const Resistor = ({ position = [0, 0, 0], label = 'R=100Ω', isGlowing = false, onClick }) => (
  <group
    position={position}
    onClick={onClick}
    onPointerOver={() => { if (onClick) document.body.style.cursor = 'pointer'; }}
    onPointerOut={() => { if (onClick) document.body.style.cursor = 'auto'; }}
  >
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.04, 0.24, 12]} />
      <meshStandardMaterial color={isGlowing ? '#ffaa44' : '#d4a070'} emissive={isGlowing ? '#552200' : '#000'} emissiveIntensity={isGlowing ? 0.8 : 0} />
    </mesh>
    {/* Color bands: Brown-Black-Brown = 100Ω */}
    {[[-0.06, '#8B4513'], [0, '#111'], [0.06, '#8B4513'], [0.1, '#FFD700']].map(([x, c], i) => (
      <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.042, 0.042, 0.02, 12]} />
        <meshStandardMaterial color={c} />
      </mesh>
    ))}
    {/* Leads */}
    <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.005, 0.005, 0.12, 6]} /><meshStandardMaterial color="#aaa" metalness={1} /></mesh>
    <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.005, 0.005, 0.12, 6]} /><meshStandardMaterial color="#aaa" metalness={1} /></mesh>
    <Text position={[0, 0.1, 0]} fontSize={0.055} color={isGlowing ? '#ffaa44' : '#fff'} anchorX="center">{label}</Text>
  </group>
);

const FunctionGenerator = ({ position = [0, 0, 0], frequency = 100, isOn = false, isGlowing = false, onClick }) => {
  const t = frequency / 1000; // 0–1 range
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.8, 0.5, 0.35]} />
        <meshStandardMaterial color={isGlowing ? '#2a4a6a' : '#1a2a3a'} emissive={isGlowing ? '#001133' : '#000'} emissiveIntensity={isGlowing ? 0.5 : 0} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.05, 0.18]}>
        <planeGeometry args={[0.45, 0.18]} />
        <meshBasicMaterial color={isOn ? '#00ff88' : '#003311'} />
      </mesh>
      {/* Freq knob */}
      <mesh position={[0.28, 0, 0.18]} rotation={[Math.PI / 2, 0, t * Math.PI * 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <Text position={[0, 0.05, 0.2]} fontSize={0.045} color={isOn ? '#00ff88' : '#006622'} anchorX="center">
        {isOn ? `${frequency} Hz` : 'OFF'}
      </Text>
      <Text position={[0, -0.32, 0]} fontSize={0.055} color="#aaa" anchorX="center">Function Generator</Text>
    </group>
  );
};

const AnalogMeter = ({ position = [0, 0, 0], label = 'mA', value = 0, maxValue = 500, isGlowing = false }) => {
  const angle = (-Math.PI / 4) + (value / maxValue) * (Math.PI / 2);
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.38]} />
        <meshBasicMaterial color="#fffff0" />
      </mesh>
      {/* Needle */}
      <mesh position={[Math.sin(angle) * 0.12, 0.04, -Math.cos(angle) * 0.12]} rotation={[Math.PI / 2, 0, angle]}>
        <boxGeometry args={[0.006, 0.18, 0.003]} />
        <meshBasicMaterial color={isGlowing ? '#ff4400' : '#cc2200'} />
      </mesh>
      <Text position={[0, -0.18, 0]} fontSize={0.055} color={isGlowing ? '#ff8800' : '#ccc'} anchorX="center">{label}</Text>
    </group>
  );
};

const PowerSupplyUnit = ({ position = [0, 0, 0], isOn = false, isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.7, 0.45, 0.3]} />
      <meshStandardMaterial color="#222" metalness={0.5} emissive={isGlowing ? '#110022' : '#000'} emissiveIntensity={isGlowing ? 0.3 : 0} />
    </mesh>
    <mesh position={[0.2, 0.1, 0.16]}>
      <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
      <meshStandardMaterial color={isOn ? '#00ff44' : '#440000'} emissive={isOn ? '#00aa00' : '#000'} emissiveIntensity={isOn ? 1.5 : 0} />
    </mesh>
    <Text position={[0, -0.3, 0]} fontSize={0.055} color="#aaa" anchorX="center">Power Supply (AC)</Text>
  </group>
);

/* ─────────────────────────────────────────────
   LIVE GRAPH — Current vs Frequency
───────────────────────────────────────────── */
const LiveGraph = ({ dataPoints = [], resonantF = 0, mode = 'series', position = [0, 0, 0] }) => {
  // dataPoints: [{f, i}]  f in Hz, i in mA
  const maxI = Math.max(...dataPoints.map(p => p.i), 1);
  const minI = Math.min(...dataPoints.map(p => p.i), 0);
  const fMin = 100, fMax = 1000;

  const toX = (f) => ((f - fMin) / (fMax - fMin)) * 1.4 - 0.7;
  const toY = (i) => ((i - minI) / (maxI - minI + 0.001)) * 0.8 - 0.4;

  return (
    <group position={position}>
      {/* Background panel */}
      <mesh>
        <planeGeometry args={[1.6, 1.0]} />
        <meshBasicMaterial color="#0a0a1a" />
      </mesh>
      {/* Axes */}
      <mesh position={[-0.78, 0, 0.001]}>
        <boxGeometry args={[0.01, 0.9, 0.001]} />
        <meshBasicMaterial color="#444" />
      </mesh>
      <mesh position={[0, -0.48, 0.001]}>
        <boxGeometry args={[1.55, 0.01, 0.001]} />
        <meshBasicMaterial color="#444" />
      </mesh>
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <mesh key={i} position={[toX(p.f), toY(p.i), 0.002]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={mode === 'series' ? '#00ffcc' : '#ff8800'} />
        </mesh>
      ))}
      {/* Resonance marker */}
      {resonantF > 0 && (
        <mesh position={[toX(resonantF), 0, 0.003]}>
          <boxGeometry args={[0.008, 0.9, 0.001]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
      <Text position={[0, 0.56, 0.001]} fontSize={0.055} color="#00ffcc" anchorX="center">
        {mode === 'series' ? 'Series LCR: I vs f' : 'Parallel LCR: I vs f'}
      </Text>
      <Text position={[0, -0.56, 0.001]} fontSize={0.045} color="#888" anchorX="center">Frequency →</Text>
      {resonantF > 0 && (
        <Text position={[toX(resonantF), 0.46, 0.003]} fontSize={0.045} color="#ffff00" anchorX="center">
          f_r={resonantF}Hz
        </Text>
      )}
    </group>
  );
};

/* ─────────────────────────────────────────────
   WIRE
───────────────────────────────────────────── */
const Wire = ({ from = [0, 0, 0], to = [1, 0, 0], color = '#ff4444' }) => {
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const angle = Math.atan2(dx, dz);
  return (
    <mesh position={mid} rotation={[0, angle, 0]}>
      <cylinderGeometry args={[0.008, 0.008, length, 6]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const LCR_DATA_SERIES = [
  { f: 100, i: 48 }, { f: 200, i: 112 }, { f: 300, i: 198 },
  { f: 400, i: 310 }, { f: 450, i: 420 }, { f: 500, i: 478 },  // resonance near 503
  { f: 503, i: 500 }, { f: 550, i: 446 }, { f: 600, i: 388 },
  { f: 700, i: 280 }, { f: 800, i: 198 }, { f: 900, i: 142 }, { f: 1000, i: 105 }
];
const LCR_DATA_PARALLEL = [
  { f: 100, i: 200 }, { f: 200, i: 155 }, { f: 300, i: 108 },
  { f: 400, i: 72 }, { f: 503, i: 22 },  // minimum at resonance
  { f: 600, i: 68 }, { f: 700, i: 112 }, { f: 800, i: 155 }, { f: 1000, i: 198 }
];

const PhysicsExp1 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [isOn, setIsOn] = useState(false);
  const [frequency, setFrequency] = useState(100);
  const [sweepIndex, setSweepIndex] = useState(0);
  const [mode, setMode] = useState('series');   // 'series' | 'parallel'
  const [revealedPoints, setRevealedPoints] = useState([]);
  const [resonanceReached, setResonanceReached] = useState(false);
  const [componentsPlaced, setComponentsPlaced] = useState(false);
  const [wiresConnected, setWiresConnected] = useState(false);
  const [isAutoSweeping, setIsAutoSweeping] = useState(false);

  const sweepTimer = useRef(0);
  const dataset = mode === 'series' ? LCR_DATA_SERIES : LCR_DATA_PARALLEL;

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  // Auto-sweep animation
  useFrame((state, delta) => {
    if (!isAutoSweeping) return;
    sweepTimer.current += delta;
    if (sweepTimer.current > 0.6) {
      sweepTimer.current = 0;
      setSweepIndex(prev => {
        const next = prev + 1;
        if (next >= dataset.length) {
          setIsAutoSweeping(false);
          const resonantF = mode === 'series' ? 503 : 503;
          setResonanceReached(true);
          playSuccess();

          // Auto-log observations
          const obs = {};
          dataset.forEach((pt, i) => {
            obs[i] = { 0: String(i + 1), 1: String(pt.f), 2: mode === 'series' ? String(pt.i) : '', 3: mode === 'parallel' ? String(pt.i) : '' };
          });
          setObservations(obs);

          if (mode === 'series') {
            setCurrentStep(2);
          } else {
            setCurrentStep(5);
          }
          return prev;
        }
        const point = dataset[next];
        setFrequency(point.f);
        setRevealedPoints(ps => [...ps, point]);
        return next;
      });
    }
  });

  const handlePlaceComponents = useCallback(() => {
    if (currentStep !== 0) return;
    playClick();
    setComponentsPlaced(true);
    setTimeout(() => { setCurrentStep(1); }, 600);
  }, [currentStep, setCurrentStep]);

  const handleConnectWires = useCallback(() => {
    if (currentStep !== 1) return;
    playClick();
    setWiresConnected(true);
    setTimeout(() => { setCurrentStep(2); }, 600);
  }, [currentStep, setCurrentStep]);

  const handlePowerOn = useCallback(() => {
    if (currentStep !== 2 && currentStep !== 4) return;
    playClick();
    setIsOn(true);
    if (currentStep === 2) setCurrentStep(3);
    if (currentStep === 4) setCurrentStep(5);
  }, [currentStep, setCurrentStep]);

  const handleStartSweep = useCallback(() => {
    if (currentStep !== 3 && currentStep !== 5) return;
    if (isAutoSweeping) return;
    playClick();
    setSweepIndex(0);
    setRevealedPoints([]);
    setResonanceReached(false);
    setIsAutoSweeping(true);
  }, [currentStep, isAutoSweeping]);

  const handleSwitchToParallel = useCallback(() => {
    if (currentStep !== 4) return;
    playClick();
    setMode('parallel');
    setRevealedPoints([]);
    setResonanceReached(false);
    setSweepIndex(0);
  }, [currentStep]);

  const currentI = revealedPoints.length > 0 ? revealedPoints[revealedPoints.length - 1].i : 0;

  const instructions = [
    '① Click R, L, C components to place on breadboard',
    '② Click Power Supply to connect wires',
    '③ Click Function Generator to turn ON',
    '④ Click [Start Sweep] to sweep frequency 100→1kHz',
    '⑤ Click [Switch to Parallel] then Power ON',
    '⑥ Click [Start Sweep] for parallel resonance',
    '⑦ Resonance found! Check Notebook for results.',
  ];

  return (
    <group>
      {/* ── Breadboard ── */}
      <Breadboard position={[0, -0.96, 0]} />

      {/* ── Components on board ── */}
      <Inductor
        position={[-0.6, -0.78, -0.1]}
        isGlowing={currentStep === 0}
        onClick={handlePlaceComponents}
      />
      <Capacitor
        position={[0, -0.72, -0.1]}
        isGlowing={currentStep === 0}
        onClick={handlePlaceComponents}
      />
      <Resistor
        position={[0.6, -0.78, -0.1]}
        isGlowing={currentStep === 0}
        onClick={handlePlaceComponents}
      />

      {/* ── Wires (visible when connected) ── */}
      {wiresConnected && (
        mode === 'series' ? (
          <>
            <Wire from={[-0.6, -0.78, -0.1]} to={[0, -0.78, -0.1]} color="#ff4444" />
            <Wire from={[0, -0.78, -0.1]} to={[0.6, -0.78, -0.1]} color="#ff4444" />
            <Wire from={[-0.6, -0.78, -0.1]} to={[-1.4, -0.78, 0.4]} color="#ff4444" />
            <Wire from={[0.6, -0.78, -0.1]} to={[1.4, -0.78, 0.4]} color="#4444ff" />
          </>
        ) : (
          <>
            {/* Top Common Rail (Red) */}
            <Wire from={[-0.6, -0.65, -0.1]} to={[0.6, -0.65, -0.1]} color="#ff4444" />
            {/* Bottom Common Rail (Blue) */}
            <Wire from={[-0.6, -0.95, -0.1]} to={[0.6, -0.95, -0.1]} color="#4444ff" />
            
            {/* Connections to power/meters */}
            <Wire from={[-0.6, -0.65, -0.1]} to={[-1.4, -0.78, 0.4]} color="#ff4444" />
            <Wire from={[0.6, -0.95, -0.1]} to={[1.4, -0.78, 0.4]} color="#4444ff" />
            
            {/* Inductor drops */}
            <Wire from={[-0.6, -0.65, -0.1]} to={[-0.6, -0.78, -0.25]} color="#aaaaaa" />
            <Wire from={[-0.6, -0.95, -0.1]} to={[-0.6, -0.78, 0.25]} color="#aaaaaa" />

            {/* Capacitor drops */}
            <Wire from={[0, -0.65, -0.1]} to={[0, -0.78, -0.1]} color="#aaaaaa" />
            <Wire from={[0, -0.95, -0.1]} to={[0, -0.78, -0.1]} color="#aaaaaa" />

            {/* Resistor drops */}
            <Wire from={[0.6, -0.65, -0.1]} to={[0.42, -0.78, -0.1]} color="#aaaaaa" />
            <Wire from={[0.6, -0.95, -0.1]} to={[0.78, -0.78, -0.1]} color="#aaaaaa" />
          </>
        )
      )}

      {/* ── Function Generator ── */}
      <FunctionGenerator
        position={[-2.2, -0.78, 0.4]}
        frequency={frequency}
        isOn={isOn}
        isGlowing={currentStep === 2 || currentStep === 4}
        onClick={handlePowerOn}
      />

      {/* ── Power Supply ── */}
      <PowerSupplyUnit
        position={[2.0, -0.78, 0.4]}
        isOn={isOn}
        isGlowing={currentStep === 1}
        onClick={handleConnectWires}
      />

      {/* ── Analog Meters ── */}
      <AnalogMeter
        position={[-1.2, -0.78, 0.8]}
        label={`${currentI.toFixed(0)} mA`}
        value={currentI}
        maxValue={500}
        isGlowing={isAutoSweeping}
      />
      <AnalogMeter
        position={[1.2, -0.78, 0.8]}
        label="Voltmeter"
        value={Math.min(currentI * 0.02, 10)}
        maxValue={10}
        isGlowing={isAutoSweeping}
      />

      {/* ── Live Graph Panel ── */}
      <group position={[0, 0.2, -1.8]} rotation={[0.2, 0, 0]}>
        <LiveGraph
          dataPoints={revealedPoints}
          resonantF={resonanceReached ? 503 : 0}
          mode={mode}
          position={[0, 0, 0]}
        />
      </group>

      {/* ── Resonance Flash ── */}
      {resonanceReached && (
        <group position={[0, 0.8, 0]}>
          <mesh>
            <planeGeometry args={[2.5, 0.35]} />
            <meshBasicMaterial color="#003322" transparent opacity={0.9} />
          </mesh>
          <Text fontSize={0.1} color="#00ffcc" anchorX="center" position={[0, 0, 0.01]}>
            {mode === 'series'
              ? '⚡ Series Resonance! f_r = 503 Hz  I_max = 500 mA'
              : '⚡ Parallel Resonance! f_r = 503 Hz  I_min = 22 mA'}
          </Text>
        </group>
      )}

      {/* ── Sweep / Mode Buttons (HTML-like 3D planes) ── */}
      {(currentStep === 3 || currentStep === 5) && !isAutoSweeping && (
        <mesh
          position={[0, 0.45, 0]}
          onClick={handleStartSweep}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[1.4, 0.22]} />
          <meshBasicMaterial color="#004433" />
          <Text position={[0, 0, 0.01]} fontSize={0.09} color="#00ffcc" anchorX="center">▶ START FREQ SWEEP</Text>
        </mesh>
      )}

      {currentStep === 3 && resonanceReached && (
        <mesh
          position={[0, 0.15, 0]}
          onClick={() => { setMode('parallel'); setCurrentStep(4); setRevealedPoints([]); setResonanceReached(false); playClick(); }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[1.6, 0.22]} />
          <meshBasicMaterial color="#330044" />
          <Text position={[0, 0, 0.01]} fontSize={0.09} color="#ff88ff" anchorX="center">↔ SWITCH TO PARALLEL</Text>
        </mesh>
      )}

      {/* ── Mode label ── */}
      <Text position={[2.2, 0.5, -1.2]} fontSize={0.08} color={mode === 'series' ? '#00ffcc' : '#ff88ff'} anchorX="center">
        Mode: {mode.toUpperCase()} LCR
      </Text>

      {/* ── Instruction text ── */}
      <group position={[0, 1.55, -2.0]} rotation={[0.15, 0, 0]}>
        <Text fontSize={0.075} color="#00ffcc" anchorX="center">
          {instructions[Math.min(currentStep, instructions.length - 1)]}
        </Text>
      </group>

      {/* Frequency indicator during sweep */}
      {isAutoSweeping && (
        <Text position={[-2.2, -0.4, 0.4]} fontSize={0.07} color="#ffff00" anchorX="center">
          {`Sweeping: ${frequency} Hz`}
        </Text>
      )}
    </group>
  );
};

export default PhysicsExp1;
