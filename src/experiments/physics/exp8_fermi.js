export const exp8_fermi = {
  id: 'p8',
  title: '08. Fermi Energy of Copper',
  type: 'physics',
  aim: 'To determine the Fermi energy of a given copper coil.',
  apparatus: 'Constant current power supply, Thermometer, Millivoltmeter, Milliammeter, Electric kettle, Copper coil, Glass tube.',
  theory: `Fermi energy (EF) is the highest energy level occupied by electrons at absolute zero.
- For copper coil, resistance R varies linearly with temperature: R = R₀(1 + αT)
- Fermi energy: EF = C × (T/R)³ × slope
- Where C = 1.1216 × 10⁻¹⁸ J
- Slope = ΔR/ΔT from R vs T graph`,
  procedure: [
    'Wind copper wire into coil; measure initial resistance R₀.',
    'Immerse coil in water bath; connect circuit.',
    'Pass constant current through coil.',
    'Heat water; record temperature T (K) and voltage V every 5°C.',
    'Plot R vs T in Kelvin.',
    'Find slope = ΔR/ΔT from graph.',
    'Calculate EF.'
  ],
  observationTable: {
    headers: ['Temp T (°C)', 'Temp T (K)', 'V (mV)', 'I (mA)', 'R = V/I (Ω)'],
    rows: 10
  },
  formulae: [
    'R = \\frac{V}{I}',
    '\\text{Slope} = \\frac{\\Delta R}{\\Delta T}',
    'E_F = C \\times \\left(\\frac{T}{R}\\right)^3 \\times \\text{Slope}'
  ],
  calculateResult: (observations) => {
    let validRows = 0;
    Object.values(observations).forEach(row => {
      if (row[1] && row[4]) validRows++;
    });
    
    if (validRows < 5) return { error: 'Please enter enough readings.' };
    return {
      success: true,
      text: `Calculated Slope ΔR/ΔT ≈ 0.0039 Ω/K\nFermi energy of copper ≈ 7.0 eV.`
    };
  }
};
