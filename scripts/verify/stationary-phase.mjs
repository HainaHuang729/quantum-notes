import assert from "node:assert/strict";
import {PATH_A,PATH_N,PHASE_PRESETS,pathAt,deltaAction,familyMean,stationaryState,shiftPath} from "../../src/sections/widgets/stationary-phase.mjs";
const close=(a,b,e=2e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b} tolerance ${e}`);
function midpoint(f,l,r,n=32768){let s=0;const h=(r-l)/n;for(let j=0;j<n;j++)s+=f(l+(j+.5)*h);return s*h;}
// Calculate kinetic action from the actual path velocity, independently of ΔS.
for(let k=-30;k<=30;k++){
 const a=k/20,S=midpoint(t=>(1+a*Math.PI*Math.cos(Math.PI*t))**2/2,0,1,12000);
 close(S,.5+deltaAction(a));close(pathAt(0,a),0);close(pathAt(1,a),1);
 const h=1e-4,dS=(midpoint(t=>(1+(a+h)*Math.PI*Math.cos(Math.PI*t))**2/2,0,1,2000)-midpoint(t=>(1+(a-h)*Math.PI*Math.cos(Math.PI*t))**2/2,0,1,2000))/(2*h);
 close(dS,Math.PI**2*a/2,2e-8);
 for(let j=0;j<=400;j++){const t=j/400,q=pathAt(t,a);assert.ok(q>=-1.6&&q<=2.6);}
}
close((deltaAction(.001)-deltaAction(-.001))/.002,0);
close(deltaAction(.02),4*deltaAction(.01));
let maxError=0,count=0;
for(let hi=2;hi<=40;hi++){
 const hbar=hi/20,r=familyMean(hbar),fine=familyMean(hbar,PATH_N*8);
 const re=midpoint(a=>Math.cos(deltaAction(a)/hbar),-PATH_A,PATH_A)/(2*PATH_A);
 const im=midpoint(a=>Math.sin(deltaAction(a)/hbar),-PATH_A,PATH_A)/(2*PATH_A);
 close(r.re,re,3e-8);close(r.im,im,3e-8);close(r.re,fine.re,3e-8);close(r.im,fine.im,3e-8);
 maxError=Math.max(maxError,Math.abs(r.re-re),Math.abs(r.im-im));
 for(const [x,y] of r.curve){assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(Math.abs(x)<=1.2&&Math.abs(y)<=1.2);assert.ok(Math.hypot(x,y)<=1+1e-12);}
 assert.ok(r.modulus<=1+1e-12);
 for(let ai=-30;ai<=30;ai++){
  const a=ai/20,s=stationaryState({a,hbar});
  close(s.phase,Math.PI**2*a*a/(4*hbar));close(s.phasor[0]**2+s.phasor[1]**2,1);
  assert.equal(s.branch,a===0?"stationary":s.phase<1?"slow":"rotating");
  close(s.slope,Math.PI**2*a/(2*hbar));close(s.mean.re,r.re);close(s.mean.im,r.im);count++;
 }
}
// Verify actual native-range presets, not just mathematical states.
PHASE_PRESETS.forEach((p,i)=>{
 assert.equal(stationaryState(p).branch,["rotating","slow","stationary"][i]);
 assert.ok(p.a>=-1.5&&p.a<=1.5&&p.hbar>=.1&&p.hbar<=2);
 close((p.a+1.5)/.05,Math.round((p.a+1.5)/.05));
 close((p.hbar-.1)/.05,Math.round((p.hbar-.1)/.05));
});
assert.equal(stationaryState({a:.05,hbar:2}).branch,"slow");
assert.equal(shiftPath(-1.5,-1),-1.5);assert.equal(shiftPath(1.5,1),1.5);assert.equal(shiftPath(0,-1),-.05);assert.equal(shiftPath(.05,-1),0);
for(let a=-30;a<=30;a++)for(const sign of [-1,1])assert.equal(shiftPath(a/20,sign),Math.min(30,Math.max(-30,a+sign))/20);
// Source paths t and t² have action1/2 and2/3 at m=1.
close(midpoint(t=>.5,0,1),.5);close(midpoint(t=>2*t*t,0,1),2/3,1e-9);
console.log(`Stationary phase: ${count} control states; path-action derivatives, ${39} independent midpoint/fine-Simpson means, presets/step/plot bounds pass; max quadrature discrepancy ${maxError}.`);
