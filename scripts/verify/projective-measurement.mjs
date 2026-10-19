import assert from "node:assert/strict";
import { normSquared, innerProduct, normalizeState, preparedState, measurementObservable, projectState, measurementDistribution, projectiveMeasurement, measurementSequence, measurementDraw } from "../../src/sections/widgets/quantum-measurement.mjs";
const close=(a,b,e=3e-12)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const same=(a,b)=>a.forEach((z,i)=>z.forEach((v,j)=>close(v,b[i][j])));
let checked=0;
for(const dim of [2,3]) for(const which of ["A","B"]) {
  const obs=measurementObservable(dim,which),vectors=obs.flatMap(o=>o.vectors);
  vectors.forEach((v,i)=>vectors.forEach((w,j)=>{const z=innerProduct(v,w);close(z[0],i===j?1:0);close(z[1],0);}));
  for(let k=0;k<120;k++) {
    const state=normalizeState(Array.from({length:dim},(_,i)=>[Math.cos(k*.13+i),Math.sin(k*.31-i*.7)]));
    const projections=obs.map(o=>projectState(state,o.vectors));
    same(state,state.map((_,i)=>[0,1].map(j=>projections.reduce((sum,p)=>sum+p[i][j],0))));
    obs.forEach((o,i)=>same(projectState(projections[i],o.vectors),projections[i]));
    const probs=measurementDistribution(state,obs);close(probs.reduce((a,b)=>a+b),1);
    // Independent basis coefficient sums, including the degenerate rank-two projector.
    obs.forEach((o,i)=>close(probs[i],o.vectors.reduce((sum,v)=>{const z=innerProduct(v,state);return sum+z[0]**2+z[1]**2;},0)));
    for(const u of [0,.1,.499,.7,.999999]) {
      const result=projectiveMeasurement(state,obs,u);assert.ok(result.probability>0);close(normSquared(result.after),1);
      close(measurementDistribution(result.after,obs)[result.index],1);
      assert.equal(projectiveMeasurement(result.after,obs,.99999).index,result.index);checked++;
    }
  }
  const initial=preparedState(dim),fresh=measurementSequence(initial,obs,10000,2029,true),repeat=measurementSequence(initial,obs,10000,2029,false);
  assert.deepEqual(fresh,measurementSequence(initial,obs,10000,2029,true));
  assert.equal(new Set(repeat.events).size,1);
  measurementDistribution(initial,obs).forEach((p,i)=>close(fresh.counts[i]/10000,p,.025));
  const first=projectiveMeasurement(initial,obs,measurementDraw(2029,0));assert.equal(first.index,fresh.events[0]);
  for(let i=0;i<20;i++) assert.equal(projectiveMeasurement(initial,obs,measurementDraw(2029,i)).index,fresh.events[i]);
}
const A=measurementObservable(2,"A"),B=measurementObservable(2,"B");
measurementDistribution(preparedState(2),A).forEach((p,i)=>close(p,[1/3,2/3][i]));
const afterA=projectiveMeasurement(preparedState(2),A,0).after;
measurementDistribution(afterA,B).forEach(p=>close(p,.5));
const afterB=projectiveMeasurement(afterA,B,0).after;
measurementDistribution(afterB,A).forEach(p=>close(p,.5));
const D=measurementObservable(3,"A"),B3=measurementObservable(3,"B");
const afterD=projectiveMeasurement(preparedState(3),D,0).after;
same(afterD,[[Math.SQRT1_2,0],[Math.SQRT1_2,0],[0,0]]);
measurementDistribution(afterD,B3).forEach((p,i)=>close(p,[1,0,0][i]));
// D and B commute: refining either D eigenspace never changes a known D outcome.
for(const uD of [0,.999]) {
  const d=projectiveMeasurement(preparedState(3),D,uD);
  for(const uB of [0,.3,.7,.999]) {
    const b=projectiveMeasurement(d.after,B3,uB);
    close(measurementDistribution(b.after,D)[d.index],1);
  }
}
// A zero-weight last outcome must not be selected by a valid draw just below one.
assert.equal(projectiveMeasurement(afterD,B3,.999999999).index,0);
// Independent moments for A=+/-1 with source preparation (1/sqrt3,sqrt(2/3)).
const mean=1/3-2/3,variance=(1-mean)**2/3+2*(-1-mean)**2/3;
close(mean,-1/3);close(Math.sqrt(variance),2*Math.SQRT2/3);close(variance,1-mean**2);
// Independent Compton backscatter check, units m=c=hbar=1, initially stationary particle.
for(const omega of [.001,.02,.2,1]) {
  const prime=omega/(1+2*omega),root=Math.sqrt(1+1/(omega*prime));
  const p=-(omega+prime)/2+root*(omega-prime)/2;
  const pp=(omega+prime)/2+root*(omega-prime)/2;
  close(p,0,1e-10);close(pp,omega+prime,1e-10);
  close(Math.sqrt(1+pp*pp),1+omega-prime,1e-10);
}
console.log(`Projective measurement: ${checked} sampled updates; projectors, repeatability, degenerate coherence, seeded ensembles, moments and Compton equations pass.`);
