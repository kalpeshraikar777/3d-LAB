import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ──────── LED DATA ──────── */
const LED_DATA = [
  { color: 'Red',    hex: '#ff2200', emissive: '#cc0000', wavelength: 650, threshV: 1.82 },
  { color: 'Yellow', hex: '#ffcc00', emissive: '#aa8800', wavelength: 590, threshV: 2.10 },
  { color: 'Green',  hex: '#00ee44', emissive: '#007722', wavelength: 520, threshV: 2.30 },
  { color: 'Blue',   hex: '#2244ff', emissive: '#001188', wavelength: 450, threshV: 3.25 },
  { color: 'UV',     hex: '#cc44ff', emissive: '#660088', wavelength: 380, threshV: 3.82 },
];

const e = 1.6e-19;
const c = 3e8;
const h_true = 6.626e-34;

/* ──────── PRIMITIVES ──────── */

const LEDComponent = ({ position = [0, 0, 0], led, isOn = false, isSelected = false, onClick }) => (
  <group position={position}>
    {/* Body */}
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry args={[0.06, 0.05, 0.14, 16]} />
      <meshStandardMaterial
        color={led.hex}
        emissive={isOn ? led.emissive : '#000'}
        emissiveIntensity={isOn ? 2.5 : 0}
        roughness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
    {/* Leads */}
    <mesh position={[0.02, -0.12, 0]}>
      <cylinderGeometry args={[0.004, 0.004, 0.12, 6]} />
      <meshStandardMaterial color="#aaa" metalness={1} />
    </mesh>
    <mesh position={[-0.02, -0.12, 0]}>
      <cylinderGeometry args={[0.004, 0.004, 0.1, 6]} />
      <meshStandardMaterial color="#aaa" metalness={1} />
    </mesh>
    {/* Glow halo when ON */}
    {isOn && (
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color={led.hex} transparent opacity={0.18} />
      </mesh>
    )}
    {/* Point light when ON */}
    {isOn && <pointLight color={led.hex} intensity={1.5} distance={0.6} />}

    {/* Selection ring */}
    {isSelected && (
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.008, 6, 24]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
    )}
    <Text position={[0, 0.2, 0]} fontSize={0.045} color={isOn ? led.hex : '#666'} anchorX="center">
      {led.color}
    </Text>
    <Text position={[0, -0.28, 0]} fontSize={0.038} color="#555" anchorX="center">
      {led.wavelength}nm
    </Text>
  </group>
);

const Potentiometer = ({ position = [0, 0, 0], voltage = 0, maxV = 4, isGlowing = false, onIncrease, onDecrease }) => {
  const angle = (voltage / maxV) * Math.PI * 1.5 - Math.PI * 0.75;
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} />
        <meshStandardMaterial color="#222" metalness={0.5} />
      </mesh>
      {/* Knob */}
      <mesh position={[0, 0.05, 0]} rotation={[0, -angle, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color={isGlowing ? '#226644' : '#333'} emissive={isGlowing ? '#006622' : '#000'} emissiveIntensity={isGlowing ? 0.6 : 0} />
      </mesh>
      {/* Indicator line */}
      <mesh position={[Math.sin(angle) * 0.07, 0.077, Math.cos(angle) * 0.07]}>
        <boxGeometry args={[0.015, 0.02, 0.015]} />
        <meshBasicMaterial color="#00ff88" />
      </mesh>
      {/* + / - buttons */}
      <mesh position={[0.28, 0.02, 0]} onClick={onIncrease}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.1, 0.08, 0.05]} />
        <meshBasicMaterial color="#003322" />
        <Text position={[0, 0, 0.026]} fontSize={0.06} color="#00ff88" anchorX="center">+</Text>
      </mesh>
      <mesh position={[-0.28, 0.02, 0]} onClick={onDecrease}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.1, 0.08, 0.05]} />
        <meshBasicMaterial color="#330011" />
        <Text position={[0, 0, 0.026]} fontSize={0.06} color="#ff6666" anchorX="center">−</Text>
      </mesh>
      <Text position={[0, 0.18, 0]} fontSize={0.06} color="#00ff88" anchorX="center">
        {voltage.toFixed(2)} V
      </Text>
      <Text position={[0, -0.14, 0]} fontSize={0.046} color="#888" anchorX="center">Potentiometer</Text>
    </group>
  );
};

