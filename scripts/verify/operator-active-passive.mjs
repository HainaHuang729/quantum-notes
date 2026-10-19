import assert from 'node:assert/strict';
for(let a=-180;a<=180;a++) for(let p=-180;p<=180;p++){
  const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180),v=[Math.cos(p*Math.PI/180),Math.sin(p*Math.PI/180)];
  const uv=[c*v[0]-s*v[1],s*v[0]+c*v[1]],b00=2*c*c+s*s,b01=-c*s,b11=2*s*s+c*c;
  const bv=[b00*v[0]+b01*v[1],b01*v[0]+b11*v[1]];
  assert.ok(Math.abs((2*uv[0]**2+uv[1]**2)-(v[0]*bv[0]+v[1]*bv[1]))<1e-12);
  assert.ok(Math.abs(b00+b11-3)<1e-12);
  assert.ok(Math.abs(b00*b11-b01*b01-2)<1e-12);
  assert.ok(Math.hypot(...bv)<=2+1e-12);
}
console.log('ActivePassiveWidget: equality, trace, determinant and canvas bounds verified');
