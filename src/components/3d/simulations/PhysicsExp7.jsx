import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ──── PHOTODIODE MODEL ──── */
// Reverse bias photocurrent vs voltage: I_ph = I_dark + I_photo × (1 - exp(-V/Vt))
const I_DARK = 0.001;    // µA
const I_PHOTO = 15.0;    // µA at full illumination
const VT = 0.026;        // thermal voltage (room temp)

const computeReverseCurrent = (bias, illum) => {
  // illum: 0–1 scale
  return I_DARK + illum * I_PHOTO * (1 + bias * 0.01);  // slight increase with reverse bias
};

const computeForwardVoc = (illum) => {
  // Voc = VT * ln(Isc/I0 + 1)
  if (illum < 0.01) return 0;
  return VT * Math.log(illum * I_PHOTO / 0.001 + 1) * 12; // scaled for visibility
};

/* ──── PRIMITIVES ──── */

const Photodiode = ({ position = [0, 0, 0], isIlluminated = false, bias = 0, isGlowing = false, onClick }) => (
  <group position={position}>
    {/* TO-18 can body */}
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry args={[0.055, 0.055, 0.09, 16]} />
      <meshStandardMaterial
        color={isGlowing ? '#aaccff' : '#888'}
        emissive={isGlowing ? '#002244' : '#000'}
        emissiveIntensity={isGlowing ? 0.8 : 0}
        metalness={0.85} roughness={0.15}
      />
    </mesh>
    {/* Window/lens on top */}
    <mesh position={[0, 0.052, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.01, 12]} />
      <meshStandardMaterial color={isIlluminated ? '#ffddaa' : '#334'} transparent opacity={0.8} emissive={isIlluminated ? '#884400' : '#000'} emissiveIntensity={isIlluminated ? 1.0 : 0} />
    </mesh>
    {/* Leads */}
    <mesh position={[0.02, -0.1, 0]}><cylinderGeometry args={[0.004, 0.004, 0.1, 6]} /><meshStandardMaterial color="#aaa" metalness={1} /></mesh>
    <mesh position={[-0.02, -0.12, 0]}><cylinderGeometry args={[0.004, 0.004, 0.12, 6]} /><meshStandardMaterial color="#aaa" metalness={1} /></mesh>
    <Text position={[0, -0.22, 0]} fontSize={0.04} color="#888" anchorX="center">Photodiode (Si)</Text>
  </group>
);

const LEDLightSource = ({ position = [0, 0, 0], illumination = 0, isOn = false, isGlowing = false, onAdjust }) => {
  const brightness = illumination;
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.05, 0.15, 16]} />
        <meshStandardMaterial
          color="#ffdd88"
          emissive="#aa8800"
          emissiveIntensity={brightness * 2.5}
        />
      </mesh>
      {isOn && illumination > 0.1 && (
        <>
          <pointLight color="#ffee88" intensity={brightness * 1.2} distance={1.5} position={[0, 0.1, 0]} />
          {/* light cone visual */}
          <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.15 * brightness, 0.6, 12, 1, true]} />
            <meshBasicMaterial color="#ffdd88" transparent opacity={0.07} />
          </mesh>
        </>
      )}
      {/* Intensity slider label */}
      <Text position={[0, 0.22, 0]} fontSize={0.045} color="#ffcc88" anchorX="center">
        {`Illumination: ${Math.round(illumination * 100)}%`}
      </Text>
      {/* + / - */}
      <mesh position={[0.22, 0, 0]} onClick={() => onAdjust(0.1)}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.1, 0.08, 0.05]} />
        <meshBasicMaterial color="#334400" />
        <Text position={[0, 0, 0.026]} fontSize={0.06} color="#aaff44" anchorX="center">+</Text>
      </mesh>
      <mesh position={[-0.22, 0, 0]} onClick={() => onAdjust(-0.1)}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[0.1, 0.08, 0.05]} />
        <meshBasicMaterial color="#442200" />
        <Text position={[0, 0, 0.026]} fontSize={0.06} color="#ff8844" anchorX="center">−</Text>
      </mesh>
      <Text position={[0, -0.22, 0]} fontSize={0.042} color="#888" anchorX="center">LED Light Source</Text>
    </group>
  );
};

