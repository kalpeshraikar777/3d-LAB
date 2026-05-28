import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperiment } from '../../../context/ExperimentContext';

/* ──── TRANSISTOR MODEL (NPN CE) ──── */

// Input characteristic: I_B vs V_BE (at constant V_CE)
// I_B = I_S * (exp(V_BE / 0.026) - 1) in µA (scaled)
const computeIB = (Vbe) => {
  if (Vbe < 0.45) return 0;
  return Math.max(0, 0.001 * Math.exp((Vbe - 0.6) / 0.026) * 20);  // µA
};

// Output characteristic: I_C vs V_CE (at constant I_B)
const BETA = 150;
const computeIC = (Vce, Ib_uA) => {
  if (Vce < 0.1) return 0;
  const sat = Math.min(1, Vce / 0.3);
  return sat * BETA * Ib_uA * 0.001; // mA
};

/* ──── PRIMITIVES ──── */

const Transistor = ({ position = [0, 0, 0], isActive = false, isGlowing = false, onClick }) => (
  <group position={position}>
    {/* TO-92 body */}
    <mesh
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry args={[0.1, 0.1, 0.2, 3]} /> {/* triangular cross-section */}
      <meshStandardMaterial
        color={isActive ? '#226622' : '#334'}
        emissive={isActive ? '#004400' : '#000'}
        emissiveIntensity={isActive ? 0.8 : 0}
        metalness={0.3} roughness={0.7}
      />
    </mesh>
    {/* Flat face */}
    <mesh position={[0, 0, 0.08]}>
      <planeGeometry args={[0.14, 0.18]} />
      <meshBasicMaterial color="#222" />
    </mesh>
    <Text position={[0, 0, 0.09]} fontSize={0.032} color="#888" anchorX="center">NPN</Text>
    {/* 3 leads (B, C, E) */}
    {[[-0.04, 0], [0, 0], [0.04, 0]].map(([x, z], i) => (
      <mesh key={i} position={[x, -0.18, z]}>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 6]} />
        <meshStandardMaterial color="#aaa" metalness={1} />
      </mesh>
    ))}
    {/* Active region glow */}
    {isActive && <pointLight color="#00ff44" intensity={0.6} distance={0.5} />}
    <Text position={[0, 0.22, 0]} fontSize={0.042} color={isActive ? '#00ff44' : '#888'} anchorX="center">NPN Transistor</Text>
    <Text position={[-0.06, -0.35, 0]} fontSize={0.035} color="#666" anchorX="center">B</Text>
    <Text position={[0, -0.35, 0]} fontSize={0.035} color="#666" anchorX="center">C</Text>
    <Text position={[0.06, -0.35, 0]} fontSize={0.035} color="#666" anchorX="center">E</Text>
  </group>
);

const VariableSupply = ({ position = [0, 0, 0], label = 'VBE', voltage = 0, maxV = 1, step = 0.05, isGlowing = false, onIncrease, onDecrease }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.55, 0.35, 0.2]} />
      <meshStandardMaterial color={isGlowing ? '#1a2a1a' : '#111'} emissive={isGlowing ? '#003300' : '#000'} emissiveIntensity={isGlowing ? 0.5 : 0} metalness={0.4} />
    </mesh>
    <mesh position={[0, 0.04, 0.102]}>
      <planeGeometry args={[0.4, 0.16]} />
      <meshBasicMaterial color="#001100" />
    </mesh>
    <Text position={[0, 0.04, 0.11]} fontSize={0.065} color="#00ff88" anchorX="center">{voltage.toFixed(2)}V</Text>
    {/* Knob */}
    <mesh position={[0.18, -0.08, 0.11]}>
      <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
      <meshStandardMaterial color="#333" metalness={0.8} />
    </mesh>
    {/* Buttons */}
    <mesh position={[0.32, 0.12, 0.0]} onClick={onIncrease}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.09, 0.08, 0.1]} />
      <meshBasicMaterial color="#003322" />
      <Text position={[0, 0, 0.052]} fontSize={0.06} color="#00ff88" anchorX="center">+</Text>
    </mesh>
    <mesh position={[0.32, 0.02, 0.0]} onClick={onDecrease}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <boxGeometry args={[0.09, 0.08, 0.1]} />
      <meshBasicMaterial color="#330011" />
      <Text position={[0, 0, 0.052]} fontSize={0.06} color="#ff6666" anchorX="center">−</Text>
    </mesh>
    <Text position={[0, -0.26, 0]} fontSize={0.048} color="#777" anchorX="center">{label}</Text>
  </group>
);

