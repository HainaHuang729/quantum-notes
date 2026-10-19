import assert from 'node:assert/strict';
import {reducedMassState} from '../../src/sections/widgets/mechanics-coordinates.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`);
for(let i=1;i<=20;i++)for(let j=1;j<=20;j++)for(let n=5;n<=40;n++){
 const m1=i/2,m2=j/2,r=n/10,s=reducedMassState(m1,m2,r);
 close(m1*s.x1+m2*s.x2,0);close(s.x1-s.x2,r);close(m1*s.v1+m2*s.v2,0);close(s.v1-s.v2,1);
 close(s.kinetic,s.relativeKinetic);assert.ok(s.mu<Math.min(m1,m2));
 for(const [x,m] of [[s.x1,m1],[s.x2,m2]]){const center=260+45*x,radius=7+1.2*Math.sqrt(m);assert.ok(center-radius>35&&center+radius<480);}
 assert.ok(45*r>14+1.2*(Math.sqrt(m1)+Math.sqrt(m2)),'particle markers never overlap');
 for(const cmVelocity of [-1,0,.4,2]){
  const T=.5*m1*(cmVelocity+s.v1)**2+.5*m2*(cmVelocity+s.v2)**2;
  close(T,.5*s.total*cmVelocity**2+s.relativeKinetic);
 }
}
close(reducedMassState(2,2,2).mu,1);close(reducedMassState(.5,10,2).mu,5/10.5);
console.log('ReducedMassLab: all 14400 control states, CM/relative coordinates, momenta, energy and SVG bounds pass');
