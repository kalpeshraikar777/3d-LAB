const fs = require('fs');

const path = 'src/components/3d/apparatus/ApparatusLibrary.jsx';
let content = fs.readFileSync(path, 'utf8');

const offsets = {
  BuretteStand: '0.025',
  ConicalFlask: '0.25',
  Beaker: 'h/2',
  Pipette: '1.05',
  ReagentBottle: '0.25',
  Dropper: '0.28',
  WashBottle: '0.4',
  WeighingBalance: '0.06',
  WatchGlass: '0.25',
  Spatula: '0.006',
  StirringRod: '0.75',
  WhiteTile: '0.025',
  VolumetricFlask: '0.2',
  MeasuringCylinder: '0.5',
  Funnel: '0.3',
  MagneticStirrer: '0.06',
  DigitalMeter: '0.125',
  Electrode: 'config.length/2 + 0.055',
  HotPlate: '0.05',
  Colorimeter: '0.175'
};

// For each component, wrap the children of the outer <group> in <group position={[0, OFFSET, 0]}> ... </group>
for (const [comp, offset] of Object.entries(offsets)) {
  const regex = new RegExp(`(export const ${comp} =.*?<group ref={groupRef} position={position}[^>]*>)([\\s\\S]*?)(</group>\\s*\\);\\s*})`, 'g');
  content = content.replace(regex, (match, p1, p2, p3) => {
    // If it's already wrapped, skip it (rudimentary check)
    if (p2.includes(`<group position={[0, ${offset}, 0]}>`)) return match;
    
    return `${p1}\n      <group position={[0, ${offset}, 0]}>${p2}      </group>\n    ${p3}`;
  });
}

fs.writeFileSync(path, content);
console.log('ApparatusLibrary offsets applied.');
