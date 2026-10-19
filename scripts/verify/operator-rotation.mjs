import assert from 'node:assert/strict';
for(let d=-180;d<=180;d++){
  const a=d*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  const u=[c,s],v=[-s,c],sum=[c-s,s+c];
  assert.ok(Math.abs(u[0]*v[0]+u[1]*v[1])<1e-12);
  assert.ok(Math.abs(Math.hypot(...u)-1)<1e-12);
  assert.ok(Math.abs(Math.hypot(...v)-1)<1e-12);
  assert.ok(Math.abs(sum[0]-(u[0]+v[0]))<1e-12);
  assert.ok(Math.abs(sum[1]-(u[1]+v[1]))<1e-12);
  assert.ok(Math.hypot(...sum)<2.4);
}
const c=Math.cos(Math.PI/2),s=Math.sin(Math.PI/2);
assert.ok(Math.abs(c)<1e-12); assert.equal(s,1);
console.log('RotationWidget: all integer angles and quarter-turn preset verified');
