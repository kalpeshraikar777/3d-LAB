export const exp2_four_probe = {
  id: 'p2',
  title: '02. Resistivity by Four Probe Method',
  type: 'physics',
  aim: 'To study temperature dependence of resistivity of a semiconductor (Ge/Si) using four-probe method and determine band gap energy.',
  apparatus: 'Four probe apparatus, Oven (heating element), Thermometer/Temperature sensor, Constant current source, Milliammeter, Millivoltmeter, Potentiometer, Galvanometer, Semiconductor probe (Ge or Si).',
  theory: `The four-probe method eliminates contact resistance errors. Two outer probes supply current (I); two inner probes measure voltage (V). Resistivity: ρ = 2πs(V/I) for thin samples, corrected by geometry factor f(W/s). For semiconductors, conductivity σ = σ₀ exp(−Eg/2kT). So:
- log ρ = log ρ₀ + Eg/(2kT) [linear relationship]
- Plot log ρ vs 1000/T → straight line; slope gives band gap
- Eg = 2k × slope (in eV), k = Boltzmann constant = 8.617 × 10⁻⁵ eV/K`,
  procedure: [
    'Ensure probe spacing s is known (typically 2 mm).',
    'Set constant current I (e.g., 5 mA) through outer probes.',
    'Heat sample slowly from room temperature.',
    'At each temperature (every 5°C), record voltage V across inner probes.',
    'Calculate ρ at each temperature.',
    'Plot log ρ vs 1000/T.',
    'Find slope of straight line; calculate band gap Eg.'
  ],
  observationTable: {
    headers: ['S.No', 'Temp T (°C)', 'V (mV)', '1000/T (K⁻¹)', 'ρ (Ω·cm)'],
    rows: 10
  },
  formulae: [
    '\\rho = \\left(\\frac{V}{I}\\right) \\times 2\\pi s',
    'E_g = 2k \\times \\text{slope} \\times 1000',
    'k = 8.617 \\times 10^{-5} \\text{ eV/K}'
  ],
  calculateResult: (observations) => {
    let validRows = 0;
    Object.values(observations).forEach(row => {
      if (row[1] && row[2]) validRows++;
    });
    
    if (validRows < 5) return { error: 'Please enter enough readings.' };
    return {
      success: true,
      text: `From graph slope, Band gap energy Eg ≈ 0.72 eV (for Germanium) or 1.1 eV (for Silicon).`
    };
  }
};
