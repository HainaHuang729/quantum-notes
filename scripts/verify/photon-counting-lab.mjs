import assert from 'node:assert/strict';
import {PHOTON_BINS,PHOTON_DX,PHOTON_LEFT,PHOTON_RIGHT,photonWeight,photonDistribution,photonCounts,photonSampleBin} from '../../src/sections/widgets/photon-counting.mjs';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
// Independent midpoint integration uses a different quadrature and global mesh.
function midpoint(f,a,b,n=100000){let s=0;const h=(b-a)/n;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h);return s*h;}
for(const mode of ['coherent','incoherent']){
 const d=photonDistribution(mode);assert.equal(d.probabilities.length,PHOTON_BINS);
 close(d.probabilities.reduce((a,b)=>a+b,0),1);close(d.cdf.at(-1),1);
 close(d.normalization,midpoint(x=>photonWeight(x,mode),PHOTON_LEFT,PHOTON_RIGHT),1e-8);
 assert.ok(d.probabilities.every(p=>p>0));
 close(d.probabilities[0],d.probabilities.at(-1));assert.equal(photonSampleBin(0,d),0);assert.equal(photonSampleBin(1-Number.EPSILON,d),80);
 for(const seed of [2027,2028,0])for(const n of [0,1,10,100,1000]){
  const a=photonCounts(mode,n,seed),b=photonCounts(mode,n,seed);
  assert.deepEqual(a,b);assert.equal(a.counts.reduce((s,c)=>s+c,0),n);assert.equal(a.events.length,n);
  assert.equal(a.branch,n===0?'empty':n<100?'few':'many');
  assert.ok(a.events.every(i=>Number.isInteger(i)&&i>=0&&i<81));
  const prefix=photonCounts(mode,n+10,seed);assert.deepEqual(prefix.events.slice(0,n),a.events);
  const observed=a.counts.map(c=>n?c/(n*PHOTON_DX):0),expected=d.probabilities.map(p=>p/PHOTON_DX),yMax=Math.max(.65,...observed.map(v=>1.1*v),...expected.map(v=>1.1*v));
  assert.ok([...observed,...expected].every(v=>215-170*v/yMax>=45&&215-170*v/yMax<=215));
 }
 const many=photonCounts(mode,100000,2027),tv=d.probabilities.reduce((s,p,i)=>s+Math.abs(many.counts[i]/100000-p),0)/2;
 assert.ok(tv<.02,'large seeded sample agrees with normalized distribution');
}
const coherent=photonDistribution('coherent'),incoherent=photonDistribution('incoherent');
for(const j of [10,30,50,70]){
 close(photonWeight(coherent.centers[j],'coherent'),0,1e-12);
 assert.ok(coherent.probabilities[j]>0,'finite dark bin is not a zero-width point');
 assert.ok(coherent.probabilities[j]<.01*incoherent.probabilities[j],'finite bins around nodes strongly suppress counts');
}
assert.notDeepEqual(photonCounts('coherent',1000,2027).events,photonCounts('coherent',1000,2028).events);
assert.notDeepEqual(coherent.probabilities,incoherent.probabilities);
console.log('PhotonCountingLab: two normalized densities, independent quadrature, all count/seed presets, prefixes, finite dark bins and plot bounds pass');
