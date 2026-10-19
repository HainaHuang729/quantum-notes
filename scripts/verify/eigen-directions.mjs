import assert from 'node:assert/strict';
import {eigenState} from '../../src/sections/widgets/eigen-math.mjs';
for(let g=0;g<=200;g++){
  const gap=g/100,branch=gap===0?'exact':gap<.05?'near':'regular';
  for(let angle=0;angle<=180;angle++){
    const s=eigenState(angle,gap); assert.equal(s.branch,branch);
    const [a,b,d]=s.matrix;
    assert.ok(Math.abs(a+d-(2+gap))<1e-12);
    assert.ok(Math.abs(a*d-b*b-(1+gap))<1e-12);
    assert.ok(Math.abs(s.residual-Math.abs(gap*Math.sin((angle-30)*Math.PI/180)*Math.cos((angle-30)*Math.PI/180)))<1e-12);
    assert.equal(s.isEigen,gap===0||angle===30||angle===120);
    if(s.isEigen)assert.ok(s.residual<1e-12);
    // Same transform used in the SVG; no vector can leave the viewBox.
    const px=200+55*s.av[0],py=180-55*s.av[1];
    assert.ok(px>=5&&px<=395&&py>=5&&py<=345);
  }
}
console.log('eigen-directions: exact / near / regular branches, axes and spectral invariants pass');
