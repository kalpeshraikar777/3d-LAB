export const exp6_planck = {
  id: 'p6',
  title: '06. Planck\'s Constant using LED',
  type: 'physics',
  aim: 'To determine Planck\'s constant using LEDs of different wavelengths.',
  apparatus: 'Power supply, LEDs (Red, Yellow, Green, Blue), Potentiometer, Resistor, Multimeters, Connecting wires.',
  theory: `An LED is a p-n junction semiconductor light source. The knee voltage (threshold voltage V₀) is the voltage at which LED begins to emit light.
- Energy given to electrons crossing junction: E = eV₀
- Energy of emitted photon: E = hc/λ
- Equating: eV₀ = hc/λ → h = (eV₀λ)/c
- e = 1.6 × 10⁻¹⁹ C, c = 3 × 10⁸ m/s`,
  procedure: [
    'Connect circuit for first LED.',
    'Slowly increase voltage using potentiometer.',
    'Note voltage when LED just begins to glow (V₀).',
    'Record I-V characteristics.',
    'Repeat for each LED (different wavelengths).',
    'Calculate h for each and find mean.'
  ],
  observationTable: {
    headers: ['LED Colour', 'Wavelength λ (nm)', 'Frequency ν (Hz)', 'Knee Voltage V₀ (V)', 'h = eV₀λ/c (J·s)'],
    rows: 5
  },
  formulae: [
    'h = \\frac{e \\times V_0 \\times \\lambda}{c}',
    '\\text{\\% Error} = \\frac{|h_{exp} - h_{std}|}{h_{std}} \\times 100'
  ],
  calculateResult: (observations) => {
    let sumH = 0;
    let count = 0;
    const e = 1.6e-19;
    const c = 3e8;
    Object.values(observations).forEach((row, idx) => {
      const lambda = parseFloat(row[1]) * 1e-9;
      const V0 = parseFloat(row[3]); // Knee Voltage V0 is in column 3
      if (lambda && V0) {
        const h = (e * V0 * lambda) / c;
        sumH += h;
        count++;
      }
    });

    if (count === 0) return { error: 'Please record LED knee voltage values.' };
    const meanH = sumH / count;
    const stdH = 6.626e-34;
    const error = (Math.abs(meanH - stdH) / stdH) * 100;
    
    return {
      success: true,
      text: `Planck's constant h = ${(meanH * 1e34).toFixed(3)} × 10⁻³⁴ J·s\nPercentage error = ${error.toFixed(2)}%`
    };
  }
};
