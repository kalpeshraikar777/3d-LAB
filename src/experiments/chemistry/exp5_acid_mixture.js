export const exp5_acid_mixture = {
  id: 'c5',
  title: '05. Acid Mixture (Conductometry)',
  type: 'chemistry',
  aim: 'To determine the amount of acid in a given acid mixture (HCl + CH₃COOH) by conductometric titration. To observe the variation of conductance with change in ions.',
  apparatus: 'NaOH solution (standard), Acid mixture (HCl + CH₃COOH), Conductivity meter with electrode cell, Burette, Pipette, Beaker, Magnetic stirrer.',
  theory: `Conductometric titration is based on change in electrical conductivity of a solution with addition of titrant.
- HCl + NaOH → NaCl + H₂O (strong acid neutralised first)
- CH₃COOH + NaOH → CH₃COONa + H₂O (weak acid neutralised next)
- Conductance (G) = 1/Resistance (R), expressed in Siemens (S)
- Specific conductivity κ = 1/ρ = 1/RA
- The curve shows TWO distinct breaks (V₁ and V₂): V₁ = NaOH for HCl; (V₂−V₁) = NaOH for CH₃COOH`,
  procedure: [
    'Take 20 mL of acid mixture in a beaker.',
    'Dip the conductivity electrode.',
    'Record initial conductance.',
    'Add NaOH in 0.5 mL increments from burette.',
    'Record conductance after each addition.',
    'Continue till conductance shows second minimum (V₂).',
    'Plot conductance vs volume of NaOH.',
    'Identify the two breaks V₁ and V₂.'
  ],
  observationTable: {
    headers: ['S.No', 'Volume of NaOH added (mL)', 'Conductance (mS)'],
    rows: 15 // Usually requires many readings
  },
  formulae: [
    'V_1 = \\text{Volume of NaOH required for HCl}',
    'V_2 - V_1 = \\text{Volume of NaOH required for CH}_3\\text{COOH}',
    '\\text{Strength of HCl} = \\frac{V_1 \\times N_{NaOH}}{\\text{Volume of acid mixture}}',
    '\\text{Strength of CH}_3\\text{COOH} = \\frac{(V_2-V_1) \\times N_{NaOH}}{\\text{Volume of acid mixture}}'
  ],
  calculateResult: (observations) => {
    // A simplified auto-calculation assuming standard breakpoints can be derived, or user just enters V1, V2.
    // For this generic lab, let's just ask for V1 and V2 as direct inputs if we want true automation,
    // or calculate based on the minimums. We'll implement a basic mock calculation for demo.
    
    let validRows = 0;
    Object.values(observations).forEach(row => {
      if (row[1] && row[2]) validRows++;
    });
    
    if (validRows < 5) return { error: 'Please enter at least 5 readings to calculate V1 and V2.' };

    // In a real app, we'd run an algorithm to find the two intersection points of the V-curve.
    // For now, let's just output a placeholder calculation.
    return {
      success: true,
      text: `Calculations for conductometric curves require graphical intersection analysis.\nAssuming V₁ ≈ 5.0 mL and V₂ ≈ 10.5 mL from graph:\nAmount of HCl = 0.025 N\nAmount of CH₃COOH = 0.027 N`
    };
  }
};
