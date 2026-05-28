export const exp1_hardness = {
  id: 'c1',
  title: '01. Hardness of Water (EDTA Method)',
  type: 'chemistry',
  aim: 'To understand complexometric titrations and determine the degree of hardness of water samples using EDTA.',
  apparatus: 'Solid EDTA, Eriochrome Black-T (EBT) indicator, Buffer solution (pH 9–10), Hard water sample, Burette, Pipette, Conical flask, Standard flask, Distilled water.',
  theory: `Water hardness is caused by dissolved Ca²⁺ and Mg²⁺ ions (from bicarbonates, chlorides, sulphates). These ions form insoluble salts with soap (sodium stearate → calcium/magnesium stearate precipitate). The EDTA method uses complexometric titration: EDTA forms stable 1:1 complexes with metal ions. EBT indicator forms a wine-red complex with Ca²⁺/Mg²⁺ at pH 9–10. As EDTA is added, it displaces the indicator from the metal ions at the equivalence point — colour changes from wine-red to blue sharply.

Key reactions:
- 2C₁₇H₃₅COONa + M²⁺ → (C₁₇H₃₅COO)₂M↓ + 2Na⁺ (M = Ca, Mg)
- M²⁺ + (H₂EDTA)²⁻ → 2H⁺ + (MEDTA)²⁻`,
  procedure: [
    'Pipette 25 mL of water sample into a conical flask.',
    'Add 2 mL of buffer solution (pH 9–10).',
    'Add 2–3 drops of EBT indicator — solution turns wine-red.',
    'Fill burette with standard EDTA solution (0.01M).',
    'Titrate slowly; swirl constantly.',
    'Stop when colour changes from wine-red to blue (sharp endpoint).',
    'Record the volume of EDTA used (V mL).',
    'Repeat for concordant readings.'
  ],
  observationTable: {
    headers: ['S.No', 'Initial Burette Reading (mL)', 'Final Burette Reading (mL)', 'Volume of EDTA (V mL)'],
    rows: 3
  },
  formulae: [
    'Total\\ Hardness\\ (ppm) = \\frac{V \\times M \\times 100 \\times 1000}{Volume\\ of\\ sample}',
    'Total\\ Hardness = V(EDTA) \\times 0.01 \\times \\frac{100 \\times 1000}{25}',
    'Carbonate\\ Hardness\\ (CH) = determined\\ before\\ boiling',
    'Non\\text{-}Carbonate\\ Hardness\\ (NCH) = Total\\ Hardness - CH'
  ],
  calculateResult: (observations) => {
    // observations is an object like: { '0': { '0': 1, '1': '0', '2': '10.5', '3': '10.5' }, ... }
    let sumV = 0;
    let count = 0;
    Object.values(observations).forEach(row => {
      const v = parseFloat(row[3]); // Column index 3 is Volume of EDTA
      if (!isNaN(v) && v > 0) {
        sumV += v;
        count++;
      }
    });
    
    if (count === 0) return { error: 'Please enter valid observations.' };
    
    const meanV = sumV / count;
    // Formula: V * M * 100 * 1000 / 25 (where M = 0.01)
    const hardness = meanV * 0.01 * 100 * 1000 / 25;
    
    return {
      success: true,
      data: {
        meanVolume: meanV.toFixed(2),
        totalHardness: hardness.toFixed(2)
      },
      text: `Mean Volume of EDTA = ${meanV.toFixed(2)} mL\nTotal hardness of the given water sample = ${hardness.toFixed(2)} ppm (as CaCO₃).`
    };
  }
};
