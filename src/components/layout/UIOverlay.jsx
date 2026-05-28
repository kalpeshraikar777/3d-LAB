import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../context/ExperimentContext';
import './UIOverlay.css';
import { Home, Lightbulb, BookOpen, ListOrdered, Table2, ShieldCheck, X, Book } from 'lucide-react';
import { BlockMath } from 'react-katex';
import { chemistryExperiments } from '../../experiments/chemistry';
import { physicsExperiments } from '../../experiments/physics';
import ObservationTable from '../ui/ObservationTable';

const UIOverlay = ({ type }) => {
  const navigate = useNavigate();
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const { activeExperiment, setActiveExperiment, activeTab, setActiveTab, observations, completedExperiments, setCompletedExperiments, currentStep, setCurrentStep } = useExperiment();

  const experiments = type === 'chemistry' ? chemistryExperiments : physicsExperiments;

  return (
    <div className="ui-overlay">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="btn btn-home" onClick={() => navigate('/')}>
            <Home size={18} /> MENU
          </button>
          <h3 className="orbitron glow-text lab-title">
            {type === 'chemistry' ? '🧪 Chemistry Lab' : '⚡ Physics Lab'}
          </h3>
        </div>
        
        <div className="experiment-list">
          <h4 className="list-title">Experiments</h4>
          {experiments.map(exp => (
            <button 
              key={exp.id} 
              className={`exp-btn ${activeExperiment?.id === exp.id ? 'active' : ''} ${completedExperiments.includes(exp.id) ? 'completed' : ''}`}
              onClick={() => {
                setActiveExperiment(exp);
                setCurrentStep(0); // Reset step when switching experiments
                setIsNotebookOpen(true); // Open notebook when selecting new experiment
                // Play a subtle click sound
                new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3').play().catch(e=>e);
              }}
            >
              {completedExperiments.includes(exp.id) ? '✅ ' : ''}{exp.title}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Notebook Button (Visible when notebook is closed) */}
      {activeExperiment && !isNotebookOpen && (
        <button 
          className="floating-notebook-btn orbitron glow-text"
          onClick={() => setIsNotebookOpen(true)}
        >
          <Book size={20} /> LAB NOTEBOOK
        </button>
      )}

      {/* Main Content Area (Tabs) - Modal View */}
      {activeExperiment && isNotebookOpen && (
        <div className="experiment-panel-modal">
          <div className="panel-header">
            <h2 className="orbitron">{activeExperiment.title}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="hint-btn" title="Get Hint">
                <Lightbulb size={20} />
              </button>
              <button className="hint-btn" style={{ color: '#fff', borderColor: '#fff' }} onClick={() => setIsNotebookOpen(false)} title="Close Notebook">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="tab-navigation">
            <button className={`tab-btn ${activeTab === 'theory' ? 'active' : ''}`} onClick={() => setActiveTab('theory')}>
              <BookOpen size={16} /> THEORY
            </button>
            <button className={`tab-btn ${activeTab === 'procedure' ? 'active' : ''}`} onClick={() => setActiveTab('procedure')}>
              <ListOrdered size={16} /> PROCEDURE
            </button>
            <button className={`tab-btn ${activeTab === 'observation' ? 'active' : ''}`} onClick={() => setActiveTab('observation')}>
              <Table2 size={16} /> OBSERVATIONS
            </button>
            <button className={`tab-btn ${activeTab === 'result' ? 'active' : ''}`} onClick={() => setActiveTab('result')}>
              <ShieldCheck size={16} /> RESULT
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'theory' && (
              <div className="tab-pane">
                <h4 style={{ color: 'var(--accent-orange)' }}>AIM</h4>
                <p>{activeExperiment.aim}</p>
                <br/>
                <h4 style={{ color: 'var(--accent-orange)' }}>APPARATUS / CHEMICALS</h4>
                <p>{activeExperiment.apparatus}</p>
                <br/>
                <h4 style={{ color: 'var(--accent-orange)' }}>THEORY</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{activeExperiment.theory}</p>
              </div>
            )}
            
            {activeTab === 'procedure' && (
              <div className="tab-pane">
                <h4 style={{ color: 'var(--accent-orange)' }}>PROCEDURE</h4>
                <ol style={{ paddingLeft: '20px' }}>
                  {activeExperiment.procedure?.map((step, idx) => (
                    <li 
                      key={idx} 
                      style={{ 
                        marginBottom: '10px', 
                        opacity: idx > currentStep ? 0.3 : 1,
                        color: idx === currentStep ? 'var(--accent-cyan)' : 'inherit',
                        transition: 'all 0.3s'
                      }}
                    >
                      {step}
                      {idx === currentStep && <span style={{ marginLeft: '10px' }}>👈</span>}
                      {idx < currentStep && <span style={{ marginLeft: '10px' }}>✅</span>}
                    </li>
                  ))}
                </ol>
                {currentStep >= (activeExperiment.procedure?.length || 0) && (
                  <div className="glow-text" style={{ textAlign: 'center', marginTop: '15px', color: 'var(--accent-cyan)' }}>
                    Procedure Completed! Proceed to Observations.
                  </div>
                )}
                {currentStep < (activeExperiment.procedure?.length || 0) && (
                  <div style={{ textAlign: 'center', marginTop: '15px', fontStyle: 'italic', color: '#ff6b35' }}>
                    * Interact with the 3D objects in the lab to perform the highlighted step. *
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'observation' && (
              <div className="tab-pane">
                <h4 style={{ color: 'var(--accent-orange)' }}>OBSERVATIONS</h4>
                {activeExperiment.observationTable ? (
                  <ObservationTable 
                    tableData={activeExperiment.observationTable} 
                    onCalculate={() => setActiveTab('result')}
                  />
                ) : (
                  <p>No observation table required for this experiment.</p>
                )}
              </div>
            )}
            
            {activeTab === 'result' && (
              <div className="tab-pane">
                <h4 style={{ color: 'var(--accent-orange)' }}>FORMULAE</h4>
                {activeExperiment.formulae?.map((form, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', margin: '10px 0' }}>
                    {/* Render raw string if it's just text, otherwise KaTeX */}
                    {form.includes('\\') ? <BlockMath math={form} /> : <p style={{ textAlign: 'center' }}>{form}</p>}
                  </div>
                ))}
                
                <h4 style={{ color: 'var(--accent-orange)', marginTop: '20px' }}>FINAL RESULT</h4>
                <div style={{ background: 'rgba(0, 255, 204, 0.1)', border: '1px solid var(--accent-cyan)', padding: '20px', borderRadius: '8px', textAlign: 'center', marginTop: '10px' }}>
                  {activeExperiment.calculateResult ? (
                    (() => {
                      const res = activeExperiment.calculateResult(observations);
                      if (res.error) return <p className="glow-orange">{res.error}</p>;
                      
                      // Auto-mark as completed if successful
                      if (!completedExperiments.includes(activeExperiment.id)) {
                        setTimeout(() => setCompletedExperiments(prev => [...prev, activeExperiment.id]), 100);
                        // Play completion sound
                        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e=>e);
                      }

                      return (
                        <>
                          <div className="result-badge orbitron glow-text">COMPLETED! 🏆</div>
                          <p className="glow-text" style={{ whiteSpace: 'pre-line', fontSize: '1.2rem', marginTop: '15px' }}>{res.text}</p>
                        </>
                      );
                    })()
                  ) : (
                    <p className="glow-text">Complete the observations to see the result!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
