import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ────── PRIMITIVES ────── */

const SemiconductorWafer = ({ position = [0, 0, 0], isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry args={[0.18, 0.18, 0.02, 32]} />
      <meshStandardMaterial
        color={isGlowing ? '#88ccff' : '#555577'}
        emissive={isGlowing ? '#0033aa' : '#000'}
        emissiveIntensity={isGlowing ? 1.2 : 0}
        metalness={0.9} roughness={0.1}
      />
    </mesh>
    {/* 4 contact pads */}
    {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
      <mesh key={i} position={[x, 0.012, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.005, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
    ))}
    <Text position={[0, -0.2, 0]} fontSize={0.05} color="#aaa" anchorX="center">Ge Wafer</Text>
  </group>
);

const FourProbeApparatus = ({ position = [0, 0, 0], probesDown = false, isGlowing = false, onClick }) => {
  const probeY = probesDown ? -0.08 : 0.08;
  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.5, 0.06, 0.18]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* 4 probe needles */}
      {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
        <mesh key={i} position={[x, probeY, 0]}>
          <cylinderGeometry args={[0.005, 0.002, 0.18, 6]} />
          <meshStandardMaterial
            color={isGlowing ? '#aaddff' : '#ccc'}
            emissive={isGlowing ? '#0044aa' : '#000'}
            emissiveIntensity={isGlowing ? 0.8 : 0}
            metalness={0.9}
          />
        </mesh>
      ))}
      {/* Lower button */}
      <mesh
        position={[0, 0.06, 0]}
        onClick={onClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.14, 0.04, 0.1]} />
        <meshStandardMaterial color={isGlowing ? '#44aaff' : '#336699'} emissive={isGlowing ? '#003388' : '#000'} emissiveIntensity={isGlowing ? 0.8 : 0} />
      </mesh>
      <Text position={[0, 0.2, 0]} fontSize={0.048} color={isGlowing ? '#44aaff' : '#888'} anchorX="center">
        {probesDown ? 'PROBES ▼ IN CONTACT' : 'Click to Lower Probes'}
      </Text>
    </group>
  );
};

const HeatingBlock = ({ position = [0, 0, 0], temperature = 25, isGlowing = false, onClick }) => {
  const t = (temperature - 25) / 75; // 0–1
  const heatColor = `hsl(${30 - t * 30}, 90%, ${40 + t * 30}%)`;
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.55, 0.1, 0.35]} />
        <meshStandardMaterial color={heatColor} emissive={heatColor} emissiveIntensity={t * 0.6} metalness={0.5} roughness={0.3} />
      </mesh>
      <Text position={[0, 0.1, 0]} fontSize={0.048} color={t > 0.3 ? '#ff8800' : '#aaa'} anchorX="center">
        {`T = ${temperature.toFixed(0)} °C`}
      </Text>
      <Text position={[0, -0.18, 0]} fontSize={0.044} color="#888" anchorX="center">Heating Block</Text>
    </group>
  );
};

const DigitalMeter = ({ position = [0, 0, 0], label = 'V', reading = '0.000', unit = 'mV', isGlowing = false }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.52, 0.3, 0.1]} />
      <meshStandardMaterial color="#111" metalness={0.3} />
    </mesh>
    <mesh position={[0, 0.02, 0.052]}>
      <planeGeometry args={[0.38, 0.16]} />
      <meshBasicMaterial color={isGlowing ? '#001a00' : '#002200'} />
    </mesh>
    <Text position={[0, 0.02, 0.06]} fontSize={0.07} color={isGlowing ? '#00ff66' : '#006622'} anchorX="center">
      {reading}
    </Text>
    <Text position={[0, -0.1, 0.06]} fontSize={0.042} color="#888" anchorX="center">{unit}</Text>
    <Text position={[0, -0.22, 0]} fontSize={0.05} color={isGlowing ? '#aaddff' : '#666'} anchorX="center">{label}</Text>
  </group>
);

const Thermometer = ({ position = [0, 0, 0], temperature = 25 }) => {
  const t = Math.min((temperature - 0) / 100, 1);
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 1.0, 12]} />
        <meshStandardMaterial color="#ddeeff" transparent opacity={0.5} />
      </mesh>
      {/* Mercury column */}
      <mesh position={[0, -0.5 + t * 0.5, 0]}>
        <cylinderGeometry args={[0.012, 0.012, t * 1.0, 8]} />
        <meshBasicMaterial color="#cc2222" />
      </mesh>
      <Text position={[0.12, 0, 0]} fontSize={0.044} color="#aaa" anchorX="left">°C</Text>
      <Text position={[0, -0.62, 0]} fontSize={0.044} color="#888" anchorX="center">Thermometer</Text>
    </group>
  );
};

