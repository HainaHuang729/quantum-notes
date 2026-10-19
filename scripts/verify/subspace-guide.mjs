import assert from 'node:assert/strict';
import { subspaceGuide } from '../../src/sections/widgets/math-visual-guides.mjs';
const close = (a,b)=>assert.ok(Math.abs(a-b)<3e-12,`${a} != ${b}`);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
let count=0;
for(let angle=-80;angle<=80;angle+=10) for(let j=-8;j<=8;j++) for(const shifted of [false,true]) {
  const scale=j/4,s=subspaceGuide(angle,scale,shifted);
  close(dot(s.u,s.u),1);close(dot(s.n,s.u),0);close(dot(s.u,s.residual),0);
  for(let k=0;k<2;k++)close(s.projection[k]+s.residual[k],s.v[k]);
  close(dot(s.n,s.point),shifted?1:0);
  close(Math.abs(dot(s.n,s.scaled)-(shifted?1:0)),s.distance);
  close(Math.abs(dot(s.n,s.point.map(x=>2*x))-(shifted?1:0)),s.sumDistance);
  assert.ok([s.point,s.scaled,s.projection,s.v].flat().every(x=>Math.abs(x)<4.5));
  count++;
}
assert.equal(subspaceGuide(30,1,true).distance,0);
assert.equal(subspaceGuide(30,1,true).sumDistance,1);
assert.equal(subspaceGuide(30,-1,true).distance,2);
assert.equal(subspaceGuide(30,0,false).distance,0);
console.log(`subspace-guide: ${count} control states, projection orthogonality, zero/negative scaling, affine counterexample and bounds passed`);
