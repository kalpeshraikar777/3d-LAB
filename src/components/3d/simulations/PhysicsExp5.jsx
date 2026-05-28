import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ──────── PHYSICS ──────── */
const EPS0 = 8.854e-12;
const PLATE_AREA = 0.04; // 20cm × 20cm = 0.04 m²

const DIELECTRICS = [
  { name: 'Air',      er: 1.0,   color: '#aaddff', d: 0.5, textureColor: 'transparent' },
  { name: 'Paper',    er: 3.7,   color: '#f5deb3', d: 0.5, textureColor: '#f5deb3' },
  { name: 'Mica',     er: 6.5,   color: '#d4e8c2', d: 0.5, textureColor: '#b0d090' },
  { name: 'Glass',    er: 7.5,   color: '#aaddff', d: 1.0, textureColor: '#88bbff' },
  { name: 'Ceramic',  er: 80.0,  color: '#e8e0d0', d: 1.0, textureColor: '#ccc0a0' },
];

const computeCapacitance = (er, dMm) => (er * EPS0 * PLATE_AREA) / (dMm * 1e-3); // Farads
const computeHalfLife = (C, R = 1000) => Math.log(2) * R * C; // seconds
const chargeVoltage = (V0, t, tau) => V0 * (1 - Math.exp(-t / tau));
const dischargeVoltage = (V0, t, tau) => V0 * Math.exp(-t / tau);

/* ──────── PRIMITIVES ──────── */

const CapacitorPlates = ({ position = [0, 0, 0], dielectric, spacing = 0.5, isGlowing = false }) => {
  const plateH = 0.8;
  const plateW = 0.8;
  const dielThick = spacing * 0.8;

  return (
    <group position={position}>
      {/* Top plate */}
      <mesh position={[0, spacing / 2 + 0.02, 0]}>
        <boxGeometry args={[plateW, 0.03, plateH]} />
        <meshStandardMaterial color={isGlowing ? '#ffcc44' : '#cc9900'} metalness={0.9} roughness={0.1} emissive={isGlowing ? '#442200' : '#000'} emissiveIntensity={isGlowing ? 0.8 : 0} />
      </mesh>
      {/* Bottom plate */}
      <mesh position={[0, -spacing / 2 - 0.02, 0]}>
        <boxGeometry args={[plateW, 0.03, plateH]} />
        <meshStandardMaterial color={isGlowing ? '#ffcc44' : '#cc9900'} metalness={0.9} roughness={0.1} emissive={isGlowing ? '#442200' : '#000'} emissiveIntensity={isGlowing ? 0.8 : 0} />
      </mesh>
      {/* Dielectric slab */}
      {dielectric && dielectric.name !== 'Air' && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[plateW * 0.96, dielThick, plateH * 0.96]} />
          <meshStandardMaterial
            color={dielectric.textureColor}
            transparent
            opacity={0.7}
            roughness={0.8}
          />
        </mesh>
      )}
      {/* Field lines during charging */}
      {isGlowing && Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-0.3 + i * 0.15, 0, 0]}>
          <boxGeometry args={[0.005, spacing * 0.9, 0.005]} />
          <meshBasicMaterial color="#ffdd00" transparent opacity={0.5} />
        </mesh>
      ))}
      <Text position={[0.55, spacing / 2 + 0.1, 0]} fontSize={0.05} color="#aaa" anchorX="center">
        +
      </Text>
      <Text position={[0.55, -spacing / 2 - 0.1, 0]} fontSize={0.05} color="#aaa" anchorX="center">
        −
      </Text>
    </group>
  );
};

const VoltmeterAnalog = ({ position = [0, 0, 0], voltage = 0, maxV = 8 }) => {
  const angle = (-Math.PI / 3) + (voltage / maxV) * (2 * Math.PI / 3);
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshBasicMaterial color="#fffff0" />
      </mesh>
      {/* Needle */}
      <mesh position={[Math.sin(angle) * 0.1, 0.032, -Math.cos(angle) * 0.1]} rotation={[Math.PI / 2, 0, angle]}>
        <boxGeometry args={[0.005, 0.16, 0.002]} />
        <meshBasicMaterial color="#cc2200" />
      </mesh>
      <Text position={[0, 0.03, 0.19]} fontSize={0.05} color="#444" anchorX="center">{voltage.toFixed(1)}V</Text>
      <Text position={[0, -0.16, 0]} fontSize={0.05} color="#888" anchorX="center">Voltmeter</Text>
    </group>
  );
};

