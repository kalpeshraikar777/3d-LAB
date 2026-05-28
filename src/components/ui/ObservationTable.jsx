import React, { useState, useEffect } from 'react';
import './ObservationTable.css';
import { useExperiment } from '../../context/ExperimentContext';

const ObservationTable = ({ tableData, onCalculate }) => {
  const { observations, setObservations } = useExperiment();
  
  // Initialize rows if not present
  useEffect(() => {
    if (Object.keys(observations).length === 0 && tableData.rows) {
      const initial = {};
      for (let i = 0; i < tableData.rows; i++) {
        initial[i] = {};
        tableData.headers.forEach((h, j) => {
          if (j === 0) initial[i][j] = i + 1; // S.No
          else initial[i][j] = ''; // empty values
        });
      }
      setObservations(initial);
    }
  }, [tableData, observations, setObservations]);

  const handleChange = (rowIndex, colIndex, value) => {
    const updated = {
      ...observations,
      [rowIndex]: {
        ...observations[rowIndex],
        [colIndex]: value
      }
    };
    setObservations(updated);
  };

  const handleCalculate = () => {
    if (onCalculate) {
      onCalculate(observations);
    }
  };

  if (!tableData || Object.keys(observations).length === 0) return <div>Loading table...</div>;

  return (
    <div className="observation-table-container">
      <table className="observation-table">
        <thead>
          <tr>
            {tableData.headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(observations).map((rowIndex) => (
            <tr key={rowIndex}>
              {tableData.headers.map((_, colIndex) => (
                <td key={colIndex}>
                  {colIndex === 0 ? (
                    observations[rowIndex][colIndex] // S.No is read-only
                  ) : (
                    <input 
                      type="number"
                      step="any"
                      value={observations[rowIndex][colIndex]}
                      onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <button className="btn btn-calculate" onClick={handleCalculate}>
        CALCULATE RESULT
      </button>
    </div>
  );
};

export default ObservationTable;