const DigitalDisplay = ({ position = [0, 0, 0], value = '0.000', label = '', unit = '', color = '#00ff88' }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.44, 0.28, 0.08]} />
      <meshStandardMaterial color="#111" metalness={0.3} />
    </mesh>
    <mesh position={[0, 0.02, 0.042]}>
      <planeGeometry args={[0.34, 0.14]} />
      <meshBasicMaterial color="#001100" />
    </mesh>
    <Text position={[0, 0.02, 0.05]} fontSize={0.062} color={color} anchorX="center">{value}</Text>
    <Text position={[0.1, -0.07, 0.05]} fontSize={0.038} color="#666" anchorX="center">{unit}</Text>
    <Text position={[0, -0.2, 0]} fontSize={0.044} color="#777" anchorX="center">{label}</Text>
  </group>
);

/* ── V₀ vs Frequency Graph ── */
const PlanckGraph = ({ dataPoints = [], slopeLine = null, position = [0, 0, 0] }) => {
  const freqs = dataPoints.map(p => p.freq);
  const vols = dataPoints.map(p => p.v);
  const fMin = 4.5e14, fMax = 8e14;
  const vMin = 0, vMax = 4;
  const toX = (f) => ((f - fMin) / (fMax - fMin)) * 1.4 - 0.7;
  const toY = (v) => (v / vMax) * 0.82 - 0.41;

  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.6, 1.0]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.78, 0, 0.001]}><boxGeometry args={[0.008, 0.9, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.48, 0.001]}><boxGeometry args={[1.55, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {dataPoints.map((p, i) => (
        <mesh key={i} position={[toX(p.freq), toY(p.v), 0.002]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={p.color} />
        </mesh>
      ))}
      <Text position={[0, 0.56, 0.001]} fontSize={0.048} color="#ffcc00" anchorX="center">V₀ vs Frequency (slope = h/e)</Text>
      <Text position={[0.45, -0.56, 0.001]} fontSize={0.04} color="#666" anchorX="center">ν (Hz) →</Text>
    </group>
  );
};

/* ──────────────── MAIN ──────────────── */
const PhysicsExp6 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [voltage, setVoltage] = useState(0);
  const [completedLEDs, setCompletedLEDs] = useState([]);
  const [graphPoints, setGraphPoints] = useState([]);
  const [done, setDone] = useState(false);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  const led = LED_DATA[selectedIdx];
  const isOn = voltage >= led.threshV;
  const current = isOn ? (voltage - led.threshV) * 20 : 0; // mA

  const recordLED = () => {
    if (!isOn || completedLEDs.includes(selectedIdx)) return;
    playSuccess();

    const freq = c / (led.wavelength * 1e-9);
    const h_meas = (e * led.threshV * led.wavelength * 1e-9) / c;

    const newPoint = { freq, v: led.threshV, color: led.hex };
    const newPts = [...graphPoints, newPoint];
    setGraphPoints(newPts);

    const newCompleted = [...completedLEDs, selectedIdx];
    setCompletedLEDs(newCompleted);

    // Update observation table
    setObservations(prev => ({
      ...prev,
      [selectedIdx]: {
        0: led.color,
        1: String(led.wavelength),
        2: (freq / 1e14).toFixed(2) + ' × 10¹⁴',
        3: led.threshV.toFixed(2),
        4: h_meas.toExponential(3)
      }
    }));

    if (newCompleted.length >= LED_DATA.length) {
      setDone(true);
      setCurrentStep(5);
    } else {
      setCurrentStep(Math.max(currentStep, 2));
    }
  };

  const increaseV = () => {
    setVoltage(prev => Math.min(prev + 0.1, 4.5));
    playClick();
    if (currentStep < 1) setCurrentStep(1);
  };
  const decreaseV = () => {
    setVoltage(prev => Math.max(prev - 0.1, 0));
    playClick();
  };

  const selectLED = (i) => {
    setSelectedIdx(i);
    setVoltage(0);
    playClick();
    if (currentStep === 0) setCurrentStep(1);
  };

  // Mean h
  const hValues = completedLEDs.map(i => {
    const led = LED_DATA[i];
    return (e * led.threshV * led.wavelength * 1e-9) / c;
  });
  const meanH = hValues.length > 0 ? hValues.reduce((a, b) => a + b, 0) / hValues.length : 0;
  const errPct = meanH > 0 ? Math.abs(meanH - h_true) / h_true * 100 : 0;

  const instructions = [
    '① Click an LED color to select it',
    '② Use + / − to slowly increase voltage',
    '③ LED lights up at threshold V₀ — click RECORD',
    '④ Repeat for all 5 LED colors',
    '⑤ Graph builds — slope = h/e. Open Notebook for h value.',
  ];

  return (
    <group>
      {/* LEDs on breadboard */}
      {LED_DATA.map((ld, i) => (
        <LEDComponent
          key={ld.color}
          position={[-0.8 + i * 0.4, -0.82, 0]}
          led={ld}
          isOn={i === selectedIdx && voltage >= ld.threshV}
          isSelected={i === selectedIdx}
          onClick={() => selectLED(i)}
        />
      ))}

      {/* Potentiometer */}
      <Potentiometer
        position={[0, -0.72, 0.7]}
        voltage={voltage}
        maxV={4}
        isGlowing={currentStep >= 1}
        onIncrease={increaseV}
        onDecrease={decreaseV}
      />

      {/* Voltmeter */}
      <DigitalDisplay
        position={[-1.2, -0.72, 0.7]}
        value={voltage.toFixed(2)}
        label="Voltmeter"
        unit="V"
        color={isOn ? led.hex : '#00ff88'}
      />

      {/* Milliammeter */}
      <DigitalDisplay
        position={[1.2, -0.72, 0.7]}
        value={current.toFixed(1)}
        label="Milliammeter"
        unit="mA"
        color={isOn ? '#ffcc00' : '#00ff88'}
      />

      {/* Power supply */}
      <group position={[0, -0.72, -0.6]}>
        <mesh>
          <boxGeometry args={[0.6, 0.38, 0.24]} />
          <meshStandardMaterial color="#111" metalness={0.4} />
        </mesh>
        <Text position={[0, -0.28, 0]} fontSize={0.046} color="#777" anchorX="center">DC 0–5V Supply</Text>
      </group>

      {/* Threshold popup */}
      {isOn && !completedLEDs.includes(selectedIdx) && (
        <group position={[0, 0.7, 0]}>
          <mesh><planeGeometry args={[2.6, 0.28]} /><meshBasicMaterial color="#003322" transparent opacity={0.95} /></mesh>
          <Text fontSize={0.08} color={led.hex} anchorX="center" position={[0, 0, 0.01]}>
            {`⚡ ${led.color} LED ON! V₀ = ${led.threshV}V — Click RECORD`}
          </Text>
        </group>
      )}

      {/* RECORD button */}
      {isOn && !completedLEDs.includes(selectedIdx) && (
        <mesh
          position={[0, 0.38, 0.8]}
          onClick={recordLED}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[1.2, 0.22]} />
          <meshBasicMaterial color="#003322" />
          <Text position={[0, 0, 0.01]} fontSize={0.09} color="#00ffcc" anchorX="center">📝 RECORD V₀</Text>
        </mesh>
      )}

      {/* Completed badges */}
      {completedLEDs.map(i => (
        <Text key={i} position={[-0.8 + i * 0.4, -0.55, 0.08]} fontSize={0.06} color="#00ff88" anchorX="center">✓</Text>
      ))}

      {/* Graph */}
      <group position={[0, 0.1, -1.9]} rotation={[0.15, 0, 0]}>
        <PlanckGraph dataPoints={graphPoints} />
      </group>

      {/* h value */}
      {meanH > 0 && (
        <group position={[0, 1.0, -1.9]} rotation={[0.15, 0, 0]}>
          <Text fontSize={0.06} color="#ffcc00" anchorX="center">
            {`h = ${(meanH * 1e34).toFixed(3)} × 10⁻³⁴ J·s  |  Error = ${errPct.toFixed(1)}%`}
          </Text>
        </group>
      )}

      {/* Done */}
      {done && (
        <group position={[0, 0.88, 0]}>
          <mesh><planeGeometry args={[3.0, 0.28]} /><meshBasicMaterial color="#002200" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.08} color="#00ff88" anchorX="center" position={[0, 0, 0.01]}>
            ✅ All LEDs measured! Planck's constant determined.
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

export default PhysicsExp6;
