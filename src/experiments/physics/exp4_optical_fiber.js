export const exp4_optical_fiber = {
  id: 'p4',
  title: '04. Acceptance Angle & NA of Optical Fiber',
  type: 'physics',
  aim: 'To find the acceptance angle and numerical aperture of an optical fiber.',
  apparatus: 'LASER source, Optical fiber cable, Screen, Metre scale/ruler, Vernier calipers.',
  theory: `Total internal reflection allows light to travel through optical fiber. The acceptance angle (θa) is the maximum angle at which light can enter the fiber and still undergo total internal reflection.
- Acceptance angle θa = tan⁻¹(D / 2L)
- Numerical Aperture NA = sinθa
- NA relates to the refractive indices of core (n₁) and cladding (n₂): NA = √(n₁² − n₂²)`,
  procedure: [
    'Connect LASER to one end of optical fiber.',
    'Hold other end at distance L from screen.',
    'Observe circular bright spot on screen.',
    'Measure diameter D of spot using scale.',
    'Record L and D for different distances.',
    'Calculate θa = tan⁻¹(D/2L) for each.',
    'Calculate NA = sinθa.'
  ],
  observationTable: {
    headers: ['S.No', 'L (mm)', 'D (mm)', 'θa = tan⁻¹(D/2L)', 'NA = sinθa'],
    rows: 8
  },
  formulae: [
    '\\theta_a = \\tan^{-1}\\left(\\frac{D}{2L}\\right)',
    'NA = \\sin\\theta_a'
  ],
  calculateResult: (observations) => {
    let sumNA = 0;
    let count = 0;
    Object.values(observations).forEach(row => {
      const L = parseFloat(row[1]);
      const D = parseFloat(row[2]);
      if (L && D) {
        const theta_rad = Math.atan(D / (2 * L));
        const NA = Math.sin(theta_rad);
        sumNA += NA;
        count++;
      }
    });

    if (count === 0) return { error: 'Please enter L and D values.' };
    const meanNA = sumNA / count;
    const meanTheta = Math.asin(meanNA) * (180 / Math.PI);
    
    return {
      success: true,
      text: `Mean Acceptance Angle θa = ${meanTheta.toFixed(2)}°\nMean Numerical Aperture NA = ${meanNA.toFixed(4)}`
    };
  }
};
