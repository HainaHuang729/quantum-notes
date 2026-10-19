import assert from 'node:assert/strict';
import {stepScattering} from '../../src/sections/widgets/scattering-current.mjs';
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let count=0;
for(let ei=50;ei<=400;ei++)for(let v=-20;v<=30;v++){
 const e=ei/10;
 const s=stepScattering(e,v),h=1e-5,k=s.k;
 assert.equal(s.branch,e>v?'propagating':e===v?'threshold':'evanescent');
 near(s.R+s.T,1);near(s.incidentCurrent+s.reflectedCurrent,s.transmittedCurrent);
 // Independent boundary equations with an incident amplitude of one.
 for(let z=0;z<2;z++)near(1*(z===0)+s.r[z],s.t[z]);
 const leftD=[k*s.r[1],k*(1-s.r[0])],rightD=s.branch==='propagating'?[-s.q*s.t[1],s.q*s.t[0]]:s.t.map(a=>-s.kappa*a);
 for(let z=0;z<2;z++)near(leftD[z],rightD[z]);
 for(let xi=-60;xi<=60;xi++){
  const x=xi/10,w=s.wave(x),d=s.gradient(x);
  assert.ok(s.density(x)>=0&&s.density(x)<=4+1e-10);
  assert.ok(Math.abs(w[0])<=2+1e-10&&Math.abs(w[1])<=2+1e-10);
  if(x!==0){const before=s.wave(x-h),after=s.wave(x+h);for(let z=0;z<2;z++)near(d[z],(after[z]-before[z])/(2*h),2e-8);}
  // Flux from the complex derivative, independently differentiated above.
  near(w[0]*d[1]-w[1]*d[0],s.transmittedCurrent);
 }
 if(e<=v){near(s.R,1);near(s.T,0);assert.ok(s.density(1)>0);near(s.current(1),0);}
 if(v===0){near(s.R,0);near(s.T,1);}
 count++;
}
for(const [e,v] of [[20,10],[5,10],[10,10],[20,-10],[20,0],[9.9,10],[10.1,10]])assert.equal(stepScattering(e,v).branch,e>v?'propagating':e===v?'threshold':'evanescent');
near(stepScattering(20,15).r[0],1/3);near(stepScattering(20,15).t[0],4/3);near(stepScattering(20,15).R,1/9);near(stepScattering(20,15).T,8/9);
assert.ok(stepScattering(20,-10).R>0);
assert.equal(stepScattering(11,10).branch,'propagating');assert.equal(stepScattering(9,10).branch,'evanescent');
console.log(`StepScatteringLab: ${count} reachable E/V states ×121 positions; matching, independently differentiated flux, R+T, presets, threshold and plot bounds passed.`);

