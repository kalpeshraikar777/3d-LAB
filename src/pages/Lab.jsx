import React from 'react';
import { useParams } from 'react-router-dom';
import { ExperimentProvider } from '../context/ExperimentContext';
import UIOverlay from '../components/layout/UIOverlay';
import LabSceneManager from '../components/3d/LabSceneManager';

const Lab = () => {
  const { type } = useParams(); // 'chemistry' or 'physics'

  return (
    <ExperimentProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg-color)' }}>
        
        {/* 3D Background/Interactive Layer */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <LabSceneManager type={type} />
        </div>

        {/* 2D UI Overlay (Toggleable Notebook) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          <UIOverlay type={type} />
        </div>
        
      </div>
    </ExperimentProvider>
  );
};

export default Lab;
