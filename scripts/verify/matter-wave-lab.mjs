import assert from 'node:assert/strict';
import {MATTER_H,MATTER_HBAR,MATTER_SCREEN,MATTER_SLIT,MATTER_BIN_COUNT,matterWaveState,matterBinIntensity} from '../../src/sections/widgets/matter-wave-math.mjs';
const close=(a,b,rel=1e-10)=>assert.ok(Math.abs(a-b)<=rel*Math.max(1e-300,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
close(MATTER_H,2*Math.PI*MATTER_HBAR);
assert.equal(MATTER_BIN_COUNT,30);
// h has units g cm²/s; p has g cm/s; h/p has cm and d/a is dimensionless.
const hDimensions=[1,2,-1],pDimensions=[1,1,-1];
assert.deepEqual(hDimensions.map((x,i)=>x-pDimensions[i]),[0,1,0]);
for(let iu=-220;iu<=0;iu++)for(let iv=-40;iv<=-10;iv++){
 const s=matterWaveState(iu/10,iv/10);
 close(s.wavelength*s.momentum,MATTER_H);close(s.spacing/s.wavelength,MATTER_SCREEN/MATTER_SLIT);
 assert.ok(s.resolution>0&&s.spacing>0&&Number.isFinite(s.visibility));
 assert.ok(Math.abs(s.visibility)<=Math.min(1,1/(Math.PI*s.ratio))+1e-12);
 for(let k=0;k<MATTER_BIN_COUNT;k++){const I=matterBinIntensity(s,k-(MATTER_BIN_COUNT-1)/2);assert.ok(I>=-1e-12&&I<=2+1e-12)}
 const doubled=matterWaveState(iu/10+Math.log10(2),iv/10);close(doubled.wavelength,s.wavelength/2);
}
assert.equal(matterWaveState(-20,-3).branch,'resolved');
assert.equal(matterWaveState(-19,-3).branch,'transition');
assert.equal(matterWaveState(0,-3).branch,'averaged');
const pellet=matterWaveState(0,-3);assert.ok(pellet.wavelength>1e-27&&pellet.wavelength<1e-26);assert.ok(Math.abs(pellet.visibility)<1e-18);
assert.ok(1e-13/pellet.wavelength>1e13&&1e-13/pellet.wavelength<1e14);
// A fine pixel is not enough when the finite display window spans less than a fringe.
const narrow=matterWaveState(-22,-4);
assert.equal(narrow.branch,'resolved');assert.ok(MATTER_BIN_COUNT*narrow.ratio<1);
const tinyWindow=Array.from({length:MATTER_BIN_COUNT},(_,k)=>matterBinIntensity(narrow,k-(MATTER_BIN_COUNT-1)/2));
assert.ok(Math.min(...tinyWindow)>1.99);
assert.ok(Math.abs(narrow.visibility)>.99); // Equal-looking bins are not loss of interference visibility.
const wide=matterWaveState(-20,-3);assert.ok(MATTER_BIN_COUNT*wide.ratio>1);
// Independently integrate an ideal fringe over one pixel, resolved and transitional cases.
for(const [u,v]of[[-20,-3],[-19,-3],[-18.5,-3]]){
 const s=matterWaveState(u,v),N=20000;
 for(const center of[-2.5,0,.5]){
  let sum=0;for(let j=0;j<N;j++){const x=(center-.5+(j+.5)/N)*s.resolution;sum+=1+Math.cos(2*Math.PI*x/s.spacing)}
  assert.ok(Math.abs(sum/N-matterBinIntensity(s,center))<2e-8);
 }
}
console.log('matter-wave-lab: all slider states, units, source pellet scale, inverse momentum and independent bin integrals pass');
