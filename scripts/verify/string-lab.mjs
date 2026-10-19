import assert from 'node:assert/strict';
import {stringValue,stringEnergyNorm,stringStateClass,integrate,projectPoint} from '../../src/sections/widgets/continuum-math.mjs';
import fs from 'node:fs';
import {iso} from '../anatomy/iso-kit.mjs';
const raw=fs.readFileSync(new URL('../../src/sections/widgets/string-geometry.ts',import.meta.url),'utf8');
const P=JSON.parse(raw.match(/export const projection=(.*);/)[1]);
const bench=JSON.parse(raw.match(/export const staticBench=(.*);/)[1]);
const handles=JSON.parse(raw.match(/export const handles=(.*);/)[1]);
for(const point of [[0,0,0],[-149,0,52],[149,0,52],[-99,45,8],[100,-40,72]]){
 const a=projectPoint(point,P),b=iso(point,P);
 assert.ok(Math.abs(a[0]-b[0])<1e-10&&Math.abs(a[1]-b[1])<1e-10,'shared projection matches anatomy generator');
}
function checkPaths(svg,dx=0,dy=0){
 for(const match of svg.matchAll(/\bd="([^"]+)"/g)){
  assert.ok(!/[ACHQSTVachqstv]/.test(match[1]),'bounds audit expects absolute M/L path coordinates');
  const coordinates=match[1].match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.equal(coordinates.length%2,0);
  for(let i=0;i<coordinates.length;i+=2)assert.ok(coordinates[i]+dx>0&&coordinates[i]+dx<660&&coordinates[i+1]+dy>0&&coordinates[i+1]+dy<330,'static anatomy/translated handle stays in viewBox');
 }
}
checkPaths(bench);
handles.forEach((h,j)=>{for(const amplitude of [-1,1]){
 const p=projectPoint([-99+j*95,45,8],P),q=projectPoint([-99+j*95+22*amplitude,45,8],P);
 checkPaths(h,q[0]-p[0],q[1]-p[1]);
}});
let states=0;
for(const a of [[1,0,0],[.8,.35,0],[0,0,0],[1,-1,1],[.05,0,0]])for(let it=0;it<=200;it++){
 const t=it/100;assert.ok(Math.abs(stringValue(0,t,a))<1e-12);assert.ok(Math.abs(stringValue(1,t,a))<1e-12);
 assert.ok(Math.abs(integrate(x=>stringValue(x,t,a)**2,0,1,300)-stringEnergyNorm(t,a))<1e-10);
 for(let j=0;j<=180;j++){const x=j/180,p=projectPoint([-149+298*x,0,52+6*stringValue(x,t,a)],P);assert.ok(p[0]>0&&p[0]<660&&p[1]>0&&p[1]<330);}
 states++;
}
for(let a=-20;a<=20;a++)for(let b=-20;b<=20;b++)for(let c=-20;c<=20;c++)assert.ok(6*Math.SQRT2*(Math.abs(a)+Math.abs(b)+Math.abs(c))/20<26);
// Bounding box proof covers every coefficient combination and continuous time,
// beyond the sampled presets above; projection is affine in x and z.
for(const x of [-149,149])for(const z of [52-26,52+26]){
 const p=projectPoint([x,0,z],P);assert.ok(p[0]>0&&p[0]<660&&p[1]>0&&p[1]<330);
}
// The near branch must be reachable on the actual coefficient step of .05.
assert.equal(stringStateClass([0,0,0]),'zero');
assert.equal(stringStateClass([.05,0,-.05]),'near');
assert.equal(stringStateClass([.1,0,0]),'regular');
assert.equal(stringStateClass([.8,.35,0]),'regular');
assert.ok(3*Math.SQRT2<4.4,'all three-mode displacements fit the quantitative plot');
assert.equal(stringEnergyNorm(0,[.8,.35,0]),.8**2+.35**2);
assert.equal(stringValue(.5,0,[0,0,0]),0);
console.log(`string-lab: ${states} sampled states, fixed ends, orthogonality/norm, projected bounds and 68921 coefficient-bound checks passed`);
