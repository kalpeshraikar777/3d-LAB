export const exp9_transistor = {
  id: 'p9',
  title: '09. Transistor Characteristics (CE)',
  type: 'physics',
  aim: 'To study the input and output characteristics of a given NPN transistor in common-emitter configuration and determine parameters.',
  apparatus: 'NPN transistor, Batteries (B, Vcc), Rheostats, Microammeter, Milliammeter, Voltmeters.',
  theory: `In CE configuration, emitter is common.
- Input characteristics: I_B vs V_BE at constant V_CE. Input resistance h_ie = ΔV_BE / ΔI_B.
- Output characteristics: I_C vs V_CE at constant I_B. Output resistance h_oe = ΔV_CE / ΔI_C.
- DC current gain: β = ΔI_C / ΔI_B`,
  procedure: [
    'Set V_CE = 1V. Vary V_BE and record I_B. Repeat for V_CE = 2V.',
    'Plot input characteristics (I_B vs V_BE).',
    'Set I_B = 10 μA. Vary V_CE and record I_C. Repeat for I_B = 20, 30 μA.',
    'Plot output characteristics (I_C vs V_CE).'
  ],
  observationTable: {
    headers: ['V_CE (V)', 'V_BE (V)', 'I_B (μA)', 'I_C (mA)'],
    rows: 15
  },
  formulae: [
    'r_i = \\frac{\\Delta V_{BE}}{\\Delta I_B} \\quad (V_{CE} \\text{ const})',
    'r_o = \\frac{\\Delta V_{CE}}{\\Delta I_C} \\quad (I_B \\text{ const})',
    '\\beta = \\frac{\\Delta I_C}{\\Delta I_B}'
  ],
  calculateResult: (observations) => {
    return {
      success: true,
      text: `From typical graph sections:\nInput resistance r_i ≈ 1.2 kΩ\nOutput resistance r_o ≈ 50 kΩ\nDC Current Gain β ≈ 150`
    };
  }
};
