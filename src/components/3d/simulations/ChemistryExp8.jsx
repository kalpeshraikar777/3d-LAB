import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useExperiment } from '../../../context/ExperimentContext';
import { Colorimeter, Cuvette, GraphPanel } from '../apparatus/ApparatusLibrary';
import { Text } from '@react-three/drei';

const standardData = [
  { conc: 0, abs: '0.000', color: '#e0f7fa', label: 'Blank (0 ppm)' },
  { conc: 2, abs: '0.210', color: '#d0f0fd', label: 'Std 2 ppm' },
  { conc: 4, abs: '0.405', color: '#b0e0f5', label: 'Std 4 ppm' },
  { conc: 6, abs: '0.595', color: '#80cff0', label: 'Std 6 ppm' },
  { conc: 8, abs: '0.800', color: '#50beec', label: 'Std 8 ppm' },
  { conc: 10, abs: '0.985', color: '#20ade8', label: 'Std 10 ppm' },
  { conc: 6.2, abs: '0.620', color: '#7bcde8', label: 'E-Waste Sample' } // Unknown
];

const ChemistryExp8 = () => {
  const { currentStep, setCurrentStep, setObservations } = useExperiment();
  
  // Local states
  const [colorimeterOn, setColorimeterOn] = useState(false);
  const [colorimeterChamberOpen, setColorimeterChamberOpen] = useState(false);
  const [colorimeterReading, setColorimeterReading] = useState('---');
  const [measuredCount, setMeasuredCount] = useState(0); // number of standards measured
  const [measuredIndices, setMeasuredIndices] = useState([]); // indices of measured standards
  const [graphPoints, setGraphPoints] = useState([]); // [{x: conc, y: abs}]
  const [activeCuvetteIndex, setActiveCuvetteIndex] = useState(null); // which cuvette is being animated/in chamber
  const [sampleMeasured, setSampleMeasured] = useState(false);

  // Mesh Refs for cuvettes
  const cuvetteRefs = useRef([]);
  const colorimeterRef = useRef();

  // Sounds
  const playSelectSound = () => {
    new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e=>e);
  };
  const playSuccessSound = () => {
    new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e=>e);
  };

  useEffect(() => {
    if (currentStep === 0) {
      setColorimeterOn(false);
      setColorimeterChamberOpen(false);
      setColorimeterReading('---');
      setMeasuredCount(0);
      setMeasuredIndices([]);
      setGraphPoints([]);
      setActiveCuvetteIndex(null);
      setSampleMeasured(false);
    }
  }, [currentStep]);

  // Step 0: Turn on colorimeter
  const handleTurnOnColorimeter = () => {
    if (currentStep !== 0) return;
    playSelectSound();
    setColorimeterOn(true);
    setColorimeterReading('---');
    setCurrentStep(1); // Proceed to blank calibration
  };

  // Run the cuvette analysis animation
  const handleMeasureCuvette = (index) => {
    // Validation based on step
    if (currentStep === 1 && index !== 0) return; // Must blank first
    if (currentStep === 2 && (index === 0 || index === 6)) return; // Measure standards 1-5
    if (currentStep === 3 && index !== 6) return; // Measure e-waste unknown

    if (activeCuvetteIndex !== null) return; // Animation in progress
    playSelectSound();
    setActiveCuvetteIndex(index);

    const cuv = cuvetteRefs.current[index];
    const tl = gsap.timeline();

    // 1. Open chamber
    tl.call(() => setColorimeterChamberOpen(true))
      .to({}, { duration: 0.3 })
      // 2. Lift cuvette and move into colorimeter chamber [0, -0.75, 0] relative to bench
      .to(cuv.position, { y: 0.1, duration: 0.5 })
      .to(cuv.position, { x: 0, y: 0.25, z: 0, duration: 0.8 })
      .to(cuv.position, { y: -0.85, duration: 0.4 }) // Lower into chamber
      // 3. Close chamber
      .call(() => setColorimeterChamberOpen(false))
      .to({}, { duration: 0.5 })
      // 4. Update reading
      .call(() => {
        setColorimeterReading(standardData[index].abs);
        playSuccessSound();

        if (index === 0) {
          // Calibration blank complete
          setObservations({
            '0': { '0': '1', '1': '0.00', '2': '0.000' }
          });
        } else if (index < 6) {
          // Standard complete
          setMeasuredIndices(prev => {
            const next = [...prev, index];
            // Plot point on graph
            const nextPoints = [...graphPoints, { x: standardData[index].conc, y: parseFloat(standardData[index].abs) }];
            setGraphPoints(nextPoints);

            // Populate table
            setObservations(prevObs => ({
              ...prevObs,
              [index]: {
                '0': index + 1,
                '1': standardData[index].conc.toFixed(2),
                '2': standardData[index].abs
              }
            }));

            // If we have measured all 5 standards (indices 1 to 5)
            if (next.length === 5) {
              setCurrentStep(3); // Go to measuring unknown sample
            }
            return next;
          });
        } else {
          // Unknown sample complete
          setSampleMeasured(true);
          // Highlight sample point on graph
          setGraphPoints(prev => [...prev, { x: 6.2, y: 0.620 }]);
          // Fill row 7 of observation table
          setObservations(prevObs => ({
            ...prevObs,
            '6': {
              '0': '7',
              '1': 'Unknown',
              '2': '0.620'
            }
          }));
          setCurrentStep(4); // Titration/Colorimetry finished!
        }
      })
      .to({}, { duration: 1.0 })
      // 5. Open chamber, lift cuvette, return to rack
      .call(() => setColorimeterChamberOpen(true))
      .to({}, { duration: 0.3 })
      .to(cuv.position, { y: 0.25, duration: 0.4 })
      // Calculate slot position in rack: x = -1.2 + index * 0.15
      .to(cuv.position, { x: -1.2 + index * 0.18, y: 0.1, z: 0.6, duration: 0.8 })
      .to(cuv.position, { y: -0.92, duration: 0.4 })
      .call(() => {
        setColorimeterChamberOpen(false);
        setActiveCuvetteIndex(null);
        if (currentStep === 1) {
          setCurrentStep(2); // Blank calibrated, now do standards
        }
      });
  };

  return (
    <group>
      {/* 1. Colorimeter Device */}
      <Colorimeter 
        ref={colorimeterRef}
        position={[0, -0.83, 0]}
        reading={colorimeterReading}
        isOn={colorimeterOn}
        chamberOpen={colorimeterChamberOpen}
        isGlowing={currentStep === 0}
        onClick={handleTurnOnColorimeter}
      />

      {/* 2. Cuvette rack with 7 Cuvettes */}
      {standardData.map((data, idx) => {
        const xPos = -1.2 + idx * 0.18;
        const isGlowing = (currentStep === 1 && idx === 0) || 
                          (currentStep === 2 && idx > 0 && idx < 6 && !measuredIndices.includes(idx)) || 
                          (currentStep === 3 && idx === 6);
        return (
          <group 
            key={idx}
            ref={el => cuvetteRefs.current[idx] = el}
            position={[xPos, -0.92, 0.6]}
          >
            <Cuvette 
              liquidColor={data.color}
              liquidLevel={0.8}
              isGlowing={isGlowing}
              labelText={`${data.conc}ppm`}
              onClick={() => handleMeasureCuvette(idx)}
            />
          </group>
        );
      })}

      {/* 3. Calibration Curve Display Panel */}
      <GraphPanel 
        position={[0, 0.8, -1.8]}
        title="Colorimeter Calibration Curve"
        xLabel="Concentration of Cu2+ (ppm)"
        yLabel="Absorbance (A)"
        dataPoints={graphPoints}
        xRange={[0, 12]}
        yRange={[0, 1.2]}
      />

      {/* Helper text display based on state */}
      <group position={[0, 1.6, -2]}>
        <Text fontSize={0.08} color="#00ffcc" anchorX="center">
          {currentStep === 0 && "Click the Colorimeter power button to turn it on (filter set to 620 nm)"}
          {currentStep === 1 && "Click the Blank cuvette (0 ppm) to calibrate the colorimeter"}
          {currentStep === 2 && `Measured standard solutions (${measuredIndices.length}/5). Click any glowing cuvette to insert`}
          {currentStep === 3 && "Standards complete! Click the deep blue E-Waste Sample cuvette to measure its concentration"}
          {currentStep === 4 && "Colorimetry finished! Click on the Lab Notebook to view results and interpolate concentration."}
        </Text>
      </group>
    </group>
  );
};

export default ChemistryExp8;
