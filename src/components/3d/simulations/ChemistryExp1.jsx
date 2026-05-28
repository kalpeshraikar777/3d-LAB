import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { 
  Burette, BuretteStand, ConicalFlask, Beaker, Pipette, ReagentBottle, 
  Dropper, WashBottle, WeighingBalance, WatchGlass, Spatula, 
  WhiteTile, VolumetricFlask, Funnel, Droplet, RecordButton
} from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const ChemistryExp1 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();
  
  // Local states for custom detailed sequence
  const [subStep, setSubStep] = useState(0); // For multi-part steps
  const [balanceOn, setBalanceOn] = useState(false);
  const [balanceReading, setBalanceReading] = useState('0.000');
  const [watchGlassOnBalance, setWatchGlassOnBalance] = useState(false);
  const [watchGlassHasPowder, setWatchGlassHasPowder] = useState(false);
  const [volFlaskLiquidLevel, setVolFlaskLiquidLevel] = useState(0);
  const [volFlaskHasPowder, setVolFlaskHasPowder] = useState(false);
  const [pipetteLiquidLevel, setPipetteLiquidLevel] = useState(0);
  const [conicalFlaskLiquidLevel, setConicalFlaskLiquidLevel] = useState(0);
  const [conicalFlaskLiquidColor, setConicalFlaskLiquidColor] = useState('#ffffff');
  const [conicalFlaskHasBuffer, setConicalFlaskHasBuffer] = useState(false);
  const [conicalFlaskHasEBT, setConicalFlaskHasEBT] = useState(false);
  const [buretteFillLevel, setBuretteFillLevel] = useState(0);
  const [isDripping, setIsDripping] = useState(false);
  const [isSwirling, setIsSwirling] = useState(false);
  const [showBuretteReading, setShowBuretteReading] = useState(false);
  const [dropY, setDropY] = useState(0.1);

  // Mesh Refs for animating
  const pipetteRef = useRef();
  const watchGlassRef = useRef();
  const spatulaRef = useRef();
  const washBottleRef = useRef();
  const volFlaskRef = useRef();
  const funnelRef = useRef();
  const bufferRef = useRef();
  const ebtRef = useRef();
  const conicalFlaskRef = useRef();
  const edtaBottleRef = useRef();

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

  // Reset local state if step is 0 (restart)
  useEffect(() => {
    if (currentStep === 0) {
      setSubStep(0);
      setBalanceOn(false);
      setBalanceReading('0.000');
      setWatchGlassOnBalance(false);
      setWatchGlassHasPowder(false);
      setVolFlaskLiquidLevel(0);
      setVolFlaskHasPowder(false);
      setPipetteLiquidLevel(0);
      setConicalFlaskLiquidLevel(0);
      setConicalFlaskLiquidColor('#ffffff');
      setConicalFlaskHasBuffer(false);
      setConicalFlaskHasEBT(false);
      setBuretteFillLevel(0);
      setIsDripping(false);
      setIsSwirling(false);
      setShowBuretteReading(false);
    }
  }, [currentStep]);

  // Swirling animation
  useFrame((state, delta) => {
    if (isSwirling && conicalFlaskRef.current) {
      const t = state.clock.getElapsedTime();
      conicalFlaskRef.current.position.x = -0.7 + Math.sin(t * 15) * 0.05;
      conicalFlaskRef.current.position.z = Math.cos(t * 15) * 0.05;
    }
  });

  // Titration dripping and endpoint logic
  useFrame((state, delta) => {
    if (isDripping && currentStep === 4) {
      // Animate falling drop
      setDropY(prev => {
        let next = prev - delta * 2;
        if(next < -0.8) return 0.1;
        return next;
      });

      setBuretteFillLevel(prev => {
        const next = prev - delta * 0.05; // speed of drip
        const volAdded = (1.0 - next) * 50.0;
        
        // Color transition
        if (conicalFlaskHasEBT) {
          if (volAdded >= 28.5) {
            setConicalFlaskLiquidColor('#0064ff'); // Sharp blue!
            if (prev > 0.43) { // Trigger endpoint once
              setIsDripping(false);
              setIsSwirling(false);
              playSuccessSound();
              setCurrentStep(5);
            }
          } else {
            // Lerp from wine-red to pale pink
            const progress = Math.min(volAdded / 28.0, 1.0);
            const c1 = new THREE.Color('#8b008b');
            const c2 = new THREE.Color('#ffb6c1');
            c1.lerp(c2, progress);
            setConicalFlaskLiquidColor('#' + c1.getHexString());
          }
        }
        return Math.max(next, 0);
      });
      // Gently increase volume in flask
      setConicalFlaskLiquidLevel(prev => Math.min(prev + delta * 0.01, 0.45));
    }
  });

  // Animations using GSAP
  const handlePipetteWater = () => {
    if (currentStep !== 0) return;
    playSelectSound();

    const pipette = pipetteRef.current;
    const tl = gsap.timeline();

    // 1. Lift pipette and move over Hard Water Beaker
    tl.to(pipette.position, { y: -0.5, duration: 0.8 })
      .to(pipette.rotation, { z: 0, duration: 0.4 })
      .to(pipette.position, { x: -1.5, y: -0.6, z: 0.5, duration: 1 })
      // 2. Dip into water and fill
      .to(pipette.position, { y: -0.85, duration: 0.5 })
      .call(() => {
        playPourSound();
        setPipetteLiquidLevel(1.0);
      })
      .to({}, { duration: 1.0 }) // wait to fill
      // 3. Lift pipette and move over Conical Flask
      .to(pipette.position, { y: -0.4, duration: 0.8 })
      .to(pipette.position, { x: -0.7, y: -0.2, z: 0.0, duration: 1 })
      // 4. Dip into conical flask and release
      .to(pipette.position, { y: -0.4, duration: 0.5 })
      .call(() => {
        playPourSound();
        setPipetteLiquidLevel(0);
        setConicalFlaskLiquidLevel(0.25);
        setConicalFlaskLiquidColor('#d0f4de'); // light clear water
      })
      .to({}, { duration: 1.0 })
      // 5. Move back to initial resting position
      .to(pipette.position, { y: -0.5, duration: 0.5 })
      .to(pipette.position, { x: -2.0, y: -0.98, z: 0.2, duration: 1 })
      .to(pipette.rotation, { z: Math.PI/2, duration: 0.4 })
      .call(() => {
        setCurrentStep(1); // Next Step
      });
  };

  const handleAddBuffer = () => {
    if (currentStep !== 1) return;
    playSelectSound();

    const buffer = bufferRef.current;
    const tl = gsap.timeline();

    // Lift bottle, tip over Conical Flask, pour and return
    tl.to(buffer.position, { y: -0.4, duration: 0.6 })
      .to(buffer.position, { x: -0.3, y: -0.85, z: 0.1, duration: 1 })
      .to(buffer.rotation, { z: -Math.PI / 3, duration: 0.5 })
      .call(() => {
        playPourSound();
        setConicalFlaskLiquidLevel(0.3); // level increases slightly
        setConicalFlaskHasBuffer(true);
      })
      .to({}, { duration: 1.0 })
      .to(buffer.rotation, { z: 0, duration: 0.5 })
      .to(buffer.position, { x: 0.0, y: -1.0, z: 0.5, duration: 1 })
      .call(() => {
        setCurrentStep(2);
      });
  };

  const handleAddEBT = () => {
    if (currentStep !== 2) return;
    playSelectSound();

    const ebt = ebtRef.current;
    const tl = gsap.timeline();

    // Lift dropper, squeeze over Conical Flask, change color to wine-red
    tl.to(ebt.position, { y: -0.4, duration: 0.6 })
      .to(ebt.position, { x: -0.7, y: -0.5, z: 0.0, duration: 1 })
      .to(ebt.rotation, { x: Math.PI / 6, duration: 0.4 })
      .call(() => {
        playPourSound();
        setConicalFlaskLiquidColor('#aa0044'); // Wine red
        setConicalFlaskHasEBT(true);
      })
      .to({}, { duration: 0.8 })
      .to(ebt.rotation, { x: 0, duration: 0.4 })
      .to(ebt.position, { x: 0.6, y: -1.0, z: 0.0, duration: 1 })
      .call(() => {
        setCurrentStep(3); // Now we prepare standard EDTA and fill burette
      });
  };

  // Sub-steps for EDTA prep & burette fill (currentStep === 3)
  const handleWeightBalancePower = () => {
    if (currentStep !== 3 || subStep !== 0) return;
    playSelectSound();
    setBalanceOn(true);
    setSubStep(1); // Prompt to place watch glass
  };

  const handlePlaceWatchGlass = () => {
    if (currentStep !== 3 || subStep !== 1) return;
    playSelectSound();

    const glass = watchGlassRef.current;
    const tl = gsap.timeline();

    tl.to(glass.position, { y: -0.5, duration: 0.5 })
      .to(glass.position, { x: 1.2, y: -0.92, z: 0.5, duration: 0.8 })
      .call(() => {
        setWatchGlassOnBalance(true);
        setBalanceReading('12.450'); // weight of glass
        setSubStep(2); // Prompt to weigh EDTA using spatula
      });
  };

  const handleSpatulaEDTA = () => {
    if (currentStep !== 3 || subStep !== 2) return;
    playSelectSound();

    const spatula = spatulaRef.current;
    const tl = gsap.timeline();

    // 1. Move spatula to EDTA bottle and scoop
    tl.to(spatula.position, { y: -0.5, duration: 0.5 })
      .to(spatula.position, { x: 0.6, y: -0.6, z: 0.5, duration: 0.8 })
      .to(spatula.rotation, { x: 0.2, duration: 0.3 })
      .to(spatula.position, { y: -0.8, duration: 0.4 })
      .to(spatula.position, { y: -0.5, duration: 0.4 })
      // 2. Move to watch glass and dump
      .to(spatula.position, { x: 1.2, y: -0.75, z: 0.5, duration: 0.8 })
      .to(spatula.rotation, { y: Math.PI / 4, z: -0.2, duration: 0.4 })
      .call(() => {
        setWatchGlassHasPowder(true);
        setBalanceReading('13.380'); // Glass + 0.930g EDTA
        playSelectSound();
      })
      .to({}, { duration: 0.5 })
      // 3. Return spatula
      .to(spatula.rotation, { x: 0, y: 0, z: 0, duration: 0.4 })
      .to(spatula.position, { x: 1.8, y: -1.0, z: 0.3, duration: 0.8 })
      .call(() => {
        setSubStep(3); // Prompt to transfer to volumetric flask
      });
  };

  const handleTransferToFlask = () => {
    if (currentStep !== 3 || subStep !== 3) return;
    playSelectSound();

    const glass = watchGlassRef.current;
    const tl = gsap.timeline();

    // Move watch glass to volumetric flask, tip, empty and return
    tl.to(glass.position, { y: -0.5, duration: 0.5 })
      .to(glass.position, { x: 0.0, y: -0.1, z: -0.5, duration: 0.8 })
      .to(glass.rotation, { z: -Math.PI / 2.5, duration: 0.5 })
      .call(() => {
        setWatchGlassHasPowder(false);
        setVolFlaskHasPowder(true);
        setBalanceReading('12.450'); // watch glass empty
      })
      .to({}, { duration: 0.5 })
      .to(glass.rotation, { z: 0, duration: 0.4 })
      .to(glass.position, { x: 1.8, y: -1.0, z: 0.0, duration: 0.8 })
      .call(() => {
        setSubStep(4); // Prompt to dissolve with wash bottle
      });
  };

  const handleDissolveEDTA = () => {
    if (currentStep !== 3 || subStep !== 4) return;
    playSelectSound();

    const wash = washBottleRef.current;
    const tl = gsap.timeline();

    // Move wash bottle to Vol flask, spray, and return
    tl.to(wash.position, { y: -0.4, duration: 0.5 })
      .to(wash.position, { x: -0.65, y: -0.8, z: -0.5, duration: 0.8 })
      .to(wash.rotation, { z: -Math.PI / 4, duration: 0.4 })
      .call(() => {
        playPourSound();
      })
      .to({}, { duration: 1.0 })
      .call(() => {
        setVolFlaskLiquidLevel(1.0); // Filled with liquid
        setVolFlaskHasPowder(false); // Dissolved
      })
      .to(wash.rotation, { z: 0, duration: 0.4 })
      .to(wash.position, { x: 0.6, y: -1.0, z: -0.5, duration: 0.8 })
      .call(() => {
        setSubStep(5); // Prompt to insert funnel
      });
  };

  const handleInsertFunnel = () => {
    if (currentStep !== 3 || subStep !== 5) return;
    playSelectSound();

    const funnel = funnelRef.current;
    const tl = gsap.timeline();

    tl.to(funnel.position, { y: 0.5, duration: 0.5 })
      .to(funnel.position, { x: -0.7, y: 1.25, z: 0.0, duration: 0.8 })
      .call(() => {
        setSubStep(6); // Prompt to pour Vol flask into burette
      });
  };

  const handlePourEDTAIntoBurette = () => {
    if (currentStep !== 3 || subStep !== 6) return;
    playSelectSound();

    const volFlask = volFlaskRef.current;
    const funnel = funnelRef.current;
    const tl = gsap.timeline();

    // Move volumetric flask to top of burette, tilt, fill burette, return
    tl.to(volFlask.position, { y: 0.8, duration: 0.6 })
      .to(volFlask.position, { x: -1.6, y: 1.0, z: 0.0, duration: 1.0 })
      .to(volFlask.rotation, { z: -Math.PI / 2.2, duration: 0.6 })
      .call(() => {
        playPourSound();
      })
      .to({}, { duration: 1.5 })
      .call(() => {
        setBuretteFillLevel(1.0); // Filled
        setVolFlaskLiquidLevel(0); // Empty
      })
      .to(volFlask.rotation, { z: 0, duration: 0.5 })
      .to(volFlask.position, { x: 0.0, y: -1.0, z: -0.5, duration: 1.0 })
      // Funnel back too
      .to(funnel.position, { y: 0.5, duration: 0.5 })
      .to(funnel.position, { x: -0.3, y: -1.0, z: -0.5, duration: 0.8 })
      .call(() => {
        // Complete the fill burette step!
        setCurrentStep(4); 
        setSubStep(0);
      });
  };

  const handleStopcockDown = () => {
    if (currentStep !== 4) return;
    setIsDripping(true);
    setIsSwirling(true);
  };

  const handleStopcockUp = () => {
    if (currentStep !== 4) return;
    setIsDripping(false);
    setIsSwirling(false);
  };

  const handleStopcockClick = () => {
    if (currentStep !== 4) return;
    playSelectSound();
    // Simulate single drop
    setIsDripping(true);
    setIsSwirling(true);
    setTimeout(() => {
      setIsDripping(false);
      setIsSwirling(false);
    }, 150);
  };

  const handleZoomBurette = () => {
    if (currentStep !== 6) return;
    playSelectSound();
    setShowBuretteReading(true);
  };

  const handleRecord = () => {
    if (currentStep === 6 && showBuretteReading) {
      playSuccessSound();
      setObservations(prev => ({
        ...prev,
        '0': { '0': '1', '1': '0.00', '2': '28.50', '3': '28.50' }
      }));
      setCurrentStep(7);
    }
  };

  const handleBuretteClick = () => {
    if (currentStep === 6) {
      handleZoomBurette();
    }
  };

  const handleConicalFlaskClick = () => {
    if (currentStep === 5) {
      // Step 5: Stop when color changes. Since they are stopped, let's complete it.
      playSuccessSound();
      setCurrentStep(6);
    }
  };

  return (
    <group>
      {/* 1. Burette Stand & White Tile */}
      <BuretteStand position={[-0.5, -1.0, 0]} label={false} />
      <WhiteTile position={[-0.7, -1.0, 0]} />

      {/* 2. Burette (placed above white tile on stand) */}
      <Burette 
        ref={null} 
        position={[-0.7, -0.2, 0]} 
        fillLevel={buretteFillLevel}
        liquidColor="#e8ffff"
        stopcockGlowing={currentStep === 4}
        onStopcockClick={handleStopcockClick}
        onStopcockDown={handleStopcockDown}
        onStopcockUp={handleStopcockUp}
        onClick={handleBuretteClick}
      />

      {/* 3. Conical Flask (stands on white tile) */}
      <ConicalFlask 
        ref={conicalFlaskRef}
        position={[-0.7, -1.0, 0]}
        liquidColor={conicalFlaskLiquidColor}
        liquidLevel={conicalFlaskLiquidLevel}
        isGlowing={currentStep === 5}
        onClick={handleConicalFlaskClick}
        showLabel="Titration Flask"
      />

      {/* 4. Weighing Balance */}
      <WeighingBalance 
        position={[1.2, -1.0, 0.5]}
        reading={balanceReading}
        isOn={balanceOn}
        isGlowing={currentStep === 3 && subStep === 0}
        onClick={handleWeightBalancePower}
      />

      {/* 5. Watch Glass */}
      <WatchGlass 
        ref={watchGlassRef}
        position={watchGlassOnBalance ? [1.2, -0.92, 0.5] : [1.8, -1.0, 0.0]}
        hasPowder={watchGlassHasPowder}
        isGlowing={currentStep === 3 && (subStep === 1 || subStep === 3)}
        onClick={subStep === 1 ? handlePlaceWatchGlass : handleTransferToFlask}
      />

      {/* 6. Spatula */}
      <Spatula 
        ref={spatulaRef}
        position={[1.8, -1.0, 0.3]}
        isGlowing={currentStep === 3 && subStep === 2}
        onClick={handleSpatulaEDTA}
      />

      {/* 7. Reagent Bottle: EDTA Salt */}
      <ReagentBottle 
        ref={edtaBottleRef}
        position={[1.2, -1.0, -0.1]}
        labelText="EDTA Salt"
        liquidColor="#f0f0f0"
        isGlowing={false}
      />

      {/* 8. Volumetric Flask */}
      <VolumetricFlask 
        ref={volFlaskRef}
        position={[0.0, -1.0, -0.5]}
        liquidLevel={volFlaskLiquidLevel}
        liquidColor="#e8ffff"
        isGlowing={currentStep === 3 && subStep === 6}
        onClick={handlePourEDTAIntoBurette}
      />

      {/* 9. Wash Bottle */}
      <WashBottle 
        ref={washBottleRef}
        position={[0.6, -1.0, -0.5]}
        isGlowing={currentStep === 3 && subStep === 4}
        onClick={handleDissolveEDTA}
      />

      {/* 10. Funnel */}
      <Funnel 
        ref={funnelRef}
        position={[-0.3, -1.0, -0.5]}
        isGlowing={currentStep === 3 && subStep === 5}
        onClick={handleInsertFunnel}
      />

      {/* 11. Beaker with Hard Water */}
      <Beaker 
        position={[-1.5, -1.0, 0.5]}
        liquidColor="#e8ffff"
        liquidLevel={0.8}
        showLabel="Hard Water"
        isGlowing={false}
      />

      {/* 12. Pipette */}
      <Pipette 
        ref={pipetteRef}
        position={[-2.0, -0.98, 0.2]}
        isGlowing={currentStep === 0}
        onClick={handlePipetteWater}
        fillLevel={pipetteLiquidLevel}
      />

      {/* 13. Reagent Bottle: Buffer pH 10 */}
      <ReagentBottle 
        ref={bufferRef}
        position={[0.0, -1.0, 0.5]}
        labelText="Buffer pH 10"
        liquidColor="#aaffaa"
        isGlowing={currentStep === 1}
        onClick={handleAddBuffer}
      />

      {/* 14. Dropper: EBT Indicator */}
      <Dropper 
        ref={ebtRef}
        position={[0.6, -1.0, 0.0]}
        labelText="EBT"
        liquidColor="#aa0044"
        isGlowing={currentStep === 2}
        onClick={handleAddEBT}
      />

      {/* Dripping particles during titration */}
      {isDripping && (
        <Droplet position={[-0.7, dropY, 0]} color="#e8ffff" scale={1.2} />
      )}

      {/* Record Button */}
      <RecordButton 
        position={[-1.2, -1.0, -0.3]} 
        onClick={handleRecord} 
        isGlowing={currentStep === 6 && showBuretteReading} 
      />

      {/* Zoomed-in Burette Reading HUD */}
      {showBuretteReading && (
        <group position={[-0.7, 1.0, 0.5]}>
          <mesh>
            <planeGeometry args={[1.0, 0.5]} />
            <meshBasicMaterial color="#111" transparent opacity={0.9} />
          </mesh>
          <Text position={[0, 0.1, 0.01]} fontSize={0.05} color="#00ffcc">Burette scale</Text>
          <Text position={[0, -0.1, 0.01]} fontSize={0.06} color="#fff">28.50 mL</Text>
          {/* Close button */}
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

      {/* Helper text display based on state */}
      <group position={[0, 1.6, -2]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && "Click the Pipette to draw 25mL water sample"}
          {currentStep === 1 && "Click the Buffer bottle (pH 10) to add it to the flask"}
          {currentStep === 2 && "Click the EBT Dropper to add indicator to the flask"}
          {currentStep === 3 && subStep === 0 && "EDTA Standard Prep: Click weighing balance power"}
          {currentStep === 3 && subStep === 1 && "Click watch glass to place it on the balance"}
          {currentStep === 3 && subStep === 2 && "Click spatula to scoop EDTA salt onto the watch glass"}
          {currentStep === 3 && subStep === 3 && "Click watch glass to transfer EDTA to volumetric flask"}
          {currentStep === 3 && subStep === 4 && "Click wash bottle to dissolve EDTA in volumetric flask"}
          {currentStep === 3 && subStep === 5 && "Click funnel to place it in the burette top"}
          {currentStep === 3 && subStep === 6 && "Click volumetric flask to pour EDTA into burette"}
          {currentStep === 4 && !isDripping && "Click the Burette Stopcock to start titration"}
          {currentStep === 4 && isDripping && "Titrating... Wait for the wine-red color to change to blue"}
          {currentStep === 5 && "Titration finished! Click Conical Flask to confirm endpoint"}
          {currentStep === 6 && !showBuretteReading && "Click the Burette to read the scale"}
          {currentStep === 6 && showBuretteReading && "Reading noted. Open the Lab Notebook to enter observations!"}
          {currentStep === 7 && "Trial complete! Record concordant values in the Notebook."}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp1;
