import assert from 'node:assert/strict';
import {energyEvolution} from '../../src/sections/widgets/quantum-evolution.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<3e-12,`${a} != ${b}`);
let count=0;
for(let gi=0;gi<=16;gi++)for(let wi=0;wi<=10;wi++)for(let pi=0;pi<=24;pi++)for(let n=0;n<=120;n++){
 const g=gi/4,w=wi/10,phi=pi*15,s=energyEvolution(g,w,phi,n);
 // Independently multiply initial complex amplitude by the diagonal propagator.
 const p=phi*Math.PI/180,angle=g*n*Math.PI/30;
 const re=Math.sqrt(w)*(Math.cos(p)*Math.cos(angle)+Math.sin(p)*Math.sin(angle));
 const im=Math.sqrt(w)*(Math.sin(p)*Math.cos(angle)-Math.cos(p)*Math.sin(angle));
 near(s.state[1][0],re);near(s.state[1][1],im);
 const plus=((Math.sqrt(1-w)+re)**2+im**2)/2;
 near(s.other[0],plus);near(s.other[0]+s.other[1],1);near(s.norm,1);
 near(s.energy[1],re**2+im**2);near(s.energy[0],1-w);
 for(const q of [...s.energy,...s.other])assert.ok(q>=-1e-12&&q<=1+1e-12);
 if(w===0||w===1||g===0)near(s.other[0],energyEvolution(g,w,phi,0).other[0]);
 count++;
}
near(energyEvolution(1,.5,0,0).other[0],1);
near(energyEvolution(1,.5,0,30).other[0],0);
near(energyEvolution(1,.5,0,60).other[0],1);
console.log(`energy-phase-lab: ${count} reachable parameter/time states passed; diagonal evolution, transformed basis, normalization, stationary/degenerate cases and period.`);
