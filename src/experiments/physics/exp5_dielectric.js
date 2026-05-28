export const exp5_dielectric = {
  id: 'p5',
  title: '05. Dielectric Constant',
  type: 'physics',
  aim: 'To find the dielectric constant of a given dielectric material.',
  apparatus: 'Battery (8V), Capacitor with dielectric material (L = 200 mm, b = 5 mm, d = 0.1 mm), Resistor (R = 100 × 10³ Ω), Voltmeter (0-10V), Stopwatch, Connecting wires.',
  theory: `Dielectric constant (εr or K) = relative permittivity = ε/ε₀. It characterises capacitors:
- εr = Cm / Cv (ratio of capacitance with material to air)
- Charging: Vc = V[1 − e^(−t/RC)]
- Discharging: Vd = V[e^(t/RC) − 1]
- Time constant τ = RC
- At T₁/₂ (half-life time): capacitor charges/discharges to half saturation voltage
- C = T₁/₂ / (0.693 × R) [from charging/discharging curve intersection]
- Also: C = ε₀εr A / d
- Therefore: εr = (d × T₁/₂ × 10⁻⁶) / (0.693 × ε₀ × A × R)
- ε₀ = 8.85 × 10⁻¹² F/m`,
  procedure: [
    'Note dielectric material dimensions: L, b, d.',
    'Calculate Area A = L × b.',
    'Connect charging circuit; start stopwatch; record voltage every second.',
    'Once fully charged, switch to discharge circuit; record voltage every second.',
    'Plot both curves; find T₁/₂ (intersection of charging and discharging curves).',
    'Calculate C from T₁/₂.',
    'Calculate εr from formula.'
  ],
  observationTable: {
    headers: ['Material', 'Thickness d (mm)', 'Area A (mm²)', 'Capacitance C (F)', 'Air Capacitance C₀ (F)', 'Dielectric Constant εr'],
    rows: 5
  },
  formulae: [
    'C = \\frac{\\varepsilon_r \\varepsilon_0 A}{d}',
    '\\varepsilon_r = \\frac{C}{C_0}',
    '\\varepsilon_0 = 8.854 \\times 10^{-12} \\text{ F/m}'
  ],
  calculateResult: (observations) => {
    const rows = Object.values(observations).filter(r => r[0] && r[5]);
    if (rows.length === 0) return { error: 'Please select dielectric materials and run the charge/discharge cycles.' };
    
    let text = 'Dielectric Constant Measurements:\n';
    rows.forEach(row => {
      text += `• ${row[0]}: εr = ${row[5]} (C = ${row[3]} F, C₀ = ${row[4]} F)\n`;
    });
    
    return {
      success: true,
      text
    };
  }
};
