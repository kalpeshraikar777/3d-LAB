import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { 
  Burette, BuretteStand, ConicalFlask, Beaker, Pipette, 
  Dropper, WhiteTile, Droplet, RecordButton 
} from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const ChemistryExp4 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();
  
  // Local states
  const [pipetteLiquidLevel, setPipetteLiquidLevel] = useState(0);
  const [conicalFlaskLiquidLevel, setConicalFlaskLiquidLevel] = useState(0);
  const [conicalFlaskLiquidColor, setConicalFlaskLiquidColor] = useState('#ffffff');
  const [buretteFillLevel, setBuretteFillLevel] = useState(1.0); // prefilled with HCl
  const [isDripping, setIsDripping] = useState(false);
  const [isSwirling, setIsSwirling] = useState(false);
  const [showBuretteReading, setShowBuretteReading] = useState(false);
  const [readingText, setReadingText] = useState('');
  const [dropY, setDropY] = useState(0.1);

  // Mesh Refs
  const pipetteRef = useRef();
  const ppRef = useRef(); // Phenolphthalein
  const moRef = useRef(); // Methyl Orange
  const conicalFlaskRef = useRef();

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
      setConicalFlaskLiquidLevel(0);
      setConicalFlaskLiquidColor('#ffffff');
      setBuretteFillLevel(1.0);
      setIsDripping(false);
      setIsSwirling(false);
      setShowBuretteReading(false);
    }
  }, [currentStep]);

  useFrame((state, delta) => {
    if (isSwirling && conicalFlaskRef.current) {
      const t = state.clock.getElapsedTime();
      conicalFlaskRef.current.position.x = -0.7 + Math.sin(t * 15) * 0.05;
      conicalFlaskRef.current.position.z = Math.cos(t * 15) * 0.05;
    }
  });

  useFrame((state, delta) => {
    if (isDripping) {
      setDropY(prev => {
        let next = prev - delta * 2;
        if(next < -0.8) return 0.1;
        return next;
      });

      setBuretteFillLevel(prev => {
        const next = prev - delta * 0.05;
        const volAdded = (1.0 - next) * 50.0;

        if (currentStep === 2) {
          // Phenolphthalein titration: pink to colourless at 15.2 mL
          if (volAdded >= 15.2) {
            setConicalFlaskLiquidColor('#e8ffff'); // colourless
            if (prev > 1.0 - 15.2/50) { // Trigger endpoint once
              setIsDripping(false);
              setIsSwirling(false);
              playSuccessSound();
              setCurrentStep(3); // Read burette P
            }
          } else {
            // Lerp from bright pink to colourless
            const progress = volAdded / 15.2;
            const c1 = new THREE.Color('#ff69b4');
            const c2 = new THREE.Color('#e8ffff');
            c1.lerp(c2, progress);
            setConicalFlaskLiquidColor('#' + c1.getHexString());
          }
        } else if (currentStep === 5) {
          // Methyl Orange titration: yellow to red-orange at 22.8 mL
          if (volAdded >= 22.8) {
            setConicalFlaskLiquidColor('#ff4500'); // red-orange
            if (prev > 1.0 - 22.8/50) {
              setIsDripping(false);
              setIsSwirling(false);
              playSuccessSound();
              setCurrentStep(6); // Read final burette M
            }
          } else {
            // Lerp from yellow to orange to red-orange
            const progress = Math.max(0, (volAdded - 15.2) / (22.8 - 15.2));
            const c1 = new THREE.Color('#ffc832'); // yellow
            const c2 = new THREE.Color('#ff4500'); // red-orange
            c1.lerp(c2, progress);
            setConicalFlaskLiquidColor('#' + c1.getHexString());
          }
        }
        return Math.max(next, 0);
      });
    }
  });

  // Step 0: Pipette water sample
  const handlePipetteWater = () => {
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
      .to(pipette.position, { x: -0.7, y: -0.2, z: 0.0, duration: 1 })
      .to(pipette.position, { y: -0.4, duration: 0.5 })
      .call(() => {
        playPourSound();
        setPipetteLiquidLevel(0);
        setConicalFlaskLiquidLevel(0.35); // 100mL sample
      })
      .to({}, { duration: 1.0 })
      .to(pipette.position, { y: -0.5, duration: 0.5 })
      .to(pipette.position, { x: -2.0, y: -0.98, z: 0.2, duration: 1 })
      .to(pipette.rotation, { z: Math.PI/2, duration: 0.4 })
      .call(() => {
        setCurrentStep(1);
      });
  };

  // Step 1: Add Phenolphthalein
  const handleAddPP = () => {
    if (currentStep !== 1) return;
    playSelectSound();

    const pp = ppRef.current;
    const tl = gsap.timeline();

    tl.to(pp.position, { y: -0.4, duration: 0.6 })
      .to(pp.position, { x: -0.7, y: 0.1, z: 0.0, duration: 1 })
      .to(pp.rotation, { x: Math.PI / 6, duration: 0.4 })
      .call(() => {
        playPourSound();
        setConicalFlaskLiquidColor('#ff66cc'); // Pink
      })
      .to({}, { duration: 0.8 })
      .to(pp.rotation, { x: 0, duration: 0.4 })
      .to(pp.position, { x: 0.0, y: -1.0, z: 0.5, duration: 1 })
      .call(() => {
        setCurrentStep(2);
      });
  };

  // Step 4: Add Methyl Orange
  const handleAddMO = () => {
    if (currentStep !== 4) return;
    playSelectSound();

    const mo = moRef.current;
    const tl = gsap.timeline();

    tl.to(mo.position, { y: -0.4, duration: 0.6 })
      .to(mo.position, { x: -0.7, y: 0.1, z: 0.0, duration: 1 })
      .to(mo.rotation, { x: Math.PI / 6, duration: 0.4 })
      .call(() => {
        playPourSound();
        setConicalFlaskLiquidColor('#ffd700'); // Yellow
      })
      .to({}, { duration: 0.8 })
      .to(mo.rotation, { x: 0, duration: 0.4 })
      .to(mo.position, { x: 0.6, y: -1.0, z: 0.5, duration: 1 })
      .call(() => {
        setCurrentStep(5);
      });
  };

  const handleStopcockDown = () => {
    if (currentStep === 2 || currentStep === 5) {
      setIsDripping(true);
      setIsSwirling(true);
    }
  };

  const handleStopcockUp = () => {
    if (currentStep === 2 || currentStep === 5) {
      setIsDripping(false);
      setIsSwirling(false);
    }
  };

  const handleStopcockClick = () => {
    if (currentStep === 2 || currentStep === 5) {
      playSelectSound();
      setIsDripping(true);
      setIsSwirling(true);
      setTimeout(() => {
        setIsDripping(false);
        setIsSwirling(false);
      }, 150);
    }
  };

  const handleBuretteClick = () => {
    if (currentStep === 3) {
      setReadingText('V1 = 15.2 mL');
      setShowBuretteReading(true);
    } else if (currentStep === 6) {
      setReadingText('V2 = 22.8 mL');
      setShowBuretteReading(true);
    }
  };

  const handleRecord = () => {
    if (currentStep === 3 && showBuretteReading) {
      playSuccessSound();
      setObservations(prev => ({
        ...prev,
        '0': { ...prev['0'], '0': '1', '1': '15.2' }
      }));
      setShowBuretteReading(false);
      setCurrentStep(4);
    } else if (currentStep === 6 && showBuretteReading) {
      playSuccessSound();
      setObservations(prev => ({
        ...prev,
        '0': { ...prev['0'], '2': '22.8', '3': '304' } // simplified bicarbonate calculation
      }));
      setShowBuretteReading(false);
      setCurrentStep(7);
    }
  };

  return (
    <group>
      <BuretteStand position={[-0.5, -1.0, 0]} label={false} />
      <WhiteTile position={[-0.7, -1.0, 0]} />

      <Burette 
        position={[-0.7, -0.2, 0]} 
        fillLevel={buretteFillLevel}
        liquidColor="#e8ffff"
        stopcockGlowing={currentStep === 2 || currentStep === 5}
        onStopcockClick={handleStopcockClick}
        onStopcockDown={handleStopcockDown}
        onStopcockUp={handleStopcockUp}
        onClick={handleBuretteClick}
      />

      <ConicalFlask 
        ref={conicalFlaskRef}
        position={[-0.7, -1.0, 0]}
        liquidColor={conicalFlaskLiquidColor}
        liquidLevel={conicalFlaskLiquidLevel}
        showLabel="Titration Flask"
      />

      {/* Phenolphthalein indicator */}
      <Dropper 
        ref={ppRef}
        position={[0.0, -1.0, 0.5]}
        labelText="Phenolphthalein"
        liquidColor="#ff66cc"
        isGlowing={currentStep === 1}
        onClick={handleAddPP}
      />

      {/* Methyl Orange indicator */}
      <Dropper 
        ref={moRef}
        position={[0.6, -1.0, 0.5]}
        labelText="Methyl Orange"
        liquidColor="#ffaa00"
        isGlowing={currentStep === 4}
        onClick={handleAddMO}
      />

      <Beaker 
        position={[-1.5, -1.0, 0.5]}
        liquidColor="#e8ffff"
        liquidLevel={0.9}
        showLabel="Water Sample"
      />

      <Pipette 
        ref={pipetteRef}
        position={[-2.0, -0.98, 0.2]}
        isGlowing={currentStep === 0}
        onClick={handlePipetteWater}
        fillLevel={pipetteLiquidLevel}
      />

      {isDripping && (
        <Droplet position={[-0.7, dropY, 0]} color="#e8ffff" scale={1.2} />
      )}

      {/* Record Button */}
      <RecordButton 
        position={[-1.2, -1.0, -0.3]} 
        onClick={handleRecord} 
        isGlowing={showBuretteReading} 
      />

      {showBuretteReading && (
        <group position={[-0.7, 1.0, 0.5]}>
          <mesh>
            <planeGeometry args={[1.0, 0.5]} />
            <meshBasicMaterial color="#111" transparent opacity={0.9} />
          </mesh>
          <Text position={[0, 0.1, 0.01]} fontSize={0.05} color="#00ffcc">Burette scale</Text>
          <Text position={[0, -0.1, 0.01]} fontSize={0.06} color="#fff">{readingText}</Text>
          <mesh 
            position={[0.4, 0.18, 0.01]} 
            onClick={(e) => { e.stopPropagation(); setShowBuretteReading(false); }}
            onPointerOver={() => document.body.style.cursor='pointer'}
            onPointerOut={() => document.body.style.cursor='auto'}
          >
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#ff5555" />
          </mesh>
          <Text position={[0.4, 0.18, 0.02]} fontSize={0.04} color="#fff">X</Text>
        </group>
      )}

      <group position={[0, 1.6, -2]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && "Click Pipette to draw 100mL water sample"}
          {currentStep === 1 && "Click Phenolphthalein dropper to add it to the flask (turns pink)"}
          {currentStep === 2 && !isDripping && "Click Burette Stopcock to titrate with HCl till pink fades"}
          {currentStep === 2 && isDripping && "Titrating... Wait for pink color to disappear"}
          {currentStep === 3 && "Titration 1 complete! Click the Burette to read value P"}
          {currentStep === 4 && "Click Methyl Orange dropper to add indicator (turns yellow)"}
          {currentStep === 5 && !isDripping && "Click Burette Stopcock to continue titration till orange-red"}
          {currentStep === 5 && isDripping && "Titrating... Wait for color change to orange-red"}
          {currentStep === 6 && "Titration 2 complete! Click the Burette to read final value M"}
          {currentStep === 7 && "Titration finished. Open the Lab Notebook to calculate results!"}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp4;
