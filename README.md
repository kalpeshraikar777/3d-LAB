# 🔬 Google Antigravity 2.0 — Complete 3D Virtual Laboratory

Welcome to the **Complete 3D Virtual Laboratory**, a professional-grade, interactive physics and chemistry simulator built with React, React Three Fiber (Three.js), and GSAP. 

This project features a fully immersive 3D environment designed for university-level science experiments, offering hyper-realistic apparatus, real-time data plotting, and meticulous attention to physical interactions (like liquid surface tension, meniscus curvature, and gradual titration color changes).

## 🌟 Key Features
- **Immersive 3D Environment**: Orbit controls with unlimited zoom capabilities. Inspect macro details like apparatus graduation marks, digital displays, and wood grain textures.
- **Physics-Based Rendering (PBR)**: Realistic lighting, shadows, refractions, and reflections for borosilicate glass, brushed aluminum, and polished brass.
- **Dynamic Interactions**: 
  - Click-and-hold stopcock controls for continuous flow vs. single-drop titration.
  - Visible drop-by-drop color transitions and sharp endpoints.
  - Analog and digital meters that update in real-time.
- **Automated Observation Table**: Built-in interactive "Record" functionality that logs data and populates dynamic graphs.

## 🧪 Included Experiments

### Chemistry (7 Experiments)
1. **Total Hardness (EDTA Method)** - Complexometric titration with Eriochrome Black-T.
2. **Total Alkalinity** - Multi-step titration using Phenolphthalein and Methyl Orange.
3. **Acid Mixture (Conductometry)** - V-curve analysis for strong and weak acid mixtures.
4. **Iron in Rust (Potentiometry)** - Redox titration of Fe²⁺ using K₂Cr₂O₇.
5. **pKa Determination** - S-curve pH titration using a calibrated glass electrode.
6. **Copper Estimation (Colorimetry)** - Beer-Lambert law validation with ammonia complexes.
7. **Viscosity Coefficient** - Ostwald viscometer simulation with water and acetone.

### Physics (9 Experiments)
1. **Series & Parallel LCR Circuit** - Resonance curve plotting and breadboard wiring.
2. **Resistivity (Four Probe Method)** - Semiconductor bandgap estimation with an electric oven.
3. **Diffraction Grating** - Wavelength calculation using a laser optical bench.
4. **Optical Fiber** - Spot measurement and propagation of light.
5. **Dielectric Constant** - Capacitor charge/discharge curves with various materials.
6. **Planck's Constant** - LED threshold voltage measurement.
7. **Photodiode Characteristics** - Reverse bias and photovoltaic IV curves.
8. **Fermi Energy** - Temperature-dependent resistance of copper.
9. **Transistor Characteristics (BJT)** - Input/Output characteristics and current gain.

## 🛠️ Technology Stack
- **Framework**: React 18
- **3D Graphics**: Three.js / React Three Fiber / React Three Drei
- **Animations**: GSAP (GreenSock Animation Platform)
- **Styling**: Vanilla CSS / React Spring
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/kalpeshraikar777/3d-LAB.git
   cd 3d-LAB
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## 🎮 Controls
- **Rotate Camera**: Left Click + Drag
- **Pan Camera**: Right Click + Drag (or Arrow Keys)
- **Zoom**: Scroll Wheel
- **Interact**: Left click on highlighted apparatus components (Pipettes, Stopcocks, Power Buttons, etc.)

## 📝 License
This project is open-source and available under the MIT License.
