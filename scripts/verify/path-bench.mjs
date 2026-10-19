import assert from 'node:assert/strict';
import fs from 'node:fs';
import {iso} from '../anatomy/iso-kit.mjs';
import {pathAt,deltaAction} from '../../src/sections/widgets/stationary-phase.mjs';
import {projectPoint} from '../../src/sections/widgets/continuum-math.mjs';
const text=fs.readFileSync(new URL('../../src/sections/widgets/path-bench-geometry.ts',import.meta.url),'utf8');
const parse=name=>JSON.parse(text.match(new RegExp(`export const ${name}=(.*);`))[1]);
const P=parse('projection'),nodes=parse('carriages');
assert.equal(parse('parts'),68);assert.equal(nodes.length,5);
function bounds(svg,dx=0,dy=0){for(const m of svg.matchAll(/\bd="([^"]+)"/g)){const p=m[1].match(/-?\d+(?:\.\d+)?/g)?.map(Number)??[];assert.equal(p.length%2,0);for(let j=0;j<p.length;j+=2){assert.ok(p[j]+dx>0&&p[j]+dx<660);assert.ok(p[j+1]+dy>0&&p[j+1]+dy<360);}}}
bounds(parse('staticBench'));bounds(parse('fixtures'));
let states=0;
for(let j=-14;j<=14;j++){
 const a=j*.05;assert.ok(Math.abs(pathAt(0,a))<1e-12);assert.ok(Math.abs(pathAt(1,a)-1)<1e-12);
 // Independent midpoint integration of m qdot²/2, not a rearranged analytic formula.
 let numericS=0;const n=20000;
 for(let i=0;i<n;i++){const t=(i+.5)/n,v=1+a*Math.PI*Math.cos(Math.PI*t);numericS+=v*v/(2*n);}
 assert.ok(Math.abs(numericS-.5-deltaAction(a))<1e-11);
 for(let i=0;i<=200;i++){
  const t=i/200,q=pathAt(t,a);assert.ok(q>-.4&&q<1.4);
  const world=[-150+300*t,-65+100*q,10],p=projectPoint(world,P),k=iso(world,P);
  assert.ok(Math.hypot(p[0]-k[0],p[1]-k[1])<1e-10);assert.ok(p[0]>0&&p[0]<660&&p[1]>0&&p[1]<360);
 }
 for(const {t,art,origin} of nodes){const delta=projectPoint([0,100*a*Math.sin(Math.PI*t),0],P),z=projectPoint([0,0,0],P);bounds(art,delta[0]-z[0],delta[1]-z[1]);const current=projectPoint([-150+300*t,-65+100*pathAt(t,a),10],P);assert.ok(Math.hypot(current[0]-origin[0]-(delta[0]-z[0]),current[1]-origin[1]-(delta[1]-z[1]))<1e-10);}
 assert.ok(Math.abs(deltaAction(a)-deltaAction(-a))<1e-12);states++;
}
for(const a of [-.6,0,.6])assert.ok(a===0?deltaAction(a)===0:deltaAction(a)>0);
console.log(`path-bench: ${states} slider states, 68 solids, 3 presets, independent action integration, fixed endpoints, all projected bounds and shared node/curve coordinates passed`);
