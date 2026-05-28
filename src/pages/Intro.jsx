import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Intro.css';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <div className="background-animation">
        {/* Placeholder for CSS/Canvas animated background */}
        <div className="particles"></div>
      </div>
      
      <div className="content">
        <h1 className="title glow-text orbitron">VirtualLab 3D</h1>
        <p className="subtitle glow-orange orbitron">Your Interactive Science Laboratory</p>
        
        <div className="lab-doors">
          <button 
            className="door-btn chem-door btn"
            onClick={() => navigate('/lab/chemistry')}
          >
            <span className="icon">🧪</span>
            CHEMISTRY LAB
          </button>
          
          <button 
            className="door-btn phys-door btn btn-orange"
            onClick={() => navigate('/lab/physics')}
          >
            <span className="icon">⚡</span>
            PHYSICS LAB
          </button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
