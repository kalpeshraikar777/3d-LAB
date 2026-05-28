import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ──── PHYSICS CONSTANTS ──── */
const NA_MULTIMODE = 0.22;   // Numerical Aperture for 50µm multimode fiber
const THETA_MAX_DEG = Math.asin(NA_MULTIMODE) * 180 / Math.PI; // ~12.7°

/* ──── POWER MODEL: power vs angle ──── */
const computePower = (angleDeg) => {
  const t = angleDeg / THETA_MAX_DEG;
  if (t >= 1) return 0;
  // Cosine-squared falloff
  return Math.cos((t * Math.PI) / 2) ** 2 * 3.5; // mW peak = 3.5
};

/* ──── PRIMITIVES ──── */

const LaserSource = ({ position = [0, 0, 0], isOn = false, isGlowing = false, onClick }) => (
  <group position={position}>
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.28, 0.1, 0.09]} />
      <meshStandardMaterial color="#111" metalness={0.7} />
    </mesh>
    <mesh position={[0.15, 0, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 0.015, 12]} />
      <meshStandardMaterial color={isOn ? '#ff2200' : '#440000'} emissive={isOn ? '#ff0000' : '#000'} emissiveIntensity={isOn ? 2 : 0} />
    </mesh>
    <Text position={[0, -0.1, 0]} fontSize={0.04} color="#aaa" anchorX="center">Diode LASER 650nm</Text>
  </group>
);

const OpticalFiber = ({ position = [0, 0, 0], angle = 0, isGlowing = false }) => {
  // The fiber tube curves gently – represented as bent cylinder
  const cosA = Math.cos(angle * Math.PI / 180);
  const sinA = Math.sin(angle * Math.PI / 180);
  return (
    <group position={position} rotation={[0, 0, 0]}>
      {/* Fiber jacket (outer) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const t = i / 19;
        const x = t * 2.0;
        const y = -Math.sin(t * 0.5) * 0.3;
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshStandardMaterial
              color={isGlowing ? '#ffaa44' : '#ff6600'}
              emissive={isGlowing ? '#442200' : '#000'}
              emissiveIntensity={isGlowing ? 0.6 : 0}
              transparent opacity={0.75}
            />
          </mesh>
        );
      })}
      {/* Input end (left) */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
        <meshStandardMaterial color="#555" metalness={0.8} />
      </mesh>
      {/* Output end (right) with angle */}
      <group position={[2.0, -0.15, 0]} rotation={[0, 0, angle * Math.PI / 180]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

const RotationStage = ({ position = [0, 0, 0], angle = 0, isGlowing = false, onIncrease, onDecrease }) => (
  <group position={position}>
    <mesh>
      <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
      <meshStandardMaterial color="#334" metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Protractor ring */}
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.2, 0.008, 8, 32]} />
      <meshStandardMaterial color="#666" />
    </mesh>
    {/* Angle tick */}
    <mesh
      position={[Math.sin(angle * Math.PI / 180) * 0.18, 0.025, Math.cos(angle * Math.PI / 180) * 0.18]}
    >
      <boxGeometry args={[0.008, 0.03, 0.008]} />
      <meshBasicMaterial color="#00ffcc" />
    </mesh>
    <Text position={[0, 0.07, 0]} fontSize={0.055} color={isGlowing ? '#00ffcc' : '#aaa'} anchorX="center">
      {`θ = ${angle}°`}
    </Text>
    {/* + / - buttons */}
    <mesh
      position={[0.32, 0, 0]}
      onClick={onIncrease}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.12, 0.1, 0.04]} />
      <meshBasicMaterial color="#224422" />
      <Text position={[0, 0, 0.022]} fontSize={0.07} color="#00ff88" anchorX="center">+5°</Text>
    </mesh>
    <mesh
      position={[-0.32, 0, 0]}
      onClick={onDecrease}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.12, 0.1, 0.04]} />
      <meshBasicMaterial color="#442222" />
      <Text position={[0, 0, 0.022]} fontSize={0.07} color="#ff6666" anchorX="center">-5°</Text>
    </mesh>
  </group>
);

