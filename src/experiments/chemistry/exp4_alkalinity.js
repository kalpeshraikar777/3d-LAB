export const exp4_alkalinity = {
  id: 'c4',
  title: '04. Total Alkalinity of Water',
  type: 'chemistry',
  aim: 'To determine the total alkalinity of water samples (CO₃²⁻, H₂CO₃⁻) using double titration method.',
  apparatus: 'Standard HCl solution (0.02N), Water sample, Phenolphthalein indicator, Methyl orange indicator, Burette, Pipette, Conical flask.',
  theory: `Alkalinity is the capacity of water to neutralise acids. It is imparted by bicarbonate (HCO₃⁻), carbonate (CO₃²⁻), and hydroxide (OH⁻). Measured by double titration with sulphuric acid or HCl (0.02N) using two indicators:
  
- **Step 1 (Phenolphthalein titration):** Converts CO₃²⁻ → HCO₃⁻. Colour changes from pink to colourless at pH 8.2. Volume = P.
- **Step 2 (Methyl orange titration):** Converts HCO₃⁻ → H₂CO₃. Colour changes from yellow to orange-red at pH 4.5. Volume = M.`,
  procedure: [
    'Take 100 mL of water sample in a conical flask.',
    'Add 2 drops of phenolphthalein — if pink, CO₃²⁻/OH⁻ present.',
    'Titrate with standard HCl till colour changes to colourless. Record P mL.',
    'Add 2 drops methyl orange to the same flask — solution turns yellow.',
    'Continue titrating with HCl till colour changes to orange-red. Record M mL.'
  ],
  observationTable: {
    headers: ['S.No', 'Phenolphthalein (P mL)', 'Methyl Orange (M mL)', 'Total Volume (P+M) mL'],
    rows: 3
  },
  formulae: [
    'Total\\ Alkalinity = \\frac{(P + M) \\times N \\times 50 \\times 1000}{V}',
    'Phenolphthalein\\ Alkalinity = \\frac{P \\times N \\times 50 \\times 1000}{V}'
  ],
  calculateResult: (observations) => {
    let sumTotal = 0;
    let count = 0;
    Object.values(observations).forEach(row => {
      const p = parseFloat(row[1]) || 0;
      const m = parseFloat(row[2]) || 0;
      const total = p + m;
      if (total > 0) {
        sumTotal += total;
        count++;
      }
    });
    
    if (count === 0) return { error: 'Please enter valid observations.' };
    
    const meanTotal = sumTotal / count;
    // Formula: (P+M) * 0.02 * 50 * 1000 / 100
    const alkalinity = meanTotal * 0.02 * 50 * 1000 / 100;
    
    return {
      success: true,
      text: `Mean Total Volume (P+M) = ${meanTotal.toFixed(2)} mL\nTotal alkalinity of the given water sample = ${alkalinity.toFixed(2)} mg/L as CaCO₃.`
    };
  }
};
