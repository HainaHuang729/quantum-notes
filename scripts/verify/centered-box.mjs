import assert from "node:assert/strict";
import {boxEigen,boxEnergy,boxCrossX,boxState,BOX_PRESETS,boxEnergyReference} from "../../src/sections/widgets/free-box-math.mjs";
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
function quad(f,a,b,n=10000){const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h);return s*h;}
let checked=0;
for(const L of [1,1.7,2,4])for(let n=1;n<=7;n++){
  close(quad(x=>boxEigen(n,L,x)**2,-L/2,L/2),1);
  assert.equal(boxEigen(n,L,L/2),0);assert.equal(boxEigen(n,L,-L/2),0);assert.equal(boxEigen(n,L,L),0);
  close(boxEnergy(n,2*L),boxEnergy(n,L)/4);
  close(quad(x=>x*x*boxEigen(n,L,x)**2,-L/2,L/2),L*L*(1/12-1/(2*Math.PI**2*n*n)),2e-8);
  for(let m=1;m<=7;m++)close(quad(x=>boxEigen(n,L,x)*boxEigen(m,L,x),-L/2,L/2),n===m?1:0);
  const h=L*1e-5,x=.17*L,psi=boxEigen(n,L,x),second=(boxEigen(n,L,x+h)-2*psi+boxEigen(n,L,x-h))/(h*h);
  close(-second/2,boxEnergy(n,L)*psi,2e-4);
  if(n<7)close(quad(x=>x*boxEigen(n,L,x)*boxEigen(n+1,L,x),-L/2,L/2),boxCrossX(n,L),1e-9);
}
for(const L of [1,2,4])for(const n of [1,2,4,6])for(const weight of [0,.2,.5,.95,1])for(const phasePi of [-1,-.3,0,.5,1])for(const time of [0,.2,1,4]){
  const p={L,n,weight,phasePi,time},s=boxState(p);
  close(quad(s.density,-L/2,L/2),1);
  const mean=quad(x=>x*s.density(x),-L/2,L/2);close(mean,s.mean,1e-9);
  close(quad(x=>(x-mean)**2*s.density(x),-L/2,L/2),s.sigmaX**2,2e-8);
  const next=boxState({...p,time:time+s.period});
  for(const x of [-.4,-.17,0,.21,.44].map(q=>q*L)){
    close(s.density(x),next.density(x));assert.ok(s.density(x)>=-1e-13);
    if(weight===0||weight===1)close(s.density(x),boxState({...p,time:0}).density(x));
  }
  close(s.energy,weight*boxEnergy(n,L)+(1-weight)*boxEnergy(n+1,L));
  assert.equal(s.branch,weight===0||weight===1?"stationary":"beating");checked++;
}
BOX_PRESETS.forEach((p,i)=>assert.equal(boxState(p).branch,i===0?"stationary":"beating"));
close(boxState(BOX_PRESETS[2]).theta,Math.PI/2);
close(boxCrossX(1,2),32/(9*Math.PI**2));
// Independent pointwise complex amplitudes, not the expanded cross-term formula.
const p={L:2.2,n:2,weight:.35,time:.7,phasePi:.4},s=boxState(p),x=.2;
const a=Math.sqrt(p.weight)*boxEigen(p.n,p.L,x),b=Math.sqrt(1-p.weight)*boxEigen(p.n+1,p.L,x);
const an=-boxEnergy(p.n,p.L)*p.time,bn=-boxEnergy(p.n+1,p.L)*p.time-p.phasePi*Math.PI;
close(s.density(x),(a*Math.cos(an)+b*Math.cos(bn))**2+(a*Math.sin(an)+b*Math.sin(bn))**2);
// Fixed-reference HTML gauge is independent of the auto-scaled ladder.
// Percentage widths remain within the container at every reachable L/n.
for(let li=10;li<=40;li++)for(let n=1;n<=6;n++){
  const L=li/10,r=boxEnergyReference(n,L);
  close(r.reference,boxEnergy(n,1));close(r.ratio,1/(L*L));
  close(boxEnergyReference(n,2*L).ratio,r.ratio/4);
  assert.ok(100*r.ratio>=6.25&&100*r.ratio<=100);
  for(let level=1;level<=7;level++){
    const y=267-225*boxEnergy(level,L)/boxEnergy(7,L);
    assert.ok(y>=42-1e-12&&y+4<267);
  }
}
// Finite-well first odd threshold: alpha=pi/2 touches beta=0;
// a square-integrable tail requires strictly positive kappa, hence strictly
// larger depth. The even lowest branch crosses for every positive depth.
const threshold=Math.PI**2/8;
close(Math.sqrt(2*threshold),Math.PI/2);
assert.ok(Math.sqrt(2*(threshold*.99))<Math.PI/2);
assert.ok(Math.sqrt(2*(threshold*1.01))>Math.PI/2);
for(const radius of [.01,.1,1,3]){
 const residual=alpha=>alpha*Math.tan(alpha)-Math.sqrt(Math.max(0,radius*radius-alpha*alpha));
 assert.ok(residual(0)<0);
 const hi=Math.min(radius,Math.PI/2-1e-8);
 assert.ok(residual(hi)>0);
}
console.log(`Centered box: ${checked} preparations; orthogonality, boundaries, eigen-equation, independent complex amplitudes/moments and beating pass.`);
