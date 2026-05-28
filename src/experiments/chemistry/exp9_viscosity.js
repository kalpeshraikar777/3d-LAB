export const exp9_viscosity = {
  id: 'c9',
  title: '09. Viscosity Coefficient',
  type: 'chemistry',
  aim: 'To determine the relative viscosity coefficient of a given liquid coolant sample using Ostwald\'s viscometer.',
  apparatus: 'Acetone (or coolant sample liquid), Water (reference liquid), Ostwald\'s viscometer, Stopwatch, Density bottle, Analytical balance, Thermometer.',
  theory: `Viscosity is internal friction between moving molecular layers. Coefficient of viscosity (η) is the tangential force per unit area to maintain unit velocity gradient between successive layers. Poiseuille's Formula:
- η = πPr⁴t / 8Vl
- For comparison of two liquids through same tube:
- η₁/η₂ = (t₁ × d₁) / (t₂ × d₂)
- Where t = flow time, d = density of liquid
- η_liquid = η_water × (t_liquid × d_liquid) / (t_water × d_water)
- Factors: molecular weight↑ → viscosity↑; temperature↑ → viscosity↓ (~2%/°C); polar compounds > non-polar; branched chains > straight chains.`,
  procedure: [
    'Clean Ostwald viscometer and dry completely.',
    'Fill with 10 mL of water; note temperature.',
    'Suck water into upper bulb using suction.',
    'Release; measure time (t_w) for water to fall from mark A to B.',
    'Repeat 3 times for concordant readings.',
    'Empty, clean, and fill with coolant liquid.',
    'Repeat procedure — record t_l.',
    'Measure densities d_w and d_l using density bottle.'
  ],
  observationTable: {
    headers: ['Liquid', 'Trial 1 (s)', 'Trial 2 (s)', 'Trial 3 (s)', 'Density d (g/cm³)', 'Mean t (s)'],
    rows: 2 // Row 1: Water, Row 2: Sample
  },
  formulae: [
    '\\eta_{sample} = \\eta_{water} \\times \\frac{t_{sample} \\times d_{sample}}{t_{water} \\times d_{water}}',
    '\\text{Relative viscosity} = \\frac{\\eta_{sample}}{\\eta_{water}}'
  ],
  calculateResult: (observations) => {
    // Water is index 0, Sample is index 1
    const water = observations['0'];
    const sample = observations['1'];
    if (!water || !sample) return { error: 'Please enter readings.' };
    
    let t_w = (parseFloat(water[1]) + parseFloat(water[2]) + parseFloat(water[3])) / 3;
    let t_s = (parseFloat(sample[1]) + parseFloat(sample[2]) + parseFloat(sample[3])) / 3;
    let d_w = parseFloat(water[4]) || 0.997;
    let d_s = parseFloat(sample[4]);
    
    if (!t_w || !t_s || !d_s) return { error: 'Please fill all fields to calculate.' };
    
    // η_water at 25°C = 0.8904 mPa·s
    const eta_w = 0.8904;
    const eta_s = eta_w * (t_s * d_s) / (t_w * d_w);
    
    return {
      success: true,
      data: {
        t_water: t_w.toFixed(2),
        t_sample: t_s.toFixed(2),
        eta: eta_s.toFixed(3)
      },
      text: `Mean flow time of water = ${t_w.toFixed(2)} s\nMean flow time of sample = ${t_s.toFixed(2)} s\nViscosity coefficient of the coolant liquid = ${eta_s.toFixed(3)} mPa·s.`
    };
  }
};
