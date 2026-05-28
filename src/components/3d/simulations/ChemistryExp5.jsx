import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { 
  Burette, BuretteStand, Beaker, Pipette, 
  DigitalMeter, Electrode, MagneticStirrer, GraphPanel,
  Droplet, RecordButton
} from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';

// Conductometric V-curve data generator
// HCl neutralization (V=0 to 5.0mL): Conductance drops from ~3.5 to ~1.2
// CH3COOH neutralization (V=5.0 to 10.5mL): Conductance rises slightly from ~1.2 to ~1.8
// Excess NaOH (V > 10.5mL): Conductance rises steeply
const getConductance = (vol) => {
  if (vol <= 5.0) {
    return (3.5 - (3.5 - 1.2) * (vol / 5.0)).toFixed(2);
  } else if (vol <= 10.5) {
    return (1.2 + (1.8 - 1.2) * ((vol - 5.0) / 5.5)).toFixed(2);
  } else {
    return (1.8 + (3.5 - 1.8) * ((vol - 10.5) / 4.5)).toFixed(2);
  }
};

const ChemistryExp5 = () => {
  const { currentStep, setCurrentStep, setObservations, observations } = useExperiment();
  
  // Local states
  const [pipetteLiquidLevel, setPipetteLiquidLevel] = useState(0);
  const [beakerLiquidLevel, setBeakerLiquidLevel] = useState(0);
  const [stirrerOn, setStirrerOn] = useState(false);
  const [meterOn, setMeterOn] = useState(false);
  const [meterReading, setMeterReading] = useState('0.00');
  const [volAdded, setVolAdded] = useState(0); // NaOH added in mL
  const [addedPoints, setAddedPoints] = useState([]); // [{x: vol, y: cond}]
  const [isDripping, setIsDripping] = useState(false);
  const [electrodeDipped, setElectrodeDipped] = useState(false);
  const [latestCond, setLatestCond] = useState('0.00');
  const [dropY, setDropY] = useState(0.1);

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
      setPipetteLiquidLevel(0);
      setBeakerLiquidLevel(0);
      setStirrerOn(false);
      setMeterOn(false);
      setMeterReading('0.00');
      setVolAdded(0);
      setAddedPoints([]);
      setIsDripping(false);
      setElectrodeDipped(false);
      if (electrodeRef.current) {
        electrodeRef.current.position.set(0.0, 0.4, 0.0);
      }
    }
  }, [currentStep]);

  // useFrame for continuous drip and reading updates
  useFrame((state, delta) => {
    if (isDripping && currentStep === 3) {
      setDropY(prev => {
        let next = prev - delta * 2;
        if(next < -0.8) return 0.1;
        return next;
      });

      setVolAdded(prev => {
        const next = prev + delta * 2.0; // continuous flow rate (mL/s)
        const cond = parseFloat(getConductance(next));
        setMeterReading(cond.toFixed(2));
        setLatestCond(cond.toFixed(2));
        return next;
      });
      setBeakerLiquidLevel(prev => Math.min(prev + delta * 0.015, 0.5));
    }
  });

  const handleStopcockDown = () => {
    if (currentStep === 3) setIsDripping(true);
  };
  const handleStopcockUp = () => {
    if (currentStep === 3) setIsDripping(false);
  };
  const handleStopcockClick = () => {
    if (currentStep === 3) {
      playSelectSound();
      setIsDripping(true);
      setTimeout(() => setIsDripping(false), 150);
    }
  };

  const handleRecord = () => {
    if (currentStep === 3) {
      playSuccessSound();
      const nextPoints = [...addedPoints, { x: volAdded, y: parseFloat(latestCond) }];
      setAddedPoints(nextPoints);
      
      const stepIndex = nextPoints.length - 1;
      setObservations(prevObs => ({
        ...prevObs,
        [stepIndex]: {
          '0': stepIndex + 1,
          '1': volAdded.toFixed(1),
          '2': latestCond
        }
      }));

      if (volAdded >= 18.0) {
        setCurrentStep(4);
      }
    }
  };

  // Step 0: Pipette acid mixture
  const handlePipetteAcid = () => {
    if (currentStep !== 0) return;
    playSelectSound();

    const pipette = pipetteRef.current;
    const tl = gsap.timeline();

    tl.to(pipette.position, { y: -0.5, duration: 0.8 })
      .to(pipette.rotation, { z: 0, duration: 0.4 })
      .to(pipette.position, { x: -1.5, y: -0.6, z: 0.5, duration: 1 })
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
        setCurrentStep(1);
      });
  };

  // Step 1: Dip Electrode
  const handleDipElectrode = () => {
    if (currentStep !== 1) return;
    playSelectSound();

    const el = electrodeRef.current;
    gsap.to(el.position, {
      y: -0.15, // dip into the beaker
      duration: 1.0,
      onComplete: () => {
        setElectrodeDipped(true);
        setCurrentStep(2);
      }
    });
  };

  // Step 2: Turn on Stirrer and Meter
  const handleTurnOnDevices = () => {
    if (currentStep !== 2) return;
    playSelectSound();
    setStirrerOn(true);
    setMeterOn(true);
    const initialCond = parseFloat(getConductance(0));
    setMeterReading(initialCond.toFixed(2));
    setAddedPoints([{ x: 0, y: initialCond }]);
    
    // Set initial row
    setObservations({
      '0': { '0': '1', '1': '0.0', '2': initialCond.toFixed(2) }
    });

    setCurrentStep(3); // Go to Titration phase
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
        stopcockGlowing={currentStep === 3}
        onStopcockClick={handleStopcockClick}
        onStopcockDown={handleStopcockDown}
        onStopcockUp={handleStopcockUp}
      />

      {/* 3. Conductivity Meter & Electrode */}
      <DigitalMeter 
        position={[-1.0, -0.88, -0.3]}
        reading={meterReading}
        unit="mS"
        labelText="Conductivity Meter"
        isOn={meterOn}
        isGlowing={currentStep === 2 && !meterOn}
        onClick={handleTurnOnDevices}
      />

      <group ref={electrodeRef} position={[0.0, 0.4, 0.0]}>
        <Electrode 
          type="conductivity" 
          isGlowing={currentStep === 1}
          onClick={handleDipElectrode}
        />
      </group>

      {/* 4. Beaker with Acid Mixture Sample */}
      <Beaker 
        position={[-1.5, -1.0, 0.5]}
        liquidColor="#e8ffff"
        liquidLevel={0.6}
        size="100mL"
        showLabel="Acid Mixture (HCl+CH3COOH)"
      />

      {/* Pipette */}
      <Pipette 
        ref={pipetteRef}
        position={[-2.0, -0.98, 0.2]}
        isGlowing={currentStep === 0}
        onClick={handlePipetteAcid}
        fillLevel={pipetteLiquidLevel}
      />

      {isDripping && (
        <Droplet position={[0.55, dropY, -0.3]} color="#f2e6ff" scale={1.2} />
      )}

      {/* Record Button */}
      <RecordButton 
        position={[-1.2, -1.0, 0.2]} 
        onClick={handleRecord} 
        isGlowing={currentStep === 3 && !isDripping} 
      />

      {/* Wall mounted Graph Panel */}
      <GraphPanel 
        position={[0, 0.8, -1.8]}
        title="Conductance vs NaOH Volume"
        xLabel="Volume of NaOH (mL)"
        yLabel="Conductance (mS)"
        dataPoints={addedPoints}
        xRange={[0, 12]}
        yRange={[0, 4]}
      />

      <group position={[0, 1.6, -2]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && "Click Pipette to draw 20mL of Acid Mixture"}
          {currentStep === 1 && "Click the Conductivity Cell electrode to dip it in the beaker"}
          {currentStep === 2 && "Click the Conductivity Meter to turn on stirrer and display conductance"}
          {currentStep === 3 && `NaOH Added: ${volAdded.toFixed(1)} mL. Click Burette Stopcock to add 0.5 mL`}
          {currentStep === 4 && "Titration finished! Observe the V-curve breaks V1 and V2 in the graph."}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp5;
