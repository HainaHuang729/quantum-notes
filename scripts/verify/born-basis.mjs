import assert from "node:assert/strict";
import { BORN_PRESETS, bornBasisState, normSquared, normalizeState, innerProduct, measurementObservable, measurementDistribution, preparedState } from "../../src/sections/widgets/quantum-measurement.mjs";
const close = (a,b,e=2e-12) => assert.ok(Math.abs(a-b)<e, `${a} != ${b}`);
let checked=0;
// Independent scalar expansion of |sqrt(r) cos(beta) + exp(i phi) sqrt(1-r) sin(beta)|².
for(let ri=0;ri<=20;ri++) for(let pi=-20;pi<=20;pi++) for(let bi=0;bi<=18;bi++) {
  const r=ri/20,phiPi=pi/20,beta=bi*5,c=Math.cos(beta*Math.PI/180),s=Math.sin(beta*Math.PI/180);
  const expected=r*c*c+(1-r)*s*s+2*Math.sqrt(r*(1-r))*c*s*Math.cos(phiPi*Math.PI);
  const result=bornBasisState({r,phiPi,beta,gammaPi:.35});
  close(normSquared(result.state),1);close(result.probabilities[0],expected);close(result.probabilities[1],1-expected);
  close(result.mixture[0],r*c*c+(1-r)*s*s);close(result.mixture.reduce((a,b)=>a+b),1);
  for(const gammaPi of [-1,0,1]) {
    const shifted=bornBasisState({r,phiPi,beta,gammaPi});
    result.probabilities.forEach((v,i)=>close(v,shifted.probabilities[i]));
  }
  result.probabilities.forEach(v=>assert.ok(v>=0&&v<=1));checked++;
}
const branches=["certain-plus","certain-minus","interference","original-basis","certain-plus"];
BORN_PRESETS.forEach((p,i)=>assert.equal(bornBasisState(p).branch,branches[i]));
close(bornBasisState(BORN_PRESETS[0]).probabilities[0],1);
close(bornBasisState(BORN_PRESETS[1]).probabilities[0],0);
close(bornBasisState(BORN_PRESETS[2]).probabilities[0],.5);
assert.equal(bornBasisState({r:.5,phiPi:.05,gammaPi:0,beta:45}).branch,"near-certain");
assert.equal(bornBasisState({r:0,phiPi:1,gammaPi:1,beta:45}).branch,"basis-state");
for(const [beta,r] of [[30,.75],[45,.5],[60,.25]]) {
  for(const gammaPi of [-1,-.5,0,.5,1]) {
    const plus=bornBasisState({r,beta,phiPi:0,gammaPi});
    assert.equal(plus.branch,"certain-plus");close(plus.probabilities[0],1);
    for(const phiPi of [-1,1]) {
      const minus=bornBasisState({r:1-r,beta,phiPi,gammaPi});
      assert.equal(minus.branch,"certain-minus");close(minus.probabilities[0],0);
    }
  }
  assert.notEqual(bornBasisState({r:r+.01,beta,phiPi:0,gammaPi:0}).branch,"certain-plus");
  assert.notEqual(bornBasisState({r,beta,phiPi:.05,gammaPi:0}).branch,"certain-plus");
}
assert.throws(()=>normalizeState([[0,0],[0,0]]));
close(normSquared(normalizeState([[3,0],[0,4]])),1);
assert.deepEqual(innerProduct([[0,1]],[[0,1]]),[1,0]);
// Source example 4.2.1 and our explicitly chosen 45-degree teaching basis.
const state=preparedState(3), distribution=measurementDistribution(state,measurementObservable(3,"B"));
distribution.forEach((v,i)=>close(v,[.5,0,.5][i]));
state.forEach((v,i)=>close(normSquared([v]),[.25,.25,.5][i]));
// Reconstructed Fig. 4.1 coordinates stay inside each 300x240 viewBox.
const point=([x,y,z])=>[145+62*x-42*y,170+24*x+24*y-85*z];
for(const v of [[0,0,0],[1,0,0],[0,1,0],[0,0,1],[Math.SQRT1_2,Math.SQRT1_2,0],[-Math.SQRT1_2,Math.SQRT1_2,0],[.5,.5,Math.SQRT1_2]]) {
  const [x,y]=point(v);assert.ok(x>12&&x<280&&y>12&&y<220);
}
console.log(`Born basis: ${checked} states; global phase, independent scalar probabilities, mixtures, presets and geometry pass.`);