const BiasSelector = ({ position = [0, 0, 0], mode = 'reverse', onSelect }) => (
  <group position={position}>
    <mesh position={[-0.3, 0, 0]} onClick={() => onSelect('reverse')}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.5, 0.16, 0.05]} />
      <meshBasicMaterial color={mode === 'reverse' ? '#002244' : '#111'} />
      <Text position={[0, 0, 0.026]} fontSize={0.052} color={mode === 'reverse' ? '#44aaff' : '#444'} anchorX="center">REVERSE BIAS</Text>
    </mesh>
    <mesh position={[0.3, 0, 0]} onClick={() => onSelect('forward')}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.5, 0.16, 0.05]} />
      <meshBasicMaterial color={mode === 'forward' ? '#224400' : '#111'} />
      <Text position={[0, 0, 0.026]} fontSize={0.052} color={mode === 'forward' ? '#44ff88' : '#444'} anchorX="center">FORWARD BIAS</Text>
    </mesh>
    <Text position={[0, -0.16, 0]} fontSize={0.044} color="#777" anchorX="center">Mode Select</Text>
  </group>
);

const BiasControl = ({ position = [0, 0, 0], bias = 0, mode = 'reverse', onIncrease, onDecrease }) => (
  <group position={position}>
    <mesh position={[0.22, 0, 0]} onClick={onIncrease}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.1, 0.08, 0.05]} />
      <meshBasicMaterial color="#003322" />
      <Text position={[0, 0, 0.026]} fontSize={0.06} color="#00ff88" anchorX="center">+</Text>
    </mesh>
    <mesh position={[-0.22, 0, 0]} onClick={onDecrease}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.1, 0.08, 0.05]} />
      <meshBasicMaterial color="#330011" />
      <Text position={[0, 0, 0.026]} fontSize={0.06} color="#ff6666" anchorX="center">−</Text>
    </mesh>
    <Text position={[0, 0.12, 0]} fontSize={0.055} color="#aaddff" anchorX="center">
      {mode === 'reverse' ? `Vrev = ${bias.toFixed(1)} V` : `Vfwd = ${bias.toFixed(2)} V`}
    </Text>
    <Text position={[0, -0.16, 0]} fontSize={0.042} color="#777" anchorX="center">Bias Voltage</Text>
  </group>
);