const PowerMeterDisplay = ({ position = [0, 0, 0], power = 0, maxPower = 3.5 }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.55, 0.35, 0.1]} />
      <meshStandardMaterial color="#111" metalness={0.3} />
    </mesh>
    <mesh position={[0, 0.02, 0.052]}>
      <planeGeometry args={[0.42, 0.18]} />
      <meshBasicMaterial color="#001a00" />
    </mesh>
    <Text position={[0, 0.02, 0.06]} fontSize={0.07} color="#00ff88" anchorX="center">
      {power.toFixed(2)} mW
    </Text>
    {/* Bar indicator */}
    <mesh position={[-0.18 + (power / maxPower) * 0.18, -0.1, 0.052]}>
      <boxGeometry args={[(power / maxPower) * 0.36, 0.04, 0.01]} />
      <meshBasicMaterial color={power > 0.1 ? '#00ff88' : '#110000'} />
    </mesh>
    <Text position={[0, -0.22, 0]} fontSize={0.045} color="#666" anchorX="center">Output Power</Text>
  </group>
);

const FiberScreen = ({ position = [0, 0, 0], power = 0, angle = 0, showBeam = false }) => {
  const beamRadius = Math.max(0.02, (1 - power / 3.5) * 0.12);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.04, 0.5, 0.5]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
      {showBeam && power > 0.01 && (
        <mesh position={[0.022, 0, 0]}>
          <circleGeometry args={[0.04, 24]} />
          <meshBasicMaterial color="#ff3300" transparent opacity={Math.min(power / 3.5, 1)} />
        </mesh>
      )}
      <Text position={[0, -0.33, 0]} fontSize={0.04} color="#888" anchorX="center">Detector Screen</Text>
    </group>
  );
};