const SwitchComponent = ({ position = [0, 0, 0], mode = 'off', isGlowing = false, onCharge, onDischarge }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.35, 0.12, 0.12]} />
      <meshStandardMaterial color="#222" metalness={0.5} />
    </mesh>
    {/* CHARGE */}
    <mesh
      position={[-0.12, 0.09, 0]}
      onClick={onCharge}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.12, 0.07, 0.1]} />
      <meshBasicMaterial color={mode === 'charge' ? '#003322' : '#112211'} />
      <Text position={[0, 0, 0.052]} fontSize={0.04} color={mode === 'charge' ? '#00ffcc' : '#336644'} anchorX="center">CHG</Text>
    </mesh>
    {/* DISCHARGE */}
    <mesh
      position={[0.12, 0.09, 0]}
      onClick={onDischarge}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.12, 0.07, 0.1]} />
      <meshBasicMaterial color={mode === 'discharge' ? '#331100' : '#221111'} />
      <Text position={[0, 0, 0.052]} fontSize={0.04} color={mode === 'discharge' ? '#ff8800' : '#664433'} anchorX="center">DCH</Text>
    </mesh>
    <Text position={[0, -0.14, 0]} fontSize={0.046} color="#888" anchorX="center">CHARGE / DISCHARGE</Text>
  </group>
);

/* ── Charge/Discharge Graph ── */
const ChargeDischargGraph = ({ chargeData = [], dischargeData = [], maxV = 8, position = [0, 0, 0] }) => {
  const allT = [...chargeData, ...dischargeData].map(p => p.t);
  const tMax = Math.max(...allT, 5);
  const toX = (t) => (t / tMax) * 1.4 - 0.7;
  const toY = (v) => (v / maxV) * 0.8 - 0.4;
  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.6, 1.0]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.78, 0, 0.001]}><boxGeometry args={[0.008, 0.9, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.48, 0.001]}><boxGeometry args={[1.55, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {chargeData.map((p, i) => (
        <mesh key={`c${i}`} position={[toX(p.t), toY(p.v), 0.002]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#00eecc" />
        </mesh>
      ))}
      {dischargeData.map((p, i) => (
        <mesh key={`d${i}`} position={[toX(p.t), toY(p.v), 0.002]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#ff8800" />
        </mesh>
      ))}
      <Text position={[0, 0.56, 0.001]} fontSize={0.048} color="#00eecc" anchorX="center">Vc vs t (Cyan=charge, Orange=discharge)</Text>
      <Text position={[0.4, -0.56, 0.001]} fontSize={0.04} color="#666" anchorX="center">Time (s) →</Text>
    </group>
  );
};

/* ── Selector ── */
const DielectricSelector = ({ position = [0, 0, 0], current, onSelect }) => (
  <group position={position}>
    <Text position={[0, 0.32, 0]} fontSize={0.052} color="#aaa" anchorX="center">Select Dielectric:</Text>
    {DIELECTRICS.map((d, i) => (
      <mesh
        key={d.name}
        position={[-0.8 + i * 0.4, 0, 0]}
        onClick={() => onSelect(i)}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.32, 0.22, 0.04]} />
        <meshBasicMaterial color={current === i ? '#003322' : '#111'} />
        <Text position={[0, 0.04, 0.022]} fontSize={0.04} color={current === i ? '#00ffcc' : '#555'} anchorX="center">{d.name}</Text>
        <Text position={[0, -0.06, 0.022]} fontSize={0.038} color={current === i ? '#88ffcc' : '#444'} anchorX="center">{`εr=${d.er}`}</Text>
      </mesh>
    ))}
  </group>
);