/* ── I-V Graph ── */
const PhotodiodeGraph = ({ dataPoints = [], mode = 'reverse', position = [0, 0, 0] }) => {
  const xKey = mode === 'reverse' ? 'v' : 'v';
  const yKey = 'i';
  const xMax = mode === 'reverse' ? 15 : 0.8;
  const yMax = mode === 'reverse' ? 20 : 20;
  const toX = (v) => (v / xMax) * 1.4 - 0.7;
  const toY = (i) => (i / yMax) * 0.82 - 0.41;

  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.6, 1.0]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.78, 0, 0.001]}><boxGeometry args={[0.008, 0.9, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.48, 0.001]}><boxGeometry args={[1.55, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {dataPoints.map((p, i) => (
        <mesh key={i} position={[toX(p.v), toY(p.i), 0.002]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color={mode === 'reverse' ? '#44aaff' : '#44ff88'} />
        </mesh>
      ))}
      <Text position={[0, 0.56, 0.001]} fontSize={0.048} color={mode === 'reverse' ? '#44aaff' : '#44ff88'} anchorX="center">
        {mode === 'reverse' ? 'I (µA) vs Reverse Bias (V)' : 'Voc (V) vs Illumination (%)'}
      </Text>
    </group>
  );
};

/* ──────────────── MAIN ──────────────── */
const PhysicsExp7 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [mode, setMode] = useState('reverse');
  const [illumination, setIllumination] = useState(0.5);
  const [bias, setBias] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [done, setDone] = useState(false);
  const [lightOn, setLightOn] = useState(false);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  const currentI = lightOn ? computeReverseCurrent(bias, illumination) : I_DARK;
  const currentVoc = lightOn ? computeForwardVoc(illumination) : 0;

  const recordPoint = () => {
    playClick();
    const pt = mode === 'reverse'
      ? { v: bias, i: currentI }
      : { v: currentVoc, i: currentI };
    const newPts = [...dataPoints, pt];
    setDataPoints(newPts);

    const rowIdx = newPts.length - 1;
    setObservations(prev => ({
      ...prev,
      [rowIdx]: { 0: String(bias.toFixed(1)), 1: String(I_DARK.toFixed(3)), 2: currentI.toFixed(2) }
    }));

    if (newPts.length >= 8) {
      setDone(true);
      playSuccess();
      setCurrentStep(5);
    } else {
      setCurrentStep(Math.max(currentStep, 3));
    }
  };

  const instructions = [
    '① Click the Photodiode to connect it in the circuit',
    '② Click the LED Light Source to power ON',
    '③ Select REVERSE or FORWARD bias mode',
    '④ Adjust bias voltage and illumination, then click RECORD',
    '⑤ Build the I-V characteristic curve (8+ readings)',
    '⑥ Characteristics complete! See Notebook for responsivity.',
  ];

  return (
    <group>
      {/* Photodiode (center) */}
      <Photodiode
        position={[0, -0.82, 0]}
        isIlluminated={lightOn && illumination > 0.2}
        bias={bias}
        isGlowing={currentStep === 0}
        onClick={() => {
          if (currentStep !== 0) return;
          playClick();
          setCurrentStep(1);
        }}
      />

      {/* LED light source (left, shining on photodiode) */}
      <LEDLightSource
        position={[-0.8, -0.72, 0.3]}
        illumination={lightOn ? illumination : 0}
        isOn={lightOn}
        isGlowing={currentStep === 1}
        onAdjust={(delta) => {
          setIllumination(prev => Math.max(0, Math.min(1, prev + delta)));
          playClick();
        }}
      />

      {/* Light ON button */}
      {currentStep === 1 && (
        <mesh
          position={[-0.8, -0.5, 0.3]}
          onClick={() => {
            setLightOn(true);
            playClick();
            setCurrentStep(2);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[0.7, 0.16]} />
          <meshBasicMaterial color="#333300" />
          <Text position={[0, 0, 0.01]} fontSize={0.07} color="#ffee44" anchorX="center">💡 LIGHT ON</Text>
        </mesh>
      )}

      {/* Bias Selector */}
      <BiasSelector
        position={[0, -0.55, 0.7]}
        mode={mode}
        onSelect={(m) => { setMode(m); setBias(0); setDataPoints([]); playClick(); if (currentStep < 2) setCurrentStep(2); }}
      />

      {/* Bias control */}
      <BiasControl
        position={[1.2, -0.72, 0.4]}
        bias={bias}
        mode={mode}
        onIncrease={() => {
          setBias(prev => mode === 'reverse' ? Math.min(prev + 1, 15) : Math.min(prev + 0.05, 0.8));
          playClick();
          if (currentStep < 3) setCurrentStep(3);
        }}
        onDecrease={() => { setBias(prev => Math.max(prev - (mode === 'reverse' ? 1 : 0.05), 0)); playClick(); }}
      />

      {/* Display meters */}
      <group position={[-1.5, -0.72, 0.5]}>
        <mesh><boxGeometry args={[0.52, 0.3, 0.08]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0.02, 0.042]}><planeGeometry args={[0.38, 0.14]} /><meshBasicMaterial color="#001100" /></mesh>
        <Text position={[0, 0.02, 0.05]} fontSize={0.062} color="#00ff88" anchorX="center">{currentI.toFixed(3)}</Text>
        <Text position={[0, -0.1, 0.05]} fontSize={0.038} color="#666" anchorX="center">µA (Photo-current)</Text>
        <Text position={[0, -0.22, 0]} fontSize={0.044} color="#777" anchorX="center">Microammeter</Text>
      </group>

      {/* Voc display */}
      {mode === 'forward' && (
        <group position={[1.8, -0.72, 0.5]}>
          <mesh><boxGeometry args={[0.52, 0.3, 0.08]} /><meshStandardMaterial color="#111" /></mesh>
          <Text position={[0, 0.02, 0.05]} fontSize={0.062} color="#44ff88" anchorX="center">{currentVoc.toFixed(3)}</Text>
          <Text position={[0, -0.1, 0.05]} fontSize={0.038} color="#666" anchorX="center">V (Open Circuit)</Text>
          <Text position={[0, -0.22, 0]} fontSize={0.044} color="#777" anchorX="center">Voltmeter</Text>
        </group>
      )}

      {/* RECORD button */}
      {currentStep >= 2 && !done && (
        <mesh
          position={[0, 0.38, 0.7]}
          onClick={recordPoint}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[1.0, 0.2]} />
          <meshBasicMaterial color="#003322" />
          <Text position={[0, 0, 0.01]} fontSize={0.085} color="#00ffcc" anchorX="center">📝 RECORD</Text>
        </mesh>
      )}

      {/* Graph */}
      <group position={[0, 0.1, -1.9]} rotation={[0.15, 0, 0]}>
        <PhotodiodeGraph dataPoints={dataPoints} mode={mode} />
      </group>

      {/* Done */}
      {done && (
        <group position={[0, 0.88, 0]}>
          <mesh><planeGeometry args={[3.2, 0.28]} /><meshBasicMaterial color="#002211" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.08} color="#00ff88" anchorX="center" position={[0, 0, 0.01]}>
            ✅ I-V characteristics complete! Open Notebook for analysis.
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

export default PhysicsExp7;