/* ── Power-vs-Angle Graph ── */
const PowerAngleGraph = ({ dataPoints = [], thetaMax = 0, position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.5, 0.9]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.73, 0, 0.001]}><boxGeometry args={[0.008, 0.86, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.43, 0.001]}><boxGeometry args={[1.46, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {dataPoints.map((p, i) => {
        const x = (p.a / 40) * 1.4 - 0.7;
        const y = (p.p / 3.5) * 0.82 - 0.41;
        return (
          <mesh key={i} position={[x, y, 0.002]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={p.p < 0.1 ? '#ff4444' : '#00eecc'} />
          </mesh>
        );
      })}
      {thetaMax > 0 && (
        <mesh position={[(thetaMax / 40) * 1.4 - 0.7, 0, 0.003]}>
          <boxGeometry args={[0.006, 0.86, 0.001]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
      <Text position={[0, 0.52, 0.001]} fontSize={0.048} color="#00eecc" anchorX="center">Output Power vs Angle</Text>
      <Text position={[0.45, -0.52, 0.001]} fontSize={0.038} color="#666" anchorX="center">θ (°) →</Text>
      {thetaMax > 0 && (
        <Text position={[(thetaMax / 40) * 1.4 - 0.7, 0.48, 0.003]} fontSize={0.04} color="#ffff00" anchorX="center">
          θmax
        </Text>
      )}
    </group>
  );
};

/* ──────────────── MAIN ──────────────── */
const PhysicsExp4 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [laserOn, setLaserOn] = useState(false);
  const [fiberConnected, setFiberConnected] = useState(false);
  const [angle, setAngle] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [tirReached, setTirReached] = useState(false);
  const [thetaMax, setThetaMax] = useState(0);
  const [done, setDone] = useState(false);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  const currentPower = fiberConnected && laserOn ? computePower(angle) : 0;

  const handleRecord = () => {
    if (!laserOn || !fiberConnected) return;
    playClick();
    const p = currentPower;
    const newPt = { a: angle, p };
    const newPoints = [...dataPoints, newPt];
    setDataPoints(newPoints);

    // Log to observation table
    const rowIdx = newPoints.length - 1;
    setObservations(prev => ({
      ...prev,
      [rowIdx]: { 0: String(angle), 1: p.toFixed(2), 2: p < 0.1 ? 'TIR' : 'Transmitted' }
    }));

    if (p < 0.1 && !tirReached) {
      setTirReached(true);
      setThetaMax(angle);
      playSuccess();
      setCurrentStep(4);
      setDone(true);
    }
  };

  const increaseAngle = () => {
    if (currentStep < 2) return;
    setAngle(prev => Math.min(prev + 5, 40));
    playClick();
    if (currentStep === 2) setCurrentStep(3);
  };
  const decreaseAngle = () => {
    if (currentStep < 2) return;
    setAngle(prev => Math.max(prev - 5, 0));
    playClick();
  };

  const NA = Math.sin(thetaMax * Math.PI / 180).toFixed(3);

  const instructions = [
    '① Click Diode LASER to power ON',
    '② Click Optical Fiber to connect input end to laser',
    '③ Use +5°/−5° to rotate fiber angle, then click RECORD',
    '④ Keep increasing angle — find where output drops to zero (TIR)',
    '⑤ Total Internal Reflection found! NA = sin(θmax). See Notebook.',
  ];

  return (
    <group>
      {/* Laser source (left) */}
      <LaserSource
        position={[-2.5, -0.88, 0]}
        isOn={laserOn}
        isGlowing={currentStep === 0}
        onClick={() => {
          if (currentStep !== 0) return;
          playClick();
          setLaserOn(true);
          setCurrentStep(1);
        }}
      />

      {/* Laser beam to fiber input */}
      {laserOn && fiberConnected && (
        <mesh position={[-2.1, -0.88, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.28, 6]} />
          <meshBasicMaterial color="#ff2200" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Optical Fiber */}
      <group
        position={[-1.8, -0.88, 0]}
        onClick={() => {
          if (currentStep !== 1) return;
          playClick();
          setFiberConnected(true);
          setCurrentStep(2);
        }}
        onPointerOver={() => document.body.style.cursor = currentStep === 1 ? 'pointer' : 'auto'}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <OpticalFiber
          position={[0, 0, 0]}
          angle={angle}
          isGlowing={fiberConnected && laserOn}
        />
      </group>

      {/* Rotation stage */}
      <RotationStage
        position={[0.5, -0.9, 0.5]}
        angle={angle}
        isGlowing={currentStep === 2 || currentStep === 3}
        onIncrease={increaseAngle}
        onDecrease={decreaseAngle}
      />

      {/* Detector screen */}
      <FiberScreen
        position={[1.2, -0.88, -0.3]}
        power={currentPower}
        angle={angle}
        showBeam={fiberConnected && laserOn}
      />

      {/* Power meter */}
      <PowerMeterDisplay
        position={[1.8, -0.7, 0.3]}
        power={currentPower}
      />

      {/* Record button */}
      {(currentStep === 2 || currentStep === 3) && (
        <mesh
          position={[0.5, 0.35, 0.5]}
          onClick={handleRecord}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[1.0, 0.2]} />
          <meshBasicMaterial color="#003322" />
          <Text position={[0, 0, 0.01]} fontSize={0.08} color="#00ffcc" anchorX="center">📝 RECORD READING</Text>
        </mesh>
      )}

      {/* TIR popup */}
      {tirReached && (
        <group position={[0, 0.8, 0]}>
          <mesh><planeGeometry args={[3.2, 0.35]} /><meshBasicMaterial color="#002211" transparent opacity={0.95} /></mesh>
          <Text fontSize={0.08} color="#00ffcc" anchorX="center" position={[0, 0, 0.01]}>
            {`⚡ TIR at θmax = ${thetaMax}°  NA = sin(${thetaMax}°) = ${NA}`}
          </Text>
        </group>
      )}

      {/* Graph */}
      <group position={[0, 0.12, -1.9]} rotation={[0.15, 0, 0]}>
        <PowerAngleGraph dataPoints={dataPoints} thetaMax={thetaMax} />
      </group>

      {/* Instruction */}
      <group position={[0, 1.55, -2.0]} rotation={[0.15, 0, 0]}>
        <Text fontSize={0.075} color="#00ffcc" anchorX="center">
          {instructions[Math.min(currentStep, instructions.length - 1)]}
        </Text>
      </group>
    </group>
  );
};

export default PhysicsExp4;
