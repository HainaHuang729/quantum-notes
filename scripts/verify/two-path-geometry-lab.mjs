import assert from 'node:assert/strict';
import {twoPathGeometry,geometryWindow} from '../../src/sections/widgets/chapter5-late.mjs';
const close=(a,b,t=2e-11)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let count=0;
for(let wi=2;wi<=20;wi++)for(let gi=2;gi<=12;gi++)for(let d=1;d<=20;d++){
 const wave=wi/10,gap=gi/4;
 for(let yi=-40;yi<=40;yi++){
  const y=yi/10,r=twoPathGeometry(y,wave,gap,d);
  const ru=Math.sqrt(d*d+(y-gap/2)**2),rl=Math.sqrt(d*d+(y+gap/2)**2),k=2*Math.PI/wave;
  // Independent complex wave addition with individual path phases.
  const re=(d/ru*Math.cos(k*ru)+d/rl*Math.cos(k*rl))/2;
  const im=(d/ru*Math.sin(k*ru)+d/rl*Math.sin(k*rl))/2;
  close(r.intensity,re*re+im*im);close(r.pathDifference,rl-ru);
  assert.ok(r.intensity>=-1e-12&&r.intensity<=1+1e-12);
  assert.ok(r.approximate>=0&&r.approximate<=1);
  close(twoPathGeometry(-y,wave,gap,d).intensity,r.intensity);
  assert.ok(y>=-4&&y<=4); // marker and curves inside actual Plot domains
  count++;
 }
 const w=geometryWindow(wave,gap,d);
 assert.ok(w.normalizer>0&&w.normalizer<=8);
 assert.ok(w.centerProbability>=0&&w.centerProbability<=1);
 assert.equal(w.branch,w.edgeError<.1?'accurate':'noticeable');
 close(twoPathGeometry(-4,wave,gap,d).error,w.edgeError);
}
// Independently use composite Simpson on the finite conditional window,
// rather than the model's midpoint rule.
function simpson(f,l,r,n=20000){const h=(r-l)/n;let s=f(l)+f(r);for(let j=1;j<n;j++)s+=(j%2?4:2)*f(l+j*h);return s*h/3;}
for(const [wave,gap,d] of [[.5,1,20],[.5,3,1],[.2,3,1],[2,.5,20]]){
 const f=y=>twoPathGeometry(y,wave,gap,d).intensity,w=geometryWindow(wave,gap,d);
 const norm=simpson(f,-4,4);
 close(w.normalizer,norm,8e-6);
 close(w.centerProbability,simpson(f,-.25,.25)/norm,2e-6);
 close(simpson(y=>f(y)/w.normalizer,-4,4),1,5e-6);
}
assert.equal(geometryWindow(.5,1,20).branch,'accurate');
assert.equal(geometryWindow(.5,3,1).branch,'noticeable');
const far=twoPathGeometry(2,.5,1,20),short=twoPathGeometry(2,.25,1,20);
close(short.error,2*far.error);
close(twoPathGeometry(0,.5,1,20).phase,0);
console.log(`TwoPathGeometryLab: ${count} controlled points, independent complex addition, conditional-window quadrature, presets and plot bounds pass`);
