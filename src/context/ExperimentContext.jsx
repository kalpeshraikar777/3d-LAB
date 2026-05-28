import React, { createContext, useState, useContext } from 'react';

const ExperimentContext = createContext();

export const useExperiment = () => useContext(ExperimentContext);

export const ExperimentProvider = ({ children }) => {
  const [activeExperiment, setActiveExperiment] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [observations, setObservations] = useState({});
  const [results, setResults] = useState(null);
  const [completedExperiments, setCompletedExperiments] = useState([]);
  const [activeTab, setActiveTab] = useState('theory'); // theory, procedure, observation, result

  const value = {
    activeExperiment,
    setActiveExperiment,
    currentStep,
    setCurrentStep,
    observations,
    setObservations,
    results,
    setResults,
    completedExperiments,
    setCompletedExperiments,
    activeTab,
    setActiveTab
  };

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
};
