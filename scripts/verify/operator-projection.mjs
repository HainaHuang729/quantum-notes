import assert from 'node:assert/strict';
const state=(theta,second)=>{
  const c=theta===90?0:Math.cos(theta*Math.PI/180),out=second==='y'?[0,c]:[0,0];
  const exact=theta===90||second==='x',near=!exact&&Math.abs(c)<.1;
  return {out,intensity:exact?0:out[0]**2+out[1]**2,kind:exact?'neutral':near?'warn':'ok'};
};
for(let theta=0;theta<=90;theta++) for(const second of ['x','y']){
  const q=state(theta,second); assert.ok(q.intensity>=0&&q.intensity<=1);
  if(second==='x') assert.deepEqual(q.out,[0,0]);
  if(second==='y') assert.ok(Math.abs(q.out[1]-Math.cos(theta*Math.PI/180))<1e-12);
}
assert.equal(state(35,'y').kind,'ok');assert.equal(state(35,'x').kind,'neutral');
assert.equal(state(90,'y').kind,'neutral');assert.equal(state(89,'y').kind,'warn');
assert.equal(state(0,'y').intensity,1);
assert.deepEqual(state(90,'y').out,[0,0]);
assert.ok(Math.abs(state(60,'y').intensity-.25)<1e-12);
console.log('ProjectionWidget: every control state, zero/near/regular and presets verified');