const CurrentMeter = ({ position = [0, 0, 0], label = 'IB', value = 0, unit = 'µA', color = '#00ff88', isGlowing = false }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.48, 0.3, 0.08]} />
      <meshStandardMaterial color={isGlowing ? '#0a1a0a' : '#111'} emissive={isGlowing ? '#003300' : '#000'} emissiveIntensity={isGlowing ? 0.5 : 0} />
    </mesh>
    <mesh position={[0, 0.02, 0.042]}>
      <planeGeometry args={[0.38, 0.14]} />
      <meshBasicMaterial color="#001100" />
    </mesh>
    <Text position={[0, 0.02, 0.05]} fontSize={0.06} color={color} anchorX="center">{typeof value === 'number' ? value.toFixed(2) : value}</Text>
    <Text position={[0, -0.09, 0.05]} fontSize={0.036} color="#666" anchorX="center">{unit}</Text>
    <Text position={[0, -0.22, 0]} fontSize={0.044} color="#777" anchorX="center">{label}</Text>
  </group>
);

/* ── Characteristic Curves ── */
const CharCurves = ({ inputData = [], outputData = [], mode = 'input', position = [0, 0, 0] }) => {
  const data = mode === 'input' ? inputData : outputData;
  const xKey = mode === 'input' ? 'vbe' : 'vce';
  const yKey = mode === 'input' ? 'ib' : 'ic';
  const xMax = mode === 'input' ? 1.0 : 10;
  const yMax = mode === 'input' ? 80 : 15;
  const toX = (v) => (v / xMax) * 1.4 - 0.7;
  const toY = (v) => (v / yMax) * 0.82 - 0.41;
  const colors = ['#00eecc', '#ff8800', '#ff44ff', '#ffee44'];

  const IB_LEVELS = [10, 20, 30];

  return (
    <group position={position}>
      <mesh><planeGeometry args={[1.6, 1.0]} /><meshBasicMaterial color="#080818" /></mesh>
      <mesh position={[-0.78, 0, 0.001]}><boxGeometry args={[0.008, 0.9, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      <mesh position={[0, -0.48, 0.001]}><boxGeometry args={[1.55, 0.008, 0.001]} /><meshBasicMaterial color="#444" /></mesh>
      {mode === 'input' && data.map((p, i) => (
        <mesh key={i} position={[toX(p.vbe), toY(p.ib), 0.002]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color={colors[0]} />
        </mesh>
      ))}
      {mode === 'output' && IB_LEVELS.map((ib, ci) => {
        const pts = data.filter(p => Math.abs(p.ib - ib) < 5);
        return pts.map((p, i) => (
          <mesh key={`${ci}-${i}`} position={[toX(p.vce), toY(p.ic), 0.002]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshBasicMaterial color={colors[ci]} />
          </mesh>
        ));
      })}
      <Text position={[0, 0.56, 0.001]} fontSize={0.048} color="#aaddff" anchorX="center">
        {mode === 'input' ? 'Input: IB (µA) vs VBE (V)' : 'Output: IC (mA) vs VCE (V)'}
      </Text>
      <Text position={[0.45, -0.56, 0.001]} fontSize={0.038} color="#666" anchorX="center">
        {mode === 'input' ? 'VBE (V) →' : 'VCE (V) →'}
      </Text>
    </group>
  );
};

/* ──────────────── MAIN ──────────────── */
const PhysicsExp9 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();

  const [charMode, setCharMode] = useState('input');  // 'input' | 'output'
  const [Vbe, setVbe] = useState(0.5);
  const [Vce, setVce] = useState(1.0);
  const [fixedIb, setFixedIb] = useState(10);   // µA — for output characteristics
  const [inputData, setInputData] = useState([]);
  const [outputData, setOutputData] = useState([]);
  const [transistorIn, setTransistorIn] = useState(false);
  const [inputDone, setInputDone] = useState(false);
  const [outputDone, setOutputDone] = useState(false);
  const [obsCount, setObsCount] = useState(0);

  const playClick = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e => e);
  const playSuccess = () => new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => e);

  const Ib = computeIB(Vbe);
  const Ic = computeIC(Vce, charMode === 'output' ? fixedIb : Ib);
  const isActive = Ib > 0.5 || Ic > 0.1;

  const recordPoint = () => {
    playClick();
    if (charMode === 'input') {
      const pt = { vbe: Vbe, ib: Ib };
      const newData = [...inputData, pt];
      setInputData(newData);
      const i = obsCount;
      setObsCount(i + 1);
      setObservations(prev => ({
        ...prev,
        [i]: { 0: String(Vce.toFixed(1)), 1: String(Vbe.toFixed(2)), 2: Ib.toFixed(1), 3: Ic.toFixed(2) }
      }));
      if (newData.length >= 5) { setInputDone(true); playSuccess(); setCurrentStep(3); }
      else setCurrentStep(Math.max(currentStep, 2));
    } else {
      const pt = { vce: Vce, ic: Ic, ib: fixedIb };
      const newData = [...outputData, pt];
      setOutputData(newData);
      const i = obsCount;
      setObsCount(i + 1);
      setObservations(prev => ({
        ...prev,
        [i]: { 0: String(Vce.toFixed(1)), 1: String(Vbe.toFixed(2)), 2: (fixedIb).toFixed(0), 3: Ic.toFixed(2) }
      }));
      if (newData.length >= 8) {
        setOutputDone(true);
        playSuccess();
        setCurrentStep(6);
      }
      else setCurrentStep(Math.max(currentStep, 5));
    }
  };

  const IB_OPTIONS = [10, 20, 30];

  const instructions = [
    '① Click the NPN Transistor to place in circuit',
    '② Set VCE = 1V using VCE supply controls',
    '③ Use VBE + / − to vary base voltage, click RECORD each time',
    '④ Input characteristics done! Switch to Output mode',
    '⑤ Set IB constant (10/20/30µA), vary VCE 0→10V',
    '⑥ Click RECORD for each VCE value',
    '⑦ All curves complete! Open Notebook → Result for h-parameters.',
  ];

  return (
    <group>
      {/* Transistor (center) */}
      <Transistor
        position={[0, -0.82, 0]}
        isActive={isActive}
        isGlowing={currentStep === 0}
        onClick={() => {
          if (currentStep !== 0) return;
          playClick();
          setTransistorIn(true);
          setCurrentStep(1);
        }}
      />

      {/* VBE supply */}
      <VariableSupply
        position={[-1.5, -0.78, 0.3]}
        label="VBE Supply"
        voltage={Vbe}
        maxV={1.0}
        step={0.05}
        isGlowing={currentStep === 1 || (currentStep === 2 && charMode === 'input')}
        onIncrease={() => {
          setVbe(v => Math.min(v + 0.05, 1.0));
          playClick();
          if (currentStep < 2) setCurrentStep(2);
        }}
        onDecrease={() => { setVbe(v => Math.max(v - 0.05, 0)); playClick(); }}
      />

      {/* VCE supply */}
      <VariableSupply
        position={[1.5, -0.78, 0.3]}
        label="VCE Supply"
        voltage={Vce}
        maxV={15}
        step={0.5}
        isGlowing={currentStep === 4 || currentStep === 5}
        onIncrease={() => {
          setVce(v => Math.min(v + 0.5, 15));
          playClick();
          if (currentStep < 5) setCurrentStep(5);
        }}
        onDecrease={() => { setVce(v => Math.max(v - 0.5, 0)); playClick(); }}
      />

      {/* IB meter */}
      <CurrentMeter
        position={[-1.5, -0.45, 0.5]}
        label="Microammeter (IB)"
        value={Ib}
        unit="µA"
        color="#00eecc"
        isGlowing={charMode === 'input' && isActive}
      />

      {/* IC meter */}
      <CurrentMeter
        position={[1.5, -0.45, 0.5]}
        label="Milliammeter (IC)"
        value={Ic}
        unit="mA"
        color="#ff8800"
        isGlowing={isActive}
      />

      {/* Mode selector */}
      <group position={[0, -0.48, 0.8]}>
        <mesh position={[-0.35, 0, 0]} onClick={() => { setCharMode('input'); playClick(); if (currentStep < 2) setCurrentStep(2); }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <boxGeometry args={[0.6, 0.16, 0.04]} />
          <meshBasicMaterial color={charMode === 'input' ? '#002244' : '#111'} />
          <Text position={[0, 0, 0.022]} fontSize={0.052} color={charMode === 'input' ? '#44aaff' : '#444'} anchorX="center">INPUT CHAR</Text>
        </mesh>
        <mesh position={[0.35, 0, 0]} onClick={() => { setCharMode('output'); setCurrentStep(Math.max(currentStep, 4)); playClick(); }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <boxGeometry args={[0.6, 0.16, 0.04]} />
          <meshBasicMaterial color={charMode === 'output' ? '#222200' : '#111'} />
          <Text position={[0, 0, 0.022]} fontSize={0.052} color={charMode === 'output' ? '#ffee44' : '#444'} anchorX="center">OUTPUT CHAR</Text>
        </mesh>
      </group>

      {/* IB selector for output mode */}
      {charMode === 'output' && (
        <group position={[0, -0.32, 0.9]}>
          <Text position={[0, 0.12, 0]} fontSize={0.048} color="#aaa" anchorX="center">Set IB (µA):</Text>
          {IB_OPTIONS.map((ib, i) => (
            <mesh key={ib} position={[-0.22 + i * 0.22, 0, 0]}
              onClick={() => { setFixedIb(ib); playClick(); }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <boxGeometry args={[0.18, 0.12, 0.04]} />
              <meshBasicMaterial color={fixedIb === ib ? '#224400' : '#111'} />
              <Text position={[0, 0, 0.022]} fontSize={0.052} color={fixedIb === ib ? '#aaff44' : '#555'} anchorX="center">{ib}</Text>
            </mesh>
          ))}
        </group>
      )}

      {/* RECORD button */}
      {currentStep >= 2 && !(inputDone && outputDone) && (
        <mesh
          position={[0, 0.4, 0.6]}
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
      <group position={[0, 0.12, -1.9]} rotation={[0.15, 0, 0]}>
        <CharCurves inputData={inputData} outputData={outputData} mode={charMode} />
      </group>

      {/* Derived parameters */}
      {(inputDone || outputDone) && (
        <group position={[0, 0.85, -1.9]} rotation={[0.15, 0, 0]}>
          <Text fontSize={0.05} color="#ffcc00" anchorX="center">
            {inputDone ? `h_ie ≈ 1.2 kΩ  |  β = ${BETA}  |  h_oe ≈ 50 µS` : ''}
          </Text>
        </group>
      )}

      {/* Done */}
      {inputDone && outputDone && (
        <group position={[0, 0.9, 0]}>
          <mesh><planeGeometry args={[3.0, 0.28]} /><meshBasicMaterial color="#001122" transparent opacity={0.9} /></mesh>
          <Text fontSize={0.08} color="#00ff88" anchorX="center" position={[0, 0, 0.01]}>
            ✅ Input & Output characteristics complete! Open Notebook.
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

export default PhysicsExp9;
