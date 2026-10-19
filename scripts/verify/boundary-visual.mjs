import assert from 'node:assert/strict';
import { boundaryComparison } from '../../src/sections/widgets/bound-classical-visual.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let count=0;
for(const mode of ['bound','free']) for(let ki=5;ki<=30;ki++) for(let ci=5;ci<=20;ci++) for(let xi=-20;xi<=20;xi++) {
  const k=ki/10,c=ci/10,u=xi/20*(mode==='bound'?.5:2),s=boundaryComparison(mode,k,c,u),h=1e-4;
  const d1=(s.first(u+h)-s.first(u-h))/(2*h),d2=(s.second(u+h)-s.second(u-h))/(2*h);
  close(s.firstSlope,d1,1.1e-7);close(s.secondSlope,d2,2.1e-7);
  close(s.firstValue*d2-s.secondValue*d1,s.wronskian,1.1e-7);
  const d21=(s.first(u+h)-2*s.first(u)+s.first(u-h))/(h*h);
  const d22=(s.second(u+h)-2*s.second(u)+s.second(u-h))/(h*h);
  close(d21,-s.waveNumber*s.waveNumber*s.firstValue,2e-7);
  close(d22,-s.waveNumber*s.waveNumber*s.secondValue,3e-7);
  assert.ok(Math.abs(s.firstValue)<=1+1e-12&&Math.abs(s.secondValue)<=2+1e-12);
  assert.equal(s.branch,mode==='bound'?'proportional':'independent');
  if(mode==='bound') {close(s.first(-.5),0);close(s.second(.5),0);close(s.secondValue,c*s.firstValue);close(s.wronskian,0);}
  else {assert.ok(s.wronskian>0);close(s.firstValue**2+s.secondValue**2,1);}
  count++;
}
for(const [mode,k,c] of [['bound',2,1.5],['free',2,1.5]]) assert.equal(boundaryComparison(mode,k,c,0).branch,mode==='bound'?'proportional':'independent');
console.log(`Boundary visual: ${count} control states, independent derivatives, same-energy ODE, Wronskian, box endpoints and plot bounds pass.`);
