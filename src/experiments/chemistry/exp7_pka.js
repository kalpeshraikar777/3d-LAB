export const exp7_pka = {
  id: 'c7',
  title: '07. pKa of Cooling Fluids (pH Sensor)',
  type: 'chemistry',
  aim: 'To determine the pKa value of cooling fluid (acetic acid) using a pH meter and to plot the titration curve.',
  apparatus: 'Standard NaOH solution, CH₃COOH (acetic acid / cooling fluid), pH meter with glass electrode, Burette, Pipette, Beaker, Magnetic stirrer.',
  theory: `The strength of an acid is measured by its dissociation constant Ka. For acetic acid:
- CH₃COOH(aq) + H₂O(l) ⇌ H₃O⁺(aq) + CH₃COO⁻(aq)
- Ka = [H₃O⁺][CH₃COO⁻] / [CH₃COOH]
- pKa = −log₁₀(Ka)
- Henderson-Hasselbalch equation: pH = pKa + log₁₀([Salt]/[Acid])
- At half-equivalence point: [Acid] = [Salt] → pH = pKa
- During titration, pH rises slowly, then rapidly near equivalence point, then slowly again.`,
  procedure: [
    'Take 20 mL of acetic acid (cooling fluid) in a beaker.',
    'Calibrate the pH meter using buffer solutions (pH 4, 7, 9).',
    'Record initial pH.',
    'Add NaOH in 0.5 mL increments.',
    'Record pH after each addition.',
    'Identify equivalence point (sharp pH jump).',
    'At half-equivalence (V/2 mL), read pH = pKa.'
  ],
  observationTable: {
    headers: ['S.No', 'Volume NaOH (mL)', 'pH Reading'],
    rows: 15
  },
  formulae: [
    'pKa = \\text{pH at half-equivalence point}',
    'pH = pKa + \\log\\left(\\frac{[CH_3COO^-]}{[CH_3COOH]}\\right)',
    'Ka = 10^{-pKa}'
  ],
  calculateResult: (observations) => {
    let validRows = 0;
    Object.values(observations).forEach(row => {
      if (row[1] && row[2]) validRows++;
    });
    
    if (validRows < 5) return { error: 'Please enter enough readings.' };
    return {
      success: true,
      text: `Based on the half-equivalence point from typical data:\npKa of the given cooling fluid (acetic acid) ≈ 4.76`
    };
  }
};
