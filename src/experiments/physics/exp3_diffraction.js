export const exp3_diffraction = {
  id: 'p3',
  title: '03. Diffraction Grating (LASER Wavelength)',
  type: 'physics',
  aim: 'To find the wavelength of a given LASER source using diffraction grating element.',
  apparatus: 'Diffraction grating (known number of lines N per metre), Diode LASER source, Image screen, Metre scale, Optical bench.',
  theory: `Diffraction occurs when waves pass through a gap comparable to their wavelength — waves bend around obstacles. For diffraction grating at normal incidence:
- sinθ = Nnλ (grating equation)
- Where N = number of lines per unit length of grating, n = order of spectrum, λ = wavelength, θ = diffraction angle
- sinθ = Nnλ → λ = sinθ / (Nn)
- Angle: θ = tan⁻¹(x_n / D) where x_n = distance of nth order from central maximum, D = distance from grating to screen`,
  procedure: [
    'Set up LASER, grating, and screen on optical bench.',
    'Measure D (grating-to-screen distance).',
    'Switch on LASER; observe diffraction pattern on screen.',
    'Measure distance x₁ for 1st order (both sides), x₂ for 2nd order, etc.',
    'Calculate θ for each order.',
    'Apply grating equation to find λ.',
    'Average over all orders.'
  ],
  observationTable: {
    headers: ['Order n', 'D (mm)', '2xₙ (mm)', 'xₙ (mm)', 'θ = tan⁻¹(xₙ/D)', 'λ (nm)'],
    rows: 3
  },
  formulae: [
    '\\sin\\theta = Nn\\lambda \\implies \\lambda = \\frac{\\sin\\theta}{Nn}',
    '\\theta = \\tan^{-1}\\left(\\frac{x_n}{D}\\right)'
  ],
  calculateResult: (observations) => {
    let sumLambda = 0;
    let count = 0;
    Object.values(observations).forEach((row, idx) => {
      const n = idx + 1;
      const D = parseFloat(row[1]);
      const x = parseFloat(row[3]);
      if (D && x) {
        // N = lines per mm, assume typical 500 lines/mm = 500,000 lines/m
        const theta = Math.atan(x/D);
        const lambda = (Math.sin(theta) / (500000 * n)) * 1e9; // to nm
        sumLambda += lambda;
        count++;
      }
    });

    if (count === 0) return { error: 'Please enter measurements.' };
    return {
      success: true,
      text: `Mean Wavelength of LASER = ${(sumLambda / count).toFixed(2)} nm.`
    };
  }
};
