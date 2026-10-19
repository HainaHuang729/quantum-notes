import assert from 'node:assert/strict';
import { dualGuide } from '../../src/sections/widgets/math-visual-guides.mjs';
const close = (a, b) => assert.ok(Math.abs(a - b) < 2e-12, `${a} != ${b}`);
const mul = ([a,b],[c,d]) => [a*c-b*d,a*d+b*c];
let count=0;
for (let j=-8;j<=8;j++) for(let phase=-180;phase<=180;phase+=15) {
  const t=j/4,s=dualGuide(t,phase), w=[[1,0],[0,1]];
  const terms=s.bra.map((z,k)=>mul(z,w[k]));
  for(let k=0;k<2;k++) {
    close(s.bra[k][0],s.ket[k][0]);close(s.bra[k][1],-s.ket[k][1]);
    close(terms[0][k]+terms[1][k],s.inner[k]);
  }
  close(s.ket.flat().reduce((a,x)=>a+x*x,0),s.norm2);
  assert.ok(s.ket.concat(s.bra,[s.inner]).flat().every(x=>Math.abs(x)<=3+1e-12));
  if(t===-1) close(Math.hypot(...s.inner),0);
  count++;
}
close(dualGuide(1,90).inner[1],-2);close(dualGuide(2,0).bra[1][1],-2);
console.log(`dual-guide: ${count} control states, conjugation, explicit bra-times-ket, norm and plot bounds passed`);
