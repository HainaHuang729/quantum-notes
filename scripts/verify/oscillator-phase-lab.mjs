import assert from 'node:assert/strict';
import {oscillatorPhaseState} from '../../src/sections/widgets/mechanics-coordinates.mjs';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(let im=1;im<=6;im++)for(let ik=1;ik<=6;ik++)for(let ia=0;ia<=40;ia++)for(let d=0;d<=360;d++){
 const m=im/2,k=ik/2,a=ia/20,s=oscillatorPhaseState(m,k,a,d);
 close(s.energy,.5*k*a*a);close(s.qdot,s.p/m);close(s.pdot,-k*s.q);
 assert.ok(210+75*s.q>=60&&210+75*s.q<=360);assert.ok(170-21*s.p>=44&&170-21*s.p<=296);
 assert.equal(s.branch,a===0?'zero':a<=.1?'near':'regular');
}
for(const d of [0,90,360]){const s=oscillatorPhaseState(1,1,1,d),h=1e-4;
 const left=oscillatorPhaseState(1,1,1,d-h*180/Math.PI),right=oscillatorPhaseState(1,1,1,d+h*180/Math.PI);
 close((right.q-left.q)/(2*h),s.qdot,2e-8);close((right.p-left.p)/(2*h),s.pdot,2e-8);
}
for(const [m,k,a,d] of [[2,.5,1.5,37],[.5,3,.2,121],[3,2,2,240]]){
 const s=oscillatorPhaseState(m,k,a,d),h=1e-5,step=h*s.omega*180/Math.PI;
 const left=oscillatorPhaseState(m,k,a,d-step),right=oscillatorPhaseState(m,k,a,d+step);
 close((right.q-left.q)/(2*h),s.qdot,2e-8);
 close((right.p-left.p)/(2*h),s.pdot,2e-8);
}
assert.equal(oscillatorPhaseState(1,1,0,0).branch,'zero');assert.equal(oscillatorPhaseState(1,1,.05,0).branch,'near');
console.log('OscillatorPhaseLab: all 532836 slider states, energy, Hamilton flow, presets, zero/near/regular and SVG bounds pass');
