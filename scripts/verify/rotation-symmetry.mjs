import assert from 'node:assert/strict';
import {oscillatorSymmetry} from '../../src/sections/widgets/canonical-symmetry-math.mjs';
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(let i=0;i<=100;i++)for(let k=0;k<=100;k++){
 const alpha=i/50,t=k/10,s=oscillatorSymmetry(alpha,t),h=1e-5;
 close(s.energy,1);assert.ok(Math.abs(s.x)<=1&&Math.abs(s.y)<=1);
 assert.ok(Math.abs(s.lz)<=1+1/Math.sqrt(1+alpha)+1e-12);
 close((oscillatorSymmetry(alpha,t+h).lz-oscillatorSymmetry(alpha,t-h).lz)/(2*h),s.torque);
 close((oscillatorSymmetry(alpha,t+h).x-oscillatorSymmetry(alpha,t-h).x)/(2*h),s.px);
 close((oscillatorSymmetry(alpha,t+h).y-oscillatorSymmetry(alpha,t-h).y)/(2*h),s.py);
 close((oscillatorSymmetry(alpha,t+h).px-oscillatorSymmetry(alpha,t-h).px)/(2*h),-s.x);
 close((oscillatorSymmetry(alpha,t+h).py-oscillatorSymmetry(alpha,t-h).py)/(2*h),-(1+alpha)*s.y);
 if(alpha===0){close(s.lz,1);assert.equal(s.branch,'symmetric');close(s.deltaEnergy,0)}
}
for(const alpha of[0,.02,1])for(let angle=0;angle<=180;angle++){
 const s=oscillatorSymmetry(alpha,1,angle);close(s.rotatedEnergy-s.energy,s.deltaEnergy);
 if(alpha===0)close(s.deltaEnergy,0);
}
assert.equal(oscillatorSymmetry(.02,0).branch,'near');assert.equal(oscillatorSymmetry(1,0).branch,'broken');
close(oscillatorSymmetry(1,0).torque,0); // Zero instantaneous torque does not restore symmetry.
close(oscillatorSymmetry(1,0,45).deltaEnergy,.25);
// Exact analytic bound for this initial condition: |lz| <= 1 for alpha >= 0,
// since lz = cos(t)cos(wt) + sin(t)sin(wt)/w and Cauchy applies.
for(let i=0;i<=100;i++)for(let k=0;k<=100;k++)assert.ok(Math.abs(oscillatorSymmetry(i/50,k/10).lz)<=1+1e-12);
console.log('rotation-symmetry: analytic trajectory, Newton equations, torque, presets and every trial rotation pass');
