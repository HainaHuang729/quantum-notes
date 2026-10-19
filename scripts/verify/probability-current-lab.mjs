import assert from 'node:assert/strict';
import {currentPacket} from '../../src/sections/widgets/scattering-current.mjs';
const near=(a,b,t=2e-7)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const integrate=(fn,a,b,n=2000)=>{let s=0;const dx=(b-a)/n;for(let i=0;i<n;i++)s+=fn(a+(i+.5)*dx);return s*dx;};
let count=0;
for(let pi=-12;pi<=12;pi++)for(let ti=0;ti<=40;ti++)for(let ci=-6;ci<=6;ci++){
 const p=pi/4,t=ti/10,c=ci/2,s=currentPacket(p,t,c),h=1e-5;
 assert.ok(s.probability>=0&&s.probability<=1+1e-10);
 near(s.derivative,(currentPacket(p,t+h,c).probability-currentPacket(p,t-h,c).probability)/(2*h));
 const expected=p===0&&t===0?'no-current':s.left>s.right?'gaining':s.left<s.right?'losing':'balanced';assert.equal(s.branch,expected);
 for(const x of [-8,-3,-1,0,1,3,8]){
  const densityTime=(currentPacket(p,t+h,c).density(x)-currentPacket(p,t-h,c).density(x))/(2*h);
  const flowSpace=(s.current(x+h)-s.current(x-h))/(2*h);
  near(densityTime,-flowSpace,1e-7);assert.ok(Math.abs(s.current(x))<1.8);assert.ok(s.density(x)<=.6);
 }
 count++;
}
for(const [p,t,c] of [[2,0,-2],[2,0,0],[-2,0,0],[0,0,0],[3,4,3],[-3,4,-3]]){
 const s=currentPacket(p,t,c);near(integrate(s.density,s.mean-10*s.width,s.mean+10*s.width),1);
 near(integrate(s.density,-1,1),s.probability,1e-7);
}
for(let x=-8;x<=8;x+=.1){const a=currentPacket(2,0,0),b=currentPacket(-2,0,0);near(a.density(x),b.density(x));near(a.current(x),-b.current(x));near(currentPacket(0,0,0).current(x),0);}
console.log(`ProbabilityCurrentLab: ${count} reachable states; independent finite-difference continuity, interval balance, normalization, equal-density/opposite-current presets passed.`);