/* ──────────────── MAIN ──────────────── */
const PhysicsExp5 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [dielIdx, setDielIdx] = useState(0);
  const [switchMode, setSwitchMode] = useState('off');
  const [voltage, setVoltage] = useState(0);
  const [chargeData, setChargeData] = useState([]);
  const [dischargeData, setDischargeData] = useState([]);
  const [runningPhase, setRunningPhase] = useState(null);  // 'charge' | 'discharge' | null
  const [phaseTime, setPhaseTime] = useState(0);
  const [resultsData, setResultsData] = useState([]);
  const [done, setDone] = useState(false);

  const timer = useRef(0);
  const startV = useRef(8);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  const dielectric = DIELECTRICS[dielIdx];
  const C = computeCapacitance(dielectric.er, dielectric.d);
  const R = 1000; // 1kΩ
  const tau = R * C;

  useFrame((state, delta) => {
    if (!runningPhase) return;
    timer.current += delta;
    setPhaseTime(prev => prev + delta);
    const t = phaseTime + delta;

    if (runningPhase === 'charge') {
      const v = chargeVoltage(8, t, tau);
      setVoltage(v);
      if (timer.current > 0.15) {
        timer.current = 0;
        setChargeData(prev => [...prev, { t, v }]);
        if (v >= 7.95) {
          setRunningPhase(null);
          setCurrentStep(prev => Math.max(prev, 2));
        }
      }
    } else if (runningPhase === 'discharge') {
      const v = dischargeVoltage(startV.current, t, tau);
      setVoltage(v);
      if (timer.current > 0.15) {
        timer.current = 0;
        setDischargeData(prev => [...prev, { t, v }]);
        if (v <= 0.05) {
          setRunningPhase(null);
          // Log result
          const newResult = { name: dielectric.name, er: dielectric.er, C: C.toExponential(2), tau: tau.toFixed(4) };
          setResultsData(prev => {
            const updated = [...prev, newResult];
            if (updated.length >= 3) {
              playSuccess();
              setDone(true);
              setCurrentStep(6);
              // Auto populate obs table
              const obs = {};
              updated.forEach((r, i) => {
                obs[i] = { 0: r.name, 1: dielectric.d.toString(), 2: '400', 3: r.C, 4: computeCapacitance(1.0, dielectric.d).toExponential(2), 5: r.er.toString() };
              });
              setObservations(obs);
            }
            return updated;
          });
        }
      }
    }
  });

  const startCharge = () => {
    playClick();
    setSwitchMode('charge');
    setChargeData([]);
    setPhaseTime(0);
    timer.current = 0;
    setRunningPhase('charge');
    if (currentStep < 1) setCurrentStep(1);
  };
  const startDischarge = () => {
    if (voltage < 0.5) return;
    playClick();
    setSwitchMode('discharge');
    startV.current = voltage;
    setDischargeData([]);
    setPhaseTime(0);
    timer.current = 0;
    setRunningPhase('discharge');
    if (currentStep < 2) setCurrentStep(2);
  };

  const instructions = [
    '① Select a dielectric material below, then click CHARGE',
    '② Charging... wait for voltage to reach 8V',
    '③ Voltage stable. Click DISCHARGE to see exponential decay',
    '④ Discharge complete. Try another dielectric!',
    '⑤ Compare results — εr determined for each material',
    '⑥ All measurements done!',
    '⑦ Results complete! Open Notebook → Result for εr values',
  ];

  return (
    <group>
      {/* Capacitor plates (center) */}
      <CapacitorPlates
        position={[-0.4, -0.65, 0]}
        dielectric={dielectric}
        spacing={0.35}
        isGlowing={runningPhase === 'charge'}
      />

      {/* Voltmeter */}
      <VoltmeterAnalog position={[1.3, -0.82, 0.2]} voltage={voltage} maxV={8} />

      {/* Battery/Supply */}
      <group position={[-2.0, -0.82, 0.2]}>
        <mesh>
          <boxGeometry args={[0.55, 0.35, 0.22]} />
          <meshStandardMaterial color="#111" metalness={0.4} />
        </mesh>
        <Text position={[0, -0.28, 0]} fontSize={0.048} color="#888" anchorX="center">8V DC Supply</Text>
        <mesh position={[0, 0, 0.112]}>
          <planeGeometry args={[0.36, 0.16]} />
          <meshBasicMaterial color="#002200" />
        </mesh>
        <Text position={[0, 0, 0.12]} fontSize={0.06} color="#00ff66" anchorX="center">8.0 V</Text>
      </group>

      {/* Switch */}
      <SwitchComponent
        position={[0.0, -0.82, 0.5]}
        mode={switchMode}
        onCharge={startCharge}
        onDischarge={startDischarge}
      />

      {/* Dielectric selector */}
      <group position={[0, -1.3, 0.8]}>
        <DielectricSelector
          current={dielIdx}
          onSelect={(i) => {
            setDielIdx(i);
            setVoltage(0);
            setChargeData([]);
            setDischargeData([]);
            setRunningPhase(null);
            setSwitchMode('off');
            setCurrentStep(0);
            playClick();
          }}
        />
      </group>

      {/* Live εr */}
      <group position={[-0.4, -0.2, 0]}>
        <Text fontSize={0.06} color="#aaddff" anchorX="center">{`Material: ${dielectric.name}  εr = ${dielectric.er}`}</Text>
        <Text position={[0, -0.1, 0]} fontSize={0.052} color="#ffcc88" anchorX="center">{`C = ${C.toExponential(2)} F  τ = ${tau.toFixed(4)} s`}</Text>
      </group>

      {/* Graph */}
      <group position={[0, 0.1, -1.85]} rotation={[0.15, 0, 0]}>
        <ChargeDischargGraph chargeData={chargeData} dischargeData={dischargeData} maxV={8} />
      </group>

      {/* Done */}
      {done && (
        <group position={[0, 0.85, 0]}>
          <mesh><planeGeometry args={[3.2, 0.3]} /><meshBasicMaterial color="#002211" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.08} color="#00ff88" anchorX="center" position={[0, 0, 0.01]}>
            ✅ Dielectric constants measured! Open Notebook for results.
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

export default PhysicsExp5;
