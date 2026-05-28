import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ──── PHYSICS ──── */
// Copper coil: R = R0(1 + α·T) where α = 3.9e-3 /°C
const R0 = 2.0;    // Ω at 0°C
const ALPHA = 3.86e-3; // /°C
const CURRENT = 200;   // mA (constant)
const C_FERMI = 1.1216e-18; // J constant for EF formula

const resistanceAtT = (T_C) => R0 * (1 + ALPHA * T_C); // Ω
const voltageAtT = (T_C) => resistanceAtT(T_C) * (CURRENT / 1000) * 1000; // mV

const TEMP_STEPS = [30, 40, 50, 60, 70, 80, 90, 100];

/* ──── PRIMITIVES ──── */

const CopperCoil = ({ position = [0, 0, 0], temperature = 30, isSubmerged = false, isGlowing = false }) => {
  const t = (temperature - 25) / 75;
  const glowColor = `hsl(${20 - t * 20}, 80%, ${40 + t * 20}%)`;
  return (
    <group position={position}>
      {/* Coil turns */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0, -0.25 + i * 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.012, 8, 20]} />
          <meshStandardMaterial
            color="#cc8800"
            emissive={glowColor}
            emissiveIntensity={t * 0.4}
            metalness={0.8} roughness={0.2}
          />
        </mesh>
      ))}
      {/* Lead wires */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.2, 6]} />
        <meshStandardMaterial color="#cc4400" metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.2, 6]} />
        <meshStandardMaterial color="#cc4400" metalness={0.9} />
      </mesh>
      <Text position={[0.25, 0, 0]} fontSize={0.048} color={isGlowing ? '#ffcc44' : '#888'} anchorX="center">Cu Coil</Text>
    </group>
  );
};

const WaterBath = ({ position = [0, 0, 0], temperature = 30, isHeating = false }) => {
  const fillLevel = 0.7;
  const t = (temperature - 25) / 75;
  const waterColor = t > 0.6 ? '#dd4422' : t > 0.3 ? '#cc7733' : '#3366bb';
  return (
    <group position={position}>
      {/* Beaker outer */}
      <mesh>
        <cylinderGeometry args={[0.38, 0.33, 0.85, 16]} />
        <meshStandardMaterial color="#aaccdd" transparent opacity={0.25} roughness={0.1} />
      </mesh>
      {/* Water fill */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.34, 0.3, fillLevel * 0.75, 16]} />
        <meshStandardMaterial color={waterColor} transparent opacity={0.55} />
      </mesh>
      {/* Bubbles when hot */}
      {isHeating && t > 0.5 && Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 0.3,
          -0.1 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.3
        ]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#aaddff" transparent opacity={0.5} />
        </mesh>
      ))}
      <Text position={[0, -0.56, 0]} fontSize={0.048} color="#aaa" anchorX="center">Water Bath (250mL)</Text>
    </group>
  );
};

const HotPlate = ({ position = [0, 0, 0], isOn = false, isGlowing = false, onClick }) => {
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color={isOn ? '#993311' : '#333'} emissive={isOn ? '#441100' : '#000'} emissiveIntensity={isOn ? 0.8 : 0} metalness={0.5} />
      </mesh>
      {/* Heating coil pattern */}
      {isOn && Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, 0.045, -0.2 + i * 0.13]}>
          <boxGeometry args={[0.55, 0.008, 0.015]} />
          <meshBasicMaterial color="#ff4400" />
        </mesh>
      ))}
      <Text position={[0, -0.1, 0]} fontSize={0.046} color={isOn ? '#ff8844' : '#666'} anchorX="center">
        {isOn ? '🔥 Hot Plate ON' : 'Click to Power Hot Plate'}
      </Text>
    </group>
  );
};

const ThermometerTall = ({ position = [0, 0, 0], temperature = 25 }) => {
  const t = Math.min((temperature - 0) / 110, 1);
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.022, 0.022, 1.1, 12]} />
        <meshStandardMaterial color="#ddeeff" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.55 + t * 0.55, 0]}>
        <cylinderGeometry args={[0.01, 0.01, t * 1.1, 8]} />
        <meshBasicMaterial color="#ee2222" />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#ee2222" />
      </mesh>
      <Text position={[0.1, 0, 0]} fontSize={0.042} color="#aaa" anchorX="left">{temperature.toFixed(0)}°C</Text>
      <Text position={[0, -0.72, 0]} fontSize={0.042} color="#888" anchorX="center">Thermometer</Text>
    </group>
  );
};

