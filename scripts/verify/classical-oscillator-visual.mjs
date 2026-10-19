import assert from 'node:assert/strict';
import {classicalOscillatorVisual} from '../../src/sections/widgets/bound-classical-visual.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let count=0;
for(let ai=0;ai<=20;ai++)for(let wi=5;wi<=20;wi++)for(let degrees=0;degrees<=360;degrees+=15){
 const A=ai/10,omega=wi/10,s=classicalOscillatorVisual(A,omega,degrees),h=1e-4;
 const plus=classicalOscillatorVisual(A,omega,degrees+h*omega*180/Math.PI),minus=classicalOscillatorVisual(A,omega,degrees-h*omega*180/Math.PI);
 close((plus.x-minus.x)/(2*h),s.velocity,3e-8);close((plus.velocity-minus.velocity)/(2*h),-omega*omega*s.x,6e-8);
 close(s.kinetic+s.potential,s.energy);close(s.energy,.5*omega*omega*A*A);close(s.period*omega,2*Math.PI);
 close(s.x*s.x+s.velocity*s.velocity/(omega*omega),A*A);
 assert.equal(s.branch,A===0?'rest':degrees%180===0?'turning':degrees%90===0?'center':'moving');
 for(const [x,v]of s.orbit){assert.ok(Math.abs(x)<2.25&&Math.abs(v)<4.5);close(.5*v*v+.5*omega*omega*x*x,s.energy);}
 const px=270+90*s.x,tip=px+28*s.velocity;assert.ok(px>45&&px<495&&tip>45&&tip<495);
 assert.ok(s.kinetic<=Math.max(.1,1.12*s.energy)&&s.potential<=Math.max(.1,1.12*s.energy));count++;
}
for(const degrees of [0,90,270]) assert.ok(classicalOscillatorVisual(1,1,degrees).energy===.5);
assert.equal(classicalOscillatorVisual(0,1,0).branch,'rest');
console.log(`Classical oscillator visual: ${count} states, independent time derivatives, energy conservation, phase ellipse, all presets and SVG/plot bounds pass.`);
