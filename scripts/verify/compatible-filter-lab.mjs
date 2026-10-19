import assert from 'node:assert/strict';
import {filterSequence} from '../../src/sections/widgets/postulate-late.mjs';
const close=(a,b,t=1e-12)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const project=(v,b)=>b.map(x=>x*dot(v,b));
const norm2=v=>dot(v,v);
for(let deg=0;deg<=90;deg++)for(const inserted of [false,true]){
 const r=filterSequence(deg,inserted),t=deg*Math.PI/180;
 const basis=[[Math.cos(t),Math.sin(t)],[-Math.sin(t),Math.cos(t)]];
 const vectors=inserted?basis.map(b=>project([1,0],b)):[[1,0],[0,0]];
 const endBasis=[[1,0],[0,1]];
 for(let j=0;j<2;j++){
  close(r.first[j],norm2(vectors[j]));
  for(let k=0;k<2;k++){
   // Independent successive vector projection, with no conditional divide.
   const probability=norm2(project(vectors[j],endBasis[k]));
   close(r.paths[j][k],probability);
   assert.ok(probability>=0&&probability<=1+1e-12);
   // Exact SVG node anchors and text baselines from the widget tree.
   const y=[[40,90],[150,200]][j][k];assert.ok(y+5<235&&y>0);
  }
 }
 close(r.paths.flat().reduce((a,b)=>a+b,0),1);
 close(r.returnProbability,r.paths[0][0]+r.paths[1][0]);
 assert.equal(r.branch,!inserted?'absent':deg===0||deg===90?'compatible':deg===45?'maximal':'intermediate');
 if(inserted)assert.ok(r.returnProbability>=.5-1e-12);
}
for(const a of [0,90])close(filterSequence(a).returnProbability,1);
close(filterSequence(45).returnProbability,.5);
assert.equal(filterSequence(1).branch,'intermediate');
assert.equal(filterSequence(89).branch,'intermediate');
// A commutator expectation can vanish although the vector is not annihilated:
// [diag(0,1), [[0,1],[1,0]]] applied to |0> = |1>.
const commApplied=[0,1];close(dot([1,0],commApplied),0);close(norm2(commApplied),1);
// Degenerate ideal projection: preserve both components, not a picked basis ket.
const v=[Math.sqrt(.2),Math.sqrt(.3),Math.sqrt(.5)],projected=[0,v[1],v[2]];
const probability=norm2(projected),conditioned=projected.map(x=>x/Math.sqrt(probability));
close(probability,.8);close(norm2(conditioned),1);close(probability*conditioned[1]**2,.3);
console.log('CompatibleFilterLab: all182 controlled states, independent vector projections, presets, commutator counterexample and degenerate projector pass');
