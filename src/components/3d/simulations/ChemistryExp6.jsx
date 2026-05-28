import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { 
  Burette, BuretteStand, Beaker, ReagentBottle, 
  DigitalMeter, Electrode, MagneticStirrer, GraphPanel 
} from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';

// Potentiometric redox curve data generator
// Veq = 5.0 mL. Jump from ~450mV to ~750mV.
const getPotential = (vol) => {
  if (vol < 4.5) {
    return Math.round(350 + (100 * (vol / 4.5)));
  } else if (vol <= 5.5) {
    // Sharp jump around 5.0
    const fraction = (vol - 4.5) / 1.0;
    return Math.round(450 + 300 * fraction);
  } else {
    return Math.round(750 + (90 * Math.min((vol - 5.5) / 2.5, 1)));
  }
};

const ChemistryExp6 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();
  
  // Local states
  const [beakerLiquidLevel, setBeakerLiquidLevel] = useState(0);
  const [stirrerOn, setStirrerOn] = useState(false);
  const [meterOn, setMeterOn] = useState(false);
  const [meterReading, setMeterReading] = useState('0');
  const [volAdded, setVolAdded] = useState(0); // K2Cr2O7 added
  const [addedPoints, setAddedPoints] = useState([]); // [{x: vol, y: dEdV}]
  const [lastPotential, setLastPotential] = useState(350);
  const [isDripping, setIsDripping] = useState(false);
  const [electrodesDipped, setElectrodesDipped] = useState(0); // 0, 1, 2

  // Mesh Refs
  const sampleFlaskRef = useRef();
  const ptRef = useRef();
  const calomelRef = useRef();
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
      setMeterReading('0');
      setVolAdded(0);
      setAddedPoints([]);
      setIsDripping(false);
      setElectrodesDipped(0);
      setLastPotential(350);
      if (ptRef.current) ptRef.current.position.set(-0.06, 0.4, 0.0);
      if (calomelRef.current) calomelRef.current.position.set(0.06, 0.4, 0.0);
    }
  }, [currentStep]);

  // Titrate NaOH 0.5 mL step
  const handleAddTitrant = () => {
    if (currentStep !== 4 || isDripping) return;
    playSelectSound();
    setIsDripping(true);

    setTimeout(() => {
      setIsDripping(false);
      setVolAdded(prev => {
        const next = prev + 0.5;
        const potential = getPotential(next);
        setMeterReading(potential.toString());
        
        // Calculate ΔE/ΔV
        const dE = potential - lastPotential;
        const dEdV = dE / 0.5;
        setLastPotential(potential);

        // Update Graph Panel points (V vs dE/dV showing peak at Veq)
        let newPoints = [...addedPoints];
        if (next > 0.5) {
          // Graph ΔE/ΔV vs Mean Volume
          newPoints.push({ x: next - 0.25, y: dEdV / 50 }); // scaled to fit yRange [0, 10]
        }
        setAddedPoints(newPoints);

        // Populate table
        const stepIndex = Math.floor(next / 0.5) - 1;
        setObservations(prevObs => ({
          ...prevObs,
          [stepIndex]: {
            '0': stepIndex + 1,
            '1': next.toFixed(1),
            '2': potential.toString(),
            '3': next > 0.5 ? dEdV.toFixed(1) : '-'
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

  // Step 0: Pour rust sample Fe2+ into beaker
  const handlePourSample = () => {
    if (currentStep !== 0) return;
    playSelectSound();

    const flask = sampleFlaskRef.current;
    const tl = gsap.timeline();

    tl.to(flask.position, { y: -0.4, duration: 0.6 })
      .to(flask.position, { x: -0.4, y: -0.85, z: 0.2, duration: 1.0 })
      .to(flask.rotation, { z: -Math.PI / 3, duration: 0.5 })
      .call(() => {
        playPourSound();
        setBeakerLiquidLevel(0.25);
      })
      .to({}, { duration: 1.0 })
      .to(flask.rotation, { z: 0, duration: 0.5 })
      .to(flask.position, { x: -1.5, y: -1.0, z: 0.5, duration: 1.0 })
      .call(() => {
        setCurrentStep(1);
      });
  };

  // Step 1: Dip Pt Electrode
  const handleDipPt = () => {
    if (currentStep !== 1) return;
    playSelectSound();

    const el = ptRef.current;
    gsap.to(el.position, {
      y: -0.15,
      duration: 1.0,
      onComplete: () => {
        setElectrodesDipped(prev => prev + 1);
        setCurrentStep(2);
      }
    });
  };

  // Step 2: Dip Calomel Electrode
  const handleDipCalomel = () => {
    if (currentStep !== 2) return;
    playSelectSound();

    const el = calomelRef.current;
    gsap.to(el.position, {
      y: -0.15,
      duration: 1.0,
      onComplete: () => {
        setElectrodesDipped(prev => prev + 1);
        setCurrentStep(3);
      }
    });
  };

  // Step 3: Turn on meter and stirrer
  const handleTurnOnDevices = () => {
    if (currentStep !== 3) return;
    playSelectSound();
    setStirrerOn(true);
    setMeterOn(true);
    const initialPot = getPotential(0);
    setMeterReading(initialPot.toString());
    setLastPotential(initialPot);

    // Initial table row
    setObservations({
      '0': { '0': '1', '1': '0.0', '2': initialPot.toString(), '3': '-' }
    });

    setCurrentStep(4);
  };

  return (
    <group>
      {/* 1. Magnetic Stirrer & Beaker */}
      <MagneticStirrer position={[0, -1.0, 0]} isOn={stirrerOn} />
      <Beaker 
        ref={beakerRef}
        position={[0, -0.94, 0]}
        liquidColor="#c2e7b5" // light green Fe2+
        liquidLevel={beakerLiquidLevel}
        size="250mL"
        showLabel="Titration Cell"
      />

      {/* 2. Burette Stand & Burette */}
      <BuretteStand position={[0.7, -1.0, -0.3]} label={false} />
      <Burette 
        position={[0.55, -0.2, -0.3]} 
        fillLevel={1.0 - (volAdded / 50.0)}
        liquidColor="#ffa500" // orange K2Cr2O7
        stopcockGlowing={currentStep === 4 && !isDripping}
        onStopcockClick={handleAddTitrant}
      />

      {/* 3. Potentiometer & Electrodes */}
      <DigitalMeter 
        position={[-1.0, -0.88, -0.3]}
        reading={meterReading}
        unit="mV"
        labelText="Potentiometer"
        isOn={meterOn}
        isGlowing={currentStep === 3 && !meterOn}
        onClick={handleTurnOnDevices}
      />

      <group ref={ptRef} position={[-0.06, 0.4, 0.0]}>
        <Electrode 
          type="platinum" 
          isGlowing={currentStep === 1}
          onClick={handleDipPt}
        />
      </group>

      <group ref={calomelRef} position={[0.06, 0.4, 0.0]}>
        <Electrode 
          type="calomel" 
          isGlowing={currentStep === 2}
          onClick={handleDipCalomel}
        />
      </group>

      {/* 4. Flask containing dissolved rust sample Fe2+ */}
      <ReagentBottle 
        ref={sampleFlaskRef}
        position={[-1.5, -1.0, 0.5]}
        labelText="Rust Sample Fe2+"
        liquidColor="#c2e7b5"
        isGlowing={currentStep === 0}
        onClick={handlePourSample}
      />

      {isDripping && (
        <mesh position={[0.55, 0.1, -0.3]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#ffa500" />
        </mesh>
      )}

      {/* Back Wall Graph display showing first derivative dE/dV peak */}
      <GraphPanel 
        position={[0, 0.8, -1.8]}
        title="First Derivative dE/dV Curve"
        xLabel="Volume of K2Cr2O7 (mL)"
        yLabel="dE/dV (mV/mL)"
        dataPoints={addedPoints}
        xRange={[0, 8]}
        yRange={[0, 10]} // y value scaled down to fit nicely
      />

      <group position={[0, 1.6, -2]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && "Click Rust Sample flask to pour solution into titration beaker"}
          {currentStep === 1 && "Click Platinum indicator electrode to dip it in beaker"}
          {currentStep === 2 && "Click Calomel reference electrode to dip it in beaker"}
          {currentStep === 3 && "Click Potentiometer power button to start stirrer and read initial potential"}
          {currentStep === 4 && `K2Cr2O7 added: ${volAdded.toFixed(1)} mL. Click Burette Stopcock to add 0.5 mL`}
          {currentStep === 5 && "Redox titration finished! Notice the peak of dE/dV at equivalence point (~5.0 mL)."}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp6;