/* ── R vs T Graph ── */
const RvsTGraph = ({ dataPoints = [], slope = null, position = [0, 0, 0] }) => {
  const tMin = 25, tMax = 110;
  const rMin = 2.0, rMax = 2.9;
  const toX = (T) => ((T - tMin) / (tMax - tMin)) * 1.4 - 0.7;
  const toY = (R) => ((R - rMin) / (rMax - rMin)) * 0.82 - 0.41;

  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.6, 1.0]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.78, 0, 0.001]}><boxGeometry args={[0.008, 0.9, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.48, 0.001]}><boxGeometry args={[1.55, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {/* Theoretical line */}
      <mesh position={[0, 0, 0.001]} rotation={[0, 0, Math.atan((R0 * ALPHA) / ((tMax - tMin) / (rMax - rMin)) * 0.8)]}>
        <boxGeometry args={[1.4, 0.004, 0.001]} />
        <meshBasicMaterial color="#224422" />
      </mesh>
      {dataPoints.map((p, i) => (
        <mesh key={i} position={[toX(p.t), toY(p.r), 0.002]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
      ))}
      <Text position={[0, 0.56, 0.001]} fontSize={0.05} color="#ffaa00" anchorX="center">R (Ω) vs T (°C) — Copper Coil</Text>
      <Text position={[0.45, -0.56, 0.001]} fontSize={0.04} color="#666" anchorX="center">T (°C) →</Text>
      {slope && (
        <Text position={[0.2, 0.3, 0.001]} fontSize={0.042} color="#ffdd88" anchorX="center">
          {`slope = ${slope} Ω/°C`}
        </Text>
      )}
    </group>
  );
};

/* ──────────────── MAIN ──────────────── */
const PhysicsExp8 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [coilSubmerged, setCoilSubmerged] = useState(false);
  const [hotPlateOn, setHotPlateOn] = useState(false);
  const [supplyOn, setSupplyOn] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [tempIndex, setTempIndex] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [heating, setHeating] = useState(false);
  const [done, setDone] = useState(false);
  const [slope, setSlope] = useState(null);
  const [EF, setEF] = useState(null);

  const heatTimer = useRef(0);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  useFrame((state, delta) => {
    if (!heating) return;
    heatTimer.current += delta;
    if (heatTimer.current > 1.0) {
      heatTimer.current = 0;
      setTempIndex(prev => {
        const next = prev + 1;
        if (next >= TEMP_STEPS.length) {
          setHeating(false);
          setDone(true);
          playSuccess();

          // Calculate slope and EF
          const T1 = TEMP_STEPS[0], R1 = resistanceAtT(T1);
          const T2 = TEMP_STEPS[TEMP_STEPS.length - 1], R2 = resistanceAtT(T2);
          const slopeCalc = ((R2 - R1) / (T2 - T1)).toFixed(5);
          setSlope(slopeCalc);

          // EF = C × (T/R)³ × slope at mid temp
          const Tmid = TEMP_STEPS[3] + 273; // K
          const Rmid = resistanceAtT(TEMP_STEPS[3]);
          const EF_calc = C_FERMI * Math.pow(Tmid / Rmid, 3) * parseFloat(slopeCalc);
          const EF_eV = (EF_calc / 1.6e-19).toFixed(2);
          setEF(EF_eV);
          setCurrentStep(5);
          return prev;
        }
        const T = TEMP_STEPS[next];
        setTemperature(T);
        const V = voltageAtT(T);
        const R = resistanceAtT(T);
        setDataPoints(ps => [...ps, { t: T, r: R }]);
        setObservations(prev => ({
          ...prev,
          [next]: { 0: String(T), 1: String(T + 273), 2: V.toFixed(1), 3: String(CURRENT), 4: R.toFixed(4) }
        }));
        return next;
      });
    }
  });

  const currentV = voltageAtT(temperature);
  const currentR = resistanceAtT(temperature);

  const instructions = [
    '① Click the Copper Coil to submerge in water bath',
    '② Click Hot Plate to power ON',
    '③ Click Constant Current Supply to turn ON (I = 200mA)',
    '④ Click [START HEATING] to sweep 30→100°C',
    '⑤ Heating... readings auto-logged in Notebook',
    '⑥ Done! EF calculated from slope. Open Notebook → Result.',
  ];

  return (
    <group>
      {/* Hot plate */}
      <HotPlate
        position={[0, -1.05, 0]}
        isOn={hotPlateOn}
        isGlowing={currentStep === 1}
        onClick={() => {
          if (currentStep !== 1) return;
          playClick();
          setHotPlateOn(true);
          setCurrentStep(2);
        }}
      />

      {/* Water bath beaker on hot plate */}
      <WaterBath position={[0, -0.65, 0]} temperature={temperature} isHeating={heating} />

      {/* Copper coil — floating until submerged */}
      <CopperCoil
        position={coilSubmerged ? [0, -0.75, 0] : [0.8, -0.78, 0.5]}
        temperature={temperature}
        isSubmerged={coilSubmerged}
        isGlowing={currentStep === 0}
      />

      {/* Click trigger for coil placement */}
      {!coilSubmerged && (
        <mesh
          position={[0.8, -0.78, 0.5]}
          onClick={() => {
            if (currentStep !== 0) return;
            playClick();
            setCoilSubmerged(true);
            setCurrentStep(1);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.0} />
        </mesh>
      )}

      {/* Thermometer in water bath */}
      <ThermometerTall position={[0.45, -0.5, 0.15]} temperature={temperature} />

      {/* Constant current supply */}
      <group position={[-1.8, -0.85, 0.2]}>
        <mesh
          onClick={() => {
            if (currentStep !== 2) return;
            playClick();
            setSupplyOn(true);
            setCurrentStep(3);
          }}
          onPointerOver={() => (document.body.style.cursor = currentStep === 2 ? 'pointer' : 'auto')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <boxGeometry args={[0.6, 0.4, 0.24]} />
          <meshStandardMaterial color={currentStep === 2 ? '#1a3a1a' : '#111'} emissive={currentStep === 2 ? '#004400' : '#000'} emissiveIntensity={currentStep === 2 ? 0.5 : 0} metalness={0.4} />
        </mesh>
        <Text position={[0, -0.3, 0]} fontSize={0.044} color="#777" anchorX="center">Const. Current (200mA)</Text>
        <mesh position={[0, 0.04, 0.122]}>
          <planeGeometry args={[0.38, 0.16]} />
          <meshBasicMaterial color={supplyOn ? '#001100' : '#080808'} />
        </mesh>
        <Text position={[0, 0.04, 0.13]} fontSize={0.055} color={supplyOn ? '#00ff66' : '#224422'} anchorX="center">
          {supplyOn ? '200.0 mA' : '---'}
        </Text>
      </group>

      {/* Voltmeter */}
      <group position={[1.6, -0.75, 0.2]}>
        <mesh><boxGeometry args={[0.55, 0.32, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
        <Text position={[0, 0.02, 0.052]} fontSize={0.065} color={supplyOn ? '#00ff88' : '#224422'} anchorX="center">
          {supplyOn ? `${currentV.toFixed(1)} mV` : '---'}
        </Text>
        <Text position={[0, -0.22, 0]} fontSize={0.044} color="#777" anchorX="center">Voltmeter</Text>
        <Text position={[0, -0.1, 0.052]} fontSize={0.038} color="#666" anchorX="center">
          {supplyOn ? `R = ${currentR.toFixed(4)} Ω` : ''}
        </Text>
      </group>

      {/* Start Heating button */}
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
          <planeGeometry args={[1.6, 0.22]} />
          <meshBasicMaterial color="#331100" />
          <Text position={[0, 0, 0.01]} fontSize={0.09} color="#ff8800" anchorX="center">🔥 START HEATING (30→100°C)</Text>
        </mesh>
      )}

      {/* R vs T Graph */}
      <group position={[0, 0.12, -1.9]} rotation={[0.15, 0, 0]}>
        <RvsTGraph dataPoints={dataPoints} slope={slope} />
      </group>

      {/* EF result */}
      {EF && (
        <group position={[0, 0.88, 0]}>
          <mesh><planeGeometry args={[3.2, 0.3]} /><meshBasicMaterial color="#002200" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.085} color="#ffcc00" anchorX="center" position={[0, 0, 0.01]}>
            {`✅ EF = ${EF} eV  |  slope ΔR/ΔT = ${slope} Ω/°C`}
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

export default PhysicsExp8;
