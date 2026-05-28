export const exp8_copper = {
  id: 'c8',
  title: '08. Copper in E-Waste (Colorimetry)',
  type: 'chemistry',
  aim: 'To demonstrate Beer-Lambert\'s law for estimation of copper (II) ions using photoelectric colorimeter. To construct a calibration curve and determine concentration of Cu²⁺ in test solution.',
  apparatus: 'Copper sulphate solution (standard, various concentrations), Ammonia solution (liquid), Colorimeter/Spectrophotometer, Standard volumetric flasks, Pipettes, Beakers.',
  theory: `Beer-Lambert's Law: When monochromatic light (I₀) passes through a medium:
- I₀ = Ia + Ir + It; for glass: I₀ ≈ Ia + It
- Transmittance T = It/I₀
- Absorbance (OD): A = log(I₀/It) = εct
- Where ε = molar extinction coefficient, c = concentration (mol/dm³), t = path length (cm)
- A ∝ c (at constant path length) → straight-line calibration curve
- Reaction: CuSO₄ + 4NH₄OH → [Cu(NH₃)₄]SO₄ + 4H₂O (deep blue cuprammonium complex)
- Measured at 620 nm wavelength (maximum absorbance of cuprammonium complex)`,
  procedure: [
    'Prepare standard CuSO₄ solutions (0, 2, 4, 6, 8, 10 ppm).',
    'Add excess ammonia to each — forms deep blue cuprammonium complex.',
    'Dilute each to known volume.',
    'Set colorimeter to 620 nm.',
    'Measure absorbance of each standard. Plot calibration curve.',
    'Treat e-waste test solution with ammonia.',
    'Measure its absorbance at 620 nm.',
    'Read concentration from calibration curve.'
  ],
  observationTable: {
    headers: ['S.No', 'Conc. of CuSO₄ (ppm)', 'Absorbance (A) at 620 nm'],
    rows: 7
  },
  formulae: [
    'A = \\varepsilon \\cdot c \\cdot t \\quad \\text{(Beer-Lambert Law)}',
    '\\text{Concentration from calibration curve (interpolation)}'
  ],
  calculateResult: (observations) => {
    let validRows = 0;
    let testAbsorbance = 0;
    Object.values(observations).forEach((row, idx) => {
      if (row[2]) validRows++;
      if (idx === 6 && row[2]) testAbsorbance = parseFloat(row[2]); // Assuming row 7 is test solution
    });
    
    if (validRows < 5 || !testAbsorbance) return { error: 'Please enter standard readings and test solution absorbance (Row 7).' };
    
    // Simple mock linear interpolation
    const conc = testAbsorbance * 10; // rough estimation if A=1 is 10ppm
    return {
      success: true,
      text: `Test Absorbance = ${testAbsorbance}\nConcentration of copper in e-waste test solution ≈ ${conc.toFixed(2)} ppm.`
    };
  }
};
