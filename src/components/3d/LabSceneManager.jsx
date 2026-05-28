import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, ContactShadows } from '@react-three/drei';
import { useExperiment } from '../../context/ExperimentContext';

// Import Chemistry Simulations
import ChemistryExp1 from './simulations/ChemistryExp1';
import ChemistryExp4 from './simulations/ChemistryExp4';
import ChemistryExp5 from './simulations/ChemistryExp5';
import ChemistryExp6 from './simulations/ChemistryExp6';
import ChemistryExp7 from './simulations/ChemistryExp7';
import ChemistryExp8 from './simulations/ChemistryExp8';
import ChemistryExp9 from './simulations/ChemistryExp9';

// Import Physics Simulations
import PhysicsExp1 from './simulations/PhysicsExp1';
import PhysicsExp2 from './simulations/PhysicsExp2';
import PhysicsExp3 from './simulations/PhysicsExp3';
import PhysicsExp4 from './simulations/PhysicsExp4';
import PhysicsExp5 from './simulations/PhysicsExp5';
import PhysicsExp6 from './simulations/PhysicsExp6';
import PhysicsExp7 from './simulations/PhysicsExp7';
import PhysicsExp8 from './simulations/PhysicsExp8';
import PhysicsExp9 from './simulations/PhysicsExp9';

// A realistic wooden lab table (dynamically sized)
const LabBench = ({ length = 2.0, width = 0.9 }) => {
  // Table top surface is exactly at y = -1.0 to align with existing components
  return (
    <group>
      {/* Table Top */}
      <mesh position={[0, -1.025, 0]} receiveShadow>
        <boxGeometry args={[length, 0.05, width]} />
        {/* Varnished Oak/Walnut Finish */}
        <meshStandardMaterial color="#3d2314" roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* Table Legs */}
      {[
        [-length/2 + 0.1, -width/2 + 0.1], 
        [length/2 - 0.1, -width/2 + 0.1], 
        [-length/2 + 0.1, width/2 - 0.1], 
        [length/2 - 0.1, width/2 - 0.1]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.45, z]} receiveShadow castShadow>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#2c170b" roughness={0.6} metalness={0} />
        </mesh>
      ))}
    </group>
  );
};

const SimulationLoader = ({ activeExperiment }) => {
  if (!activeExperiment) return null;
  
  // Map experiment ID to the correct 3D component
  switch(activeExperiment.id) {
    case 'c1': return <ChemistryExp1 />;
    case 'c4': return <ChemistryExp4 />;
    case 'c5': return <ChemistryExp5 />;
    case 'c6': return <ChemistryExp6 />;
    case 'c7': return <ChemistryExp7 />;
    case 'c8': return <ChemistryExp8 />;
    case 'c9': return <ChemistryExp9 />;
    case 'p1': return <PhysicsExp1 />;
    case 'p2': return <PhysicsExp2 />;
    case 'p3': return <PhysicsExp3 />;
    case 'p4': return <PhysicsExp4 />;
    case 'p5': return <PhysicsExp5 />;
    case 'p6': return <PhysicsExp6 />;
    case 'p7': return <PhysicsExp7 />;
    case 'p8': return <PhysicsExp8 />;
    case 'p9': return <PhysicsExp9 />;
    // Other experiments will fall back to a placeholder until built
    default: return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="gray" wireframe />
      </mesh>
    );
  }
};

const Scene = ({ type }) => {
  const { activeExperiment } = useExperiment();
  
  const expId = activeExperiment?.id;
  let tableLength = 5.0;
  let tableWidth = 2.0;

  if (expId) {
    if (expId === 'p1') { tableLength = 6.0; tableWidth = 3.0; }
    else if (expId === 'p3' || expId === 'p4') { tableLength = 6.5; tableWidth = 2.5; }
    else if (expId.startsWith('p')) { tableLength = 5.5; tableWidth = 2.5; }
    else if (expId.startsWith('c')) { tableLength = 5.0; tableWidth = 2.0; }
  }

  return (
    <>
      {/* Deep matte slate blue background */}
      <color attach="background" args={['#1a2a3a']} />
      
      {type === 'chemistry' ? <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} /> : null}
      
      {/* Overhead warm lab lighting (3200K approx) */}
      <ambientLight intensity={0.3} color="#ffe4ce" />
      <directionalLight position={[2, 6, 2]} intensity={1.5} color="#ffd6aa" castShadow shadow-mapSize={[1024, 1024]} />
      
      {/* Soft cool fill light from front */}
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#aaccff" />
      
      <Environment preset="city" />

      <LabBench length={tableLength} width={tableWidth} />
      
      {/* Main Simulation Content */}
      <Suspense fallback={null}>
        <SimulationLoader activeExperiment={activeExperiment} />
      </Suspense>

      {/* Ambient occlusion / soft shadows directly on the table surface (y=-1.0) */}
      <ContactShadows position={[0, -0.99, 0]} opacity={0.6} scale={Math.max(tableLength, tableWidth) + 2} blur={1.5} far={0.5} resolution={1024} />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={0.5} 
        maxDistance={20} 
      />
    </>
  );
};

const LabSceneManager = ({ type }) => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
        <Scene type={type} />
      </Canvas>
    </div>
  );
};

export default LabSceneManager;
