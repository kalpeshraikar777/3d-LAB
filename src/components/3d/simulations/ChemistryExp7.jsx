import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { 
  Burette, BuretteStand, Beaker, Pipette, 
  DigitalMeter, Electrode, MagneticStirrer, GraphPanel 
} from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';

// pH titration S-curve data generator
// Veq = 7.0 mL. Half-equivalence = 3.5 mL where pH = 4.76 (pKa).
const getPHVal = (vol) => {
  if (vol === 0) return 2.87;
  if (vol < 6.0) {
    // Buffer region: pH = pKa + log(salt/acid)
    // salt/acid is roughly vol / (7.0 - vol)
    const ratio = vol / (7.0 - vol);
    return Math.min(Math.max(4.76 + Math.log10(ratio), 2.9), 6.2).toFixed(2);
  } else if (vol <= 7.5) {
    // Sharp jump near equivalence point
    const fraction = (vol - 6.0) / 1.5;
    return (6.2 + (11.2 - 6.2) * fraction).toFixed(2);
  } else {
    // Excess base region
    return Math.min(11.2 + 0.3 * (vol - 7.5), 12.5).toFixed(2);
  }
};

const ChemistryExp7 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();
  
  // Local states
  const [beakerLiquidLevel, setBeakerLiquidLevel] = useState(0);
  const [stirrerOn, setStirrerOn] = useState(false);
  const [meterOn, setMeterOn] = useState(false);
  const [meterReading, setMeterReading] = useState('0.00');
  const [volAdded, setVolAdded] = useState(0); // NaOH added in mL
  const [addedPoints, setAddedPoints] = useState([]); // [{x: vol, y: pH}]
  const [isDripping, setIsDripping] = useState(false);
  const [calibrationPhase, setCalibrationPhase] = useState(0); // 0: uncalibrated, 1: pH7 dipped, 2: pH4 dipped, 3: calibrated
  const [pipetteLiquidLevel, setPipetteLiquidLevel] = useState(0);

  // Mesh Refs
  const pipetteRef = useRef();
  const electrodeRef = useRef();
  const beakerRef = useRef();

  // Sounds
  const playSelectSound = () => {
    new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e=>e);
  };
  const playPourSound = () => {
    new Audio('https://assets.mixkit.co/sfx/preview/mixkit-liquid-trickle-splat-3081.mp3').play().catch(e=>e);
  };
  const playSuccessSound = () => {
    new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e=>e);
  };

  useEffect(() => {
    if (currentStep === 0) {
      setBeakerLiquidLevel(0);
      setStirrerOn(false);
      setMeterOn(false);
      setMeterReading('0.00');
      setVolAdded(0);
      setAddedPoints([]);
      setIsDripping(false);
      setCalibrationPhase(0);
      setPipetteLiquidLevel(0);
      if (electrodeRef.current) {
        electrodeRef.current.position.set(-1.0, 0.4, 0.5); // Resting position
      }
    }
  }, [currentStep]);

  // Calibration sequence
  const handleDipBuffer7 = () => {
    if (currentStep !== 0 || calibrationPhase !== 0) return;
    playSelectSound();

    const el = electrodeRef.current;
    gsap.to(el.position, {
      x: -1.5, y: -0.15, z: 0.5, // Move to pH7 beaker
      duration: 1.0,
      onComplete: () => {
        setMeterOn(true);
        setMeterReading('7.00');
        playSuccessSound();
        setCalibrationPhase(1);
      }
    });
  };

  const handleDipBuffer4 = () => {
    if (currentStep !== 0 || calibrationPhase !== 1) return;
    playSelectSound();

    const el = electrodeRef.current;
    // Lift first
    gsap.timeline()
      .to(el.position, { y: 0.4, duration: 0.5 })
      .to(el.position, { x: -1.0, y: -0.15, z: 0.5, duration: 0.8 }) // Move to pH4 beaker
      .call(() => {
        setMeterReading('4.00');
        playSuccessSound();
        setCalibrationPhase(2);
      });
  };

  const handleLiftElectrode = () => {
    if (currentStep !== 0 || calibrationPhase !== 2) return;
    playSelectSound();

    const el = electrodeRef.current;
    gsap.to(el.position, {
      x: -1.2, y: 0.4, z: 0.2,
      duration: 0.8,
      onComplete: () => {
        setCalibrationPhase(3);
        setMeterOn(false);
        setMeterReading('0.00');
        setCurrentStep(1); // Proceed to fill titration cell
      }
    });
  };

  // Step 1: Pipette acetic acid
  const handlePipetteAcid = () => {
    if (currentStep !== 1) return;
    playSelectSound();

    const pipette = pipetteRef.current;
    const tl = gsap.timeline();

    tl.to(pipette.position, { y: -0.5, duration: 0.8 })
      .to(pipette.rotation, { z: 0, duration: 0.4 })
      .to(pipette.position, { x: -0.5, y: -0.6, z: 0.5, duration: 1 })
      .to(pipette.position, { y: -0.85, duration: 0.5 })
      .call(() => {
        playPourSound();
        setPipetteLiquidLevel(1.0);
      })
      .to({}, { duration: 1.0 })
      .to(pipette.position, { y: -0.4, duration: 0.8 })
      .to(pipette.position, { x: 0.0, y: -0.2, z: 0.0, duration: 1 })
      .to(pipette.position, { y: -0.4, duration: 0.5 })
      .call(() => {
        playPourSound();
        setPipetteLiquidLevel(0);
        setBeakerLiquidLevel(0.25);
      })
      .to({}, { duration: 1.0 })
      .to(pipette.position, { y: -0.5, duration: 0.5 })
      .to(pipette.position, { x: -2.0, y: -0.98, z: 0.2, duration: 1 })
      .to(pipette.rotation, { z: Math.PI/2, duration: 0.4 })
      .call(() => {
        setCurrentStep(2); // Go to dipping electrode in sample beaker
      });
  };

  // Step 2: Dip Electrode into sample beaker
  const handleDipSampleBeaker = () => {
    if (currentStep !== 2) return;
    playSelectSound();

    const el = electrodeRef.current;
    gsap.to(el.position, {
      x: 0, y: -0.15, z: 0,
      duration: 1.0,
      onComplete: () => {
        setCurrentStep(3);
      }
    });
  };

  // Step 3: Turn on Meter & Stirrer
  const handleTurnOnDevices = () => {
    if (currentStep !== 3) return;
    playSelectSound();
    setStirrerOn(true);
    setMeterOn(true);
    const initialPH = getPHVal(0);
    setMeterReading(initialPH);
    setAddedPoints([{ x: 0, y: parseFloat(initialPH) }]);

    // Initial table row
    setObservations({
      '0': { '0': '1', '1': '0.0', '2': initialPH }
    });

    setCurrentStep(4); // Go to Titration phase
  };

  // Step 4: Add NaOH 0.5 mL titration increments
  const handleAddNaOH = () => {
    if (currentStep !== 4 || isDripping) return;
    playSelectSound();
    setIsDripping(true);

    setTimeout(() => {
      setIsDripping(false);
      setVolAdded(prev => {
        const next = prev + 0.5;
        const ph = getPHVal(next);
        setMeterReading(ph);
        
        // Update Graph Panel points
        const newPoints = [...addedPoints, { x: next, y: parseFloat(ph) }];
        setAddedPoints(newPoints);

        // Populate table
        const stepIndex = Math.floor(next / 0.5) - 1;
        setObservations(prevObs => ({
          ...prevObs,
          [stepIndex]: {
            '0': stepIndex + 1,
            '1': next.toFixed(1),
            '2': ph
          }
        }));

        if (next >= 8.0) {
          playSuccessSound();
          setCurrentStep(5); // titration complete
        }

        return next;
      });
      setBeakerLiquidLevel(prev => Math.min(prev + 0.008, 0.5));
    }, 1000);
  };

  return (
    <group>
      {/* 1. Magnetic Stirrer & Beaker */}
      <MagneticStirrer position={[0, -1.0, 0]} isOn={stirrerOn} />
      <Beaker 
        ref={beakerRef}
        position={[0, -0.94, 0]}
        liquidColor="#e8ffff"
        liquidLevel={beakerLiquidLevel}
        size="250mL"
        showLabel="Titration Cell"
      />

      {/* 2. Burette Stand & Burette */}
      <BuretteStand position={[0.7, -1.0, -0.3]} label={false} />
      <Burette 
        position={[0.55, -0.2, -0.3]} 
        fillLevel={1.0 - (volAdded / 50.0)}
        liquidColor="#f2e6ff" // NaOH color light purple-clear
        stopcockGlowing={currentStep === 4 && !isDripping}
        onStopcockClick={handleAddNaOH}
      />

      {/* 3. pH Meter & Calibration Beakers */}
      <DigitalMeter 
        position={[1.5, -0.88, 0.4]}
        reading={meterReading}
        unit=""
        labelText="pH Meter"
        isOn={meterOn}
        isGlowing={currentStep === 3 && !meterOn}
        onClick={handleTurnOnDevices}
      />

      {/* Calibration Beaker 1: pH 7 */}
      <Beaker 
        position={[-1.5, -1.0, 0.5]}
        liquidColor="#e0ffe0" // green pH 7 buffer
        liquidLevel={0.4}
        size="100mL"
        showLabel="Buffer pH 7"
        isGlowing={currentStep === 0 && calibrationPhase === 0}
        onClick={handleDipBuffer7}
      />

      {/* Calibration Beaker 2: pH 4 */}
      <Beaker 
        position={[-1.0, -1.0, 0.5]}
        liquidColor="#ffe0e0" // red pH 4 buffer
        liquidLevel={0.4}
        size="100mL"
        showLabel="Buffer pH 4"
        isGlowing={currentStep === 0 && calibrationPhase === 1}
        onClick={handleDipBuffer4}
      />

      {/* Beaker with Cooling Fluid sample */}
      <Beaker 
        position={[-0.5, -1.0, 0.5]}
        liquidColor="#e8ffff"
        liquidLevel={0.6}
        size="100mL"
        showLabel="Cooling Fluid"
      />

      {/* Pipette */}
      <Pipette 
        ref={pipetteRef}
        position={[-2.0, -0.98, 0.2]}
        isGlowing={currentStep === 1}
        onClick={handlePipetteAcid}
        fillLevel={pipetteLiquidLevel}
      />

      {/* Dipable pH Electrode */}
      <group ref={electrodeRef} position={[-1.0, 0.4, 0.5]}>
        <Electrode 
          type="ph" 
          isGlowing={currentStep === 2 || (currentStep === 0 && calibrationPhase === 2)}
          onClick={calibrationPhase === 2 ? handleLiftElectrode : handleDipSampleBeaker}
        />
      </group>

      {isDripping && (
        <mesh position={[0.55, 0.1, -0.3]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#f2e6ff" />
        </mesh>
      )}

      {/* Back Wall Graph display showing pH curve */}
      <GraphPanel 
        position={[0, 1.6, -2.6]}
        title="titration S-Curve"
        xLabel="Volume of NaOH (mL)"
        yLabel="pH"
        dataPoints={addedPoints}
        xRange={[0, 8]}
        yRange={[2, 12]}
      />

      <group position={[0, 3.2, -2.6]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && calibrationPhase === 0 && "Calibration Phase: Click Buffer pH 7 to dip electrode"}
          {currentStep === 0 && calibrationPhase === 1 && "Buffer pH 7 Calibrated! Click Buffer pH 4 to dip electrode"}
          {currentStep === 0 && calibrationPhase === 2 && "Buffer pH 4 Calibrated! Click electrode to lift it out"}
          {currentStep === 1 && "Click Pipette to draw 20mL of cooling fluid sample"}
          {currentStep === 2 && "Click pH Electrode to dip it into titration beaker"}
          {currentStep === 3 && "Click pH Meter power button to start stirrer and read initial pH"}
          {currentStep === 4 && `NaOH added: ${volAdded.toFixed(1)} mL. Click Burette Stopcock to add 0.5 mL`}
          {currentStep === 5 && "Titration finished! Locate the pH jump at equivalence (~7.0 mL) and half-equivalence pH (~3.5 mL)."}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp7;
