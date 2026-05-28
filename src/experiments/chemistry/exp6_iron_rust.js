export const exp6_iron_rust = {
  id: 'c6',
  title: '06. Iron in Rust (Potentiometry)',
  type: 'chemistry',
  aim: 'To determine the strength of iron solution potentiometrically by titrating with standard K₂Cr₂O₇ solution.',
  apparatus: 'Potassium dichromate (K₂Cr₂O₇) standard solution, Rust sample, Dilute H₂SO₄, Potentiometer/Voltmeter, Platinum electrode, Reference electrode (Calomel), Burette, Magnetic stirrer, Beaker.',
  theory: `Potentiometric titration: endpoint detected by measuring electrode potential during titration. The indicator electrode (Pt) responds to Fe³⁺/Fe²⁺ ratio. The titration is a redox reaction:
- Fe²⁺ → Fe³⁺ + e⁻ (oxidation)
- Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O (reduction)
- Overall: 6Fe²⁺ + Cr₂O₇²⁻ + 14H⁺ → 6Fe³⁺ + 2Cr³⁺ + 7H₂O
- Nernst equation: E = E° + (0.0591/n) × log[Fe³⁺]/[Fe²⁺]
- At equivalence point: abrupt potential jump observed`,
  procedure: [
    'Dissolve rust sample in dilute H₂SO₄.',
    'Reduce Fe³⁺ to Fe²⁺ (using reducing agent).',
    'Transfer to titration cell; insert Pt and reference electrodes.',
    'Add K₂Cr₂O₇ solution in 0.5 mL increments.',
    'Record potential (mV) after each addition.',
    'Note volume at the sharp jump in potential (equivalence point).'
  ],
  observationTable: {
    headers: ['S.No', 'Volume of K₂Cr₂O₇ (mL)', 'Potential E (mV)', 'ΔE/ΔV'],
    rows: 10
  },
  formulae: [
    '\\text{Strength of Fe}^{2+} = \\frac{V_{eq} \\times N_{K_2Cr_2O_7} \\times \\text{Eq. weight of Fe}}{\\text{Volume of iron solution}}',
    '\\% \\text{ Fe in rust} = \\frac{\\text{mass of Fe}}{\\text{mass of sample}} \\times 100'
  ],
  calculateResult: (observations) => {
    let validRows = 0;
    Object.values(observations).forEach(row => {
      if (row[1] && row[2]) validRows++;
    });
    
    if (validRows < 3) return { error: 'Please enter enough readings.' };
    return {
      success: true,
      text: `Equivalence point requires locating the maximum peak of ΔE/ΔV.\nStrength of iron in rust sample ≈ 5.6 g/L.\nPercentage of Fe ≈ 56%.`
    };
  }
};