const ConstantCurrentSource = ({ position = [0, 0, 0], current = 5, isOn = false, isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.6, 0.4, 0.28]} />
      <meshStandardMaterial color={isGlowing ? '#1a3a1a' : '#111'} emissive={isGlowing ? '#004400' : '#000'} emissiveIntensity={isGlowing ? 0.5 : 0} metalness={0.4} />
    </mesh>
    <mesh position={[0, 0.04, 0.142]}>
      <planeGeometry args={[0.36, 0.18]} />
      <meshBasicMaterial color={isOn ? '#002200' : '#111'} />
    </mesh>
    <Text position={[0, 0.04, 0.15]} fontSize={0.055} color={isOn ? '#00ff66' : '#334433'} anchorX="center">
      {isOn ? `I = ${current} mA` : 'CURRENT SRC'}
    </Text>
    <Text position={[0, -0.28, 0]} fontSize={0.048} color="#777" anchorX="center">Const. Current Supply</Text>
  </group>
);

/* ── Arrhenius Graph ── */
const ArrheniusGraph = ({ dataPoints = [], position = [0, 0, 0] }) => {
  // dataPoints: { t: K, rho: Ω·cm }
  const filtered = dataPoints.filter(p => p.t > 0 && p.rho > 0);
  const yVals = filtered.map(p => Math.log(p.rho));
  const xVals = filtered.map(p => 1000 / p.t);
  const xMin = Math.min(...xVals, 2.5), xMax = Math.max(...xVals, 3.5);
  const yMin = Math.min(...yVals, -3), yMax = Math.max(...yVals, 5);
  const toX = (v) => ((v - xMin) / (xMax - xMin + 0.01)) * 1.4 - 0.7;
  const toY = (v) => ((v - yMin) / (yMax - yMin + 0.01)) * 0.8 - 0.4;

  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.6, 1.0]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.78, 0, 0.001]}><boxGeometry args={[0.008, 0.9, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.48, 0.001]}><boxGeometry args={[1.55, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {filtered.map((p, i) => (
        <mesh key={i} position={[toX(1000 / p.t), toY(Math.log(p.rho)), 0.002]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ff8800" />
        </mesh>
      ))}
      <Text position={[0, 0.56, 0.001]} fontSize={0.052} color="#ff8800" anchorX="center">Arrhenius: ln(ρ) vs 1000/T</Text>
      <Text position={[0.2, -0.56, 0.001]} fontSize={0.04} color="#666" anchorX="center">1000/T (K⁻¹) →</Text>
    </group>
  );
};

/* ──────────────────────────────────── MAIN ────────────────────────────────── */
const TEMP_STEPS = [25, 35, 45, 55, 65, 75, 85, 95];
// Simulated voltages at I=5mA (V=IR, R~semiconductor model)
const voltageAtTemp = (T) => {
  // Semiconductor: R decreases exponentially with T
  const Eg = 0.72; // Germanium
  const k = 8.617e-5;
  const sigma = Math.exp(-Eg / (2 * k * (T + 273)));
  const rho = 1 / sigma * 0.001; // normalized
  return (5 * rho).toFixed(2); // V = I*R (I=5mA)
};

const PhysicsExp2 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [waferPlaced, setWaferPlaced] = useState(false);
  const [probesDown, setProbesDown] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [tempIndex, setTempIndex] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [heating, setHeating] = useState(false);
  const [done, setDone] = useState(false);

  const heatTimer = useRef(0);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  useFrame((state, delta) => {
    if (!heating) return;
    heatTimer.current += delta;
    if (heatTimer.current > 1.2) {
      heatTimer.current = 0;
      setTempIndex(prev => {
        const next = prev + 1;
        if (next >= TEMP_STEPS.length) {
          setHeating(false);
          setDone(true);
          playSuccess();
          setCurrentStep(5);
          return prev;
        }
        const T = TEMP_STEPS[next];
        setTemperature(T);
        const V = parseFloat(voltageAtTemp(T));
        const rho = (V / 5) * 2 * Math.PI * 0.001; // simplified
        setDataPoints(ps => [...ps, { t: T + 273, rho }]);

        // Populate observation table
        setObservations(prev => ({
          ...prev,
          [next]: { 0: String(T), 1: String(T + 273), 2: String(V), 3: String(5), 4: (V / 5).toFixed(3) }
        }));
        return next;
      });
    }
  });

  const instructions = [
    '① Click the Ge wafer to place it on the heating block',
    '② Click Four-Probe apparatus to lower probes onto wafer',
    '③ Click Current Source to power ON (I = 5 mA)',
    '④ Click [Start Heating] to sweep temperature 25→95°C',
    '⑤ Heating in progress — readings auto-logged...',
    '⑥ Done! Open Notebook → Result to see Band Gap Eg',
  ];

  const currentV = voltageAtTemp(temperature);
  const currentR = (parseFloat(currentV) / 5).toFixed(3);

  return (
    <group>
      {/* Heating block (center) */}
      <HeatingBlock
        position={[0, -1.0, 0]}
        temperature={temperature}
        isGlowing={currentStep === 0}
        onClick={() => {
          if (currentStep !== 0) return;
          playClick();
          setWaferPlaced(true);
          setCurrentStep(1);
        }}
      />

      {/* Wafer (placed on top of block) */}
      {waferPlaced && (
        <SemiconductorWafer
          position={[0, -0.89, 0]}
          isGlowing={currentStep === 1}
        />
      )}
      {!waferPlaced && (
        <SemiconductorWafer
          position={[0.8, -0.85, -0.5]}
          isGlowing={currentStep === 0}
          onClick={() => {
            if (currentStep !== 0) return;
            playClick();
            setWaferPlaced(true);
            setCurrentStep(1);
          }}
        />
      )}

      {/* Four-probe apparatus above wafer */}
      <FourProbeApparatus
        position={[0, -0.7, 0]}
        probesDown={probesDown}
        isGlowing={currentStep === 1}
        onClick={() => {
          if (currentStep !== 1) return;
          playClick();
          setProbesDown(true);
          setCurrentStep(2);
        }}
      />

      {/* Constant current source */}
      <ConstantCurrentSource
        position={[-1.8, -0.88, 0.2]}
        current={5}
        isOn={isOn}
        isGlowing={currentStep === 2}
        onClick={() => {
          if (currentStep !== 2) return;
          playClick();
          setIsOn(true);
          setCurrentStep(3);
        }}
      />

      {/* Voltmeter */}
      <DigitalMeter
        position={[1.5, -0.78, 0.2]}
        label="Voltmeter (V23)"
        reading={isOn ? currentV : '---'}
        unit="mV"
        isGlowing={isOn}
      />

      {/* Milliammeter */}
      <DigitalMeter
        position={[-1.5, -0.6, 0.5]}
        label="Milliammeter"
        reading={isOn ? '5.00' : '---'}
        unit="mA"
        isGlowing={isOn}
      />

      {/* Thermometer */}
      <Thermometer position={[0.7, -0.55, 0.5]} temperature={temperature} />

      {/* Start heating button */}
      {currentStep === 3 && !heating && (
        <mesh
          position={[0, 0.4, 0]}
          onClick={() => {
            playClick();
            setHeating(true);
            setCurrentStep(4);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[1.5, 0.22]} />
          <meshBasicMaterial color="#331100" />
          <Text position={[0, 0, 0.01]} fontSize={0.09} color="#ff8800" anchorX="center">▶ START HEATING (25→95°C)</Text>
        </mesh>
      )}

      {/* Arrhenius Graph */}
      <group position={[0, 0.15, -1.9]} rotation={[0.15, 0, 0]}>
        <ArrheniusGraph dataPoints={dataPoints} />
      </group>

      {/* Done badge */}
      {done && (
        <group position={[0, 0.9, 0]}>
          <mesh><planeGeometry args={[2.5, 0.3]} /><meshBasicMaterial color="#002200" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.09} color="#00ff88" anchorX="center" position={[0, 0, 0.01]}>
            ✅ Band Gap Eg ≈ 0.72 eV (Germanium) from graph slope
          </Text>
        </group>
      )}

      {/* Instruction text */}
      <group position={[0, 1.55, -2.0]} rotation={[0.15, 0, 0]}>
        <Text fontSize={0.075} color="#00ffcc" anchorX="center">
          {instructions[Math.min(currentStep, instructions.length - 1)]}
        </Text>
      </group>
    </group>
  );
};

export default PhysicsExp2;
