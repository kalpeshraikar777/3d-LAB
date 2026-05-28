import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { 
  OstwaldViscometer, SuctionBulb, Stopwatch, DensityBottle, 
  Beaker, RetortStand, WeighingBalance 
} from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';

const ChemistryExp9 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();
  
  // Local states
  const [viscLiquidLevel, setViscLiquidLevel] = useState(0); // in viscometer left arm
  const [capillaryLevel, setCapillaryLevel] = useState(0); // in right arm bulb
  const [activeLiquid, setActiveLiquid] = useState('water'); // 'water' or 'coolant'
  const [stopwatchTime, setStopwatchTime] = useState('00:00.00');
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [trialsDone, setTrialsDone] = useState({ water: [], coolant: [] });
  const [balanceOn, setBalanceOn] = useState(false);
  const [balanceReading, setBalanceReading] = useState('0.000');
  const [densityStep, setDensityStep] = useState(0); // 0: initial, 1: empty weighed, 2: water weighed, 3: coolant weighed
  const [densityWeights, setDensityWeights] = useState({ empty: 24.520, water: 49.445, coolant: 51.820 });

  // Refs for animating meshes
  const suctionBulbRef = useRef();
  const waterBeakerRef = useRef();
  const coolantBeakerRef = useRef();
  const densityBottleRef = useRef();
  const balanceRef = useRef();

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
      setViscLiquidLevel(0);
      setCapillaryLevel(0);
      setActiveLiquid('water');
      setStopwatchTime('00:00.00');
      setStopwatchRunning(false);
      setTrialsDone({ water: [], coolant: [] });
      setBalanceOn(false);
      setBalanceReading('0.000');
      setDensityStep(0);
      if (densityBottleRef.current) {
        densityBottleRef.current.position.set(0.6, -1.0, 0.4);
      }
    }
  }, [currentStep]);

  // Stopwatch ticking & liquid draining frame loop
  useFrame((state, delta) => {
    if (stopwatchRunning) {
      // Drain right arm capillary bulb
      const drainSpeed = activeLiquid === 'water' ? 0.08 : 0.038; // coolant is slower/viscous
      setCapillaryLevel(prev => {
        const next = prev - delta * drainSpeed;
        if (next <= 0) {
          // Reached bottom mark! Stop stopwatch
          setStopwatchRunning(false);
          playSuccessSound();

          const finalTime = activeLiquid === 'water' 
            ? [18.25, 18.30, 18.22][trialsDone.water.length]
            : [38.50, 38.60, 38.45][trialsDone.coolant.length];
          
          setStopwatchTime(`00:${finalTime.toFixed(2).replace('.', ':')}`);

          // Update trials log
          setTrialsDone(prevLog => {
            const nextLog = { ...prevLog };
            nextLog[activeLiquid].push(finalTime);
            
            // Map observations
            const isWater = activeLiquid === 'water';
            const rowIndex = isWater ? '0' : '1';
            const liquidLabel = isWater ? 'Water' : 'Coolant';

            if (nextLog[activeLiquid].length === 3) {
              // 3 trials complete! Auto-write mean to table
              const sum = nextLog[activeLiquid].reduce((a, b) => a + b, 0);
              const mean = sum / 3;

              setObservations(prevObs => ({
                ...prevObs,
                [rowIndex]: {
                  '0': liquidLabel,
                  '1': nextLog[activeLiquid][0].toFixed(2),
                  '2': nextLog[activeLiquid][1].toFixed(2),
                  '3': nextLog[activeLiquid][2].toFixed(2),
                  '4': isWater ? '0.997' : '1.092', // densities
                  '5': mean.toFixed(2)
                }
              }));

              // Progress steps
              setTimeout(() => {
                if (isWater) {
                  setCurrentStep(4); // empty & clean
                } else {
                  setCurrentStep(8); // measure densities
                }
              }, 1500);

            } else {
              // Write individual trial reading
              setObservations(prevObs => ({
                ...prevObs,
                [rowIndex]: {
                  ...prevObs[rowIndex],
                  '0': liquidLabel,
                  [nextLog[activeLiquid].length]: finalTime.toFixed(2)
                }
              }));
            }
            return nextLog;
          });

          return 0;
        }
        return next;
      });

      // Stopwatch display update
      const elapsed = state.clock.getElapsedTime();
      const rawSec = activeLiquid === 'water'
        ? 18.25 * (1.0 - capillaryLevel)
        : 38.50 * (1.0 - capillaryLevel);
      setStopwatchTime(`00:${rawSec.toFixed(2).padStart(5, '0').replace('.', ':')}`);
    }
  });

  // Step 0: Fill Water Beaker into Viscometer
  const handlePourWater = () => {
    if (currentStep !== 0) return;
    playSelectSound();

    const beaker = waterBeakerRef.current;
    const tl = gsap.timeline();

    tl.to(beaker.position, { y: -0.4, duration: 0.6 })
      .to(beaker.position, { x: -0.22, y: 0.15, z: 0.1, duration: 1.0 })
      .to(beaker.rotation, { z: -Math.PI / 4, duration: 0.5 })
      .call(() => {
        playPourSound();
        setViscLiquidLevel(0.85);
      })
      .to({}, { duration: 1.0 })
      .to(beaker.rotation, { z: 0, duration: 0.5 })
      .to(beaker.position, { x: -1.4, y: -1.0, z: 0.5, duration: 1.0 })
      .call(() => {
        setCurrentStep(1); // Go to suction phase
      });
  };

  // Step 1: Use Suction Bulb to pull liquid up capillary
  const handleSuckCapillary = () => {
    if ((currentStep !== 1 && currentStep !== 5) || capillaryLevel > 0) return;
    playSelectSound();

    const bulb = suctionBulbRef.current;
    const tl = gsap.timeline();

    tl.to(bulb.position, { y: -0.4, duration: 0.5 })
      .to(bulb.position, { x: 0.08, y: 0.45, z: 0.0, duration: 0.8 })
      .to(bulb.scale, { y: 0.7, x: 0.85, z: 0.85, duration: 0.3 }) // Squeeze
      .call(() => {
        playPourSound();
        setCapillaryLevel(1.0);
      })
      .to(bulb.scale, { y: 1.0, x: 1.0, z: 1.0, duration: 0.5 }) // Release
      .to(bulb.position, { x: 1.0, y: -1.0, z: 0.0, duration: 0.8 })
      .call(() => {
        if (currentStep === 1) setCurrentStep(2);
        if (currentStep === 5) setCurrentStep(6);
      });
  };

  // Step 2 & 6: Measure flow times with stopwatch
  const handleStartStopwatch = () => {
    if ((currentStep !== 2 && currentStep !== 6) || stopwatchRunning) return;
    playSelectSound();
    setStopwatchRunning(true);
  };

  // Step 4: Empty and Clean Viscometer
  const handleCleanViscometer = () => {
    if (currentStep !== 4) return;
    playSelectSound();
    
    // Animate emptying/cleaning
    setViscLiquidLevel(0);
    setCapillaryLevel(0);
    setActiveLiquid('coolant');
    
    setTimeout(() => {
      playSuccessSound();
      setCurrentStep(5); // Now ready for coolant sample
    }, 1000);
  };

  // Step 5: Fill Viscometer with Coolant sample
  const handlePourCoolant = () => {
    if (currentStep !== 5 || activeLiquid !== 'coolant') return;
    playSelectSound();

    const beaker = coolantBeakerRef.current;
    const tl = gsap.timeline();

    tl.to(beaker.position, { y: -0.4, duration: 0.6 })
      .to(beaker.position, { x: -0.22, y: 0.15, z: 0.1, duration: 1.0 })
      .to(beaker.rotation, { z: -Math.PI / 4, duration: 0.5 })
      .call(() => {
        playPourSound();
        setViscLiquidLevel(0.85);
      })
      .to({}, { duration: 1.0 })
      .to(beaker.rotation, { z: 0, duration: 0.5 })
      .to(beaker.position, { x: -0.8, y: -1.0, z: 0.5, duration: 1.0 })
      .call(() => {
        // Go back to step 5 but capillary ready to be sucked
        // Actually, we skip directly to step 5 with filled viscometer
      });
  };

  // Step 8: Density balance measurements
  const handleWeighDensityBottle = () => {
    if (currentStep !== 8) return;
    playSelectSound();

    const bottle = densityBottleRef.current;
    const tl = gsap.timeline();

    if (densityStep === 0) {
      // Weigh empty bottle
      setBalanceOn(true);
      tl.to(bottle.position, { y: -0.4, duration: 0.5 })
        .to(bottle.position, { x: 1.6, y: -0.92, z: 0.5, duration: 0.8 })
        .call(() => {
          setBalanceReading(densityWeights.empty.toFixed(3));
          playSuccessSound();
          setDensityStep(1);
        });
    } else if (densityStep === 1) {
      // Fill with water & weigh
      tl.to(bottle.position, { y: -0.4, duration: 0.5 })
        .to(bottle.position, { x: -1.4, y: -0.8, z: 0.5, duration: 0.8 }) // dip in water beaker
        .to(bottle.rotation, { z: -Math.PI/6, duration: 0.3 })
        .call(() => playPourSound())
        .to({}, { duration: 1.0 })
        .to(bottle.rotation, { z: 0, duration: 0.3 })
        .to(bottle.position, { x: 1.6, y: -0.92, z: 0.5, duration: 0.8 })
        .call(() => {
          setBalanceReading(densityWeights.water.toFixed(3));
          playSuccessSound();
          setDensityStep(2);
        });
    } else if (densityStep === 2) {
      // Empty, fill with coolant & weigh
      tl.to(bottle.position, { y: -0.4, duration: 0.5 })
        .to(bottle.position, { x: -0.8, y: -0.8, z: 0.5, duration: 0.8 }) // dip in coolant beaker
        .to(bottle.rotation, { z: -Math.PI/6, duration: 0.3 })
        .call(() => playPourSound())
        .to({}, { duration: 1.0 })
        .to(bottle.rotation, { z: 0, duration: 0.3 })
        .to(bottle.position, { x: 1.6, y: -0.92, z: 0.5, duration: 0.8 })
        .call(() => {
          setBalanceReading(densityWeights.coolant.toFixed(3));
          playSuccessSound();
          setDensityStep(3);
        });
    } else if (densityStep === 3) {
      // Put bottle back
      tl.to(bottle.position, { y: -0.4, duration: 0.5 })
        .to(bottle.position, { x: 0.6, y: -1.0, z: 0.4, duration: 0.8 })
        .call(() => {
          setBalanceOn(false);
          setBalanceReading('0.000');
          playSuccessSound();
          setCurrentStep(9); // complete
        });
    }
  };

  return (
    <group>
      {/* 1. Retort Stand holding Ostwald Viscometer */}
      <RetortStand position={[-0.1, -1.0, 0]} />
      <OstwaldViscometer 
        position={[-0.1, -0.2, 0]}
        liquidLevel={viscLiquidLevel}
        liquidColor={activeLiquid === 'water' ? '#e0f7fa' : '#b3e5fc'} // coolant is darker blue-clear
      />

      {/* 2. Suction Bulb */}
      <SuctionBulb 
        ref={suctionBulbRef}
        position={[1.0, -1.0, 0.0]}
        isGlowing={(currentStep === 1 || currentStep === 5) && viscLiquidLevel > 0 && capillaryLevel === 0}
        onClick={handleSuckCapillary}
      />

      {/* 3. Stopwatch */}
      <Stopwatch 
        position={[1.1, -0.85, 0.5]}
        time={stopwatchTime}
        isRunning={stopwatchRunning}
        isGlowing={(currentStep === 2 || currentStep === 6) && capillaryLevel > 0 && !stopwatchRunning}
        onClick={handleStartStopwatch}
      />

      {/* 4. Density Bottle */}
      <DensityBottle 
        ref={densityBottleRef}
        position={[0.6, -1.0, 0.4]}
        isGlowing={currentStep === 8}
        onClick={handleWeighDensityBottle}
      />

      {/* 5. Weighing Balance */}
      <WeighingBalance 
        ref={balanceRef}
        position={[1.6, -1.0, 0.5]}
        reading={balanceReading}
        isOn={balanceOn}
      />

      {/* 6. Distilled Water Beaker */}
      <Beaker 
        ref={waterBeakerRef}
        position={[-1.4, -1.0, 0.5]}
        liquidColor="#e0f7fa"
        liquidLevel={0.8}
        showLabel="Distilled Water"
        isGlowing={currentStep === 0}
        onClick={handlePourWater}
      />

      {/* 7. Coolant Sample Beaker */}
      <Beaker 
        ref={coolantBeakerRef}
        position={[-0.8, -1.0, 0.5]}
        liquidColor="#b3e5fc"
        liquidLevel={0.8}
        showLabel="Liquid Coolant"
        isGlowing={currentStep === 5 && viscLiquidLevel === 0}
        onClick={handlePourCoolant}
      />

      <group position={[0, 1.6, -2]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && "Step 1: Click the Distilled Water beaker to fill the viscometer"}
          {currentStep === 1 && "Click Suction Bulb to suck water into the upper bulb of viscometer"}
          {currentStep === 2 && `Water Trial ${trialsDone.water.length + 1}: Click Stopwatch to release water and measure flow time`}
          {currentStep === 4 && "Click the Viscometer to empty and dry it for the next sample"}
          {currentStep === 5 && viscLiquidLevel === 0 && "Step 2: Click the Liquid Coolant beaker to fill the viscometer"}
          {currentStep === 5 && viscLiquidLevel > 0 && "Click Suction Bulb to suck coolant into the upper bulb"}
          {currentStep === 6 && `Coolant Trial ${trialsDone.coolant.length + 1}: Click Stopwatch to measure flow time`}
          {currentStep === 8 && densityStep === 0 && "Step 3: Click Density Bottle to weigh empty bottle on balance"}
          {currentStep === 8 && densityStep === 1 && "Click Density Bottle to fill with water and weigh it"}
          {currentStep === 8 && densityStep === 2 && "Click Density Bottle to empty, fill with coolant and weigh it"}
          {currentStep === 8 && densityStep === 3 && "Click Density Bottle to return it to the lab bench"}
          {currentStep === 9 && "Viscosity measurements complete! Open the Lab Notebook to see your results."}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp9;
