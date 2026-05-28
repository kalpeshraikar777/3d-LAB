export const exp7_photodiode = {
  id: 'p7',
  title: '07. Characteristics of Photodiode',
  type: 'physics',
  aim: 'To study the reverse I-V characteristics of a photodiode for different light intensities and determine its responsivity.',
  apparatus: 'Regulated power supplies, Photodiode, Resistor, Light source, Microammeter, Voltmeter, Connecting wires.',
  theory: `A photodiode converts light into current and operates in reverse bias.
- Photoconductive mode: reverse bias applied; depletion region widens.
- When photons hit depletion region: electron-hole pairs generated.
- Photocurrent I_PD is proportional to incident light intensity.
- Responsivity R = I_PD / P (A/W), where P = optical power.`,
  procedure: [
    'Set up circuit in reverse bias mode.',
    'Expose photodiode to a known light intensity X₁.',
    'Vary reverse voltage from 0 to 3V in 0.2V steps.',
    'Record photocurrent I_PD at each voltage.',
    'Repeat for light intensities X₂ and X₃.',
    'Calculate responsivity = I_PD / incident power.'
  ],
  observationTable: {
    headers: ['Voltage V (V)', 'Dark Current I_dark (μA)', 'Photocurrent I_photo (μA)'],
    rows: 8
  },
  formulae: [
    '\\text{Responsivity } R = \\frac{I_{PD}}{\\text{Incident Optical Power } P} \\text{ (A/W)}',
    'I_{PD} = I_{\\text{light}} - I_{\\text{dark}}'
  ],
  calculateResult: (observations) => {
    const rows = Object.values(observations).filter(r => r[0] && r[2]);
    if (rows.length < 5) return { error: 'Please record at least 5 bias voltage I-V readings.' };
    
    let maxI = 0;
    rows.forEach(row => {
      const photocurrent = parseFloat(row[2]);
      if (photocurrent > maxI) maxI = photocurrent;
    });
    
    // responsivity R = I_PD / P
    // assuming incident optical power P = 37.5 uW = 3.75e-5 W at 50% average illumination
    const responsivity = (maxI * 1e-6 / 3.75e-5).toFixed(2);
    
    return {
      success: true,
      text: `⚡ Photodiode Characterization:\n` +
            `• Peak Photocurrent I_photo ≈ ${maxI.toFixed(2)} μA\n` +
            `• Estimated Responsivity R ≈ ${responsivity} A/W (incident optical power ≈ 37.5 μW)`
    };
  }
};
