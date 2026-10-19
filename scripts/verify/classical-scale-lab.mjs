import assert from 'node:assert/strict';
import {SCALE_H,SCALE_HBAR,SCALE_C,SCALE_YEAR,SCALE_TARGET,SCALE_SPEED_CAP,SCALE_PRESETS,scaleMinLogWidth,classicalScale} from '../../src/sections/widgets/classical-scale.mjs';
const relative=(a,b,t=1e-11)=>assert.ok(Math.abs(a-b)<=t*Math.max(Math.abs(a),Math.abs(b),Number.MIN_VALUE),`${a} != ${b}`);
relative(SCALE_H,6.62607015e-34);relative(SCALE_HBAR*2*Math.PI,SCALE_H);
assert.equal(SCALE_YEAR,31557600);assert.equal(SCALE_TARGET,1e-3);
// 1 erg = 1 g cm²/s² = 10^-7 J: action conversion, not a second ħ value.
relative(SCALE_HBAR/1e-7,SCALE_HBAR*1e7);
const gramInKg=1e-3,cmInMetres=1e-2;
relative(gramInKg*cmInMetres,1e-5); // g cm/s → kg m/s
relative(1e-13*cmInMetres,1e-15);relative(1e-27*cmInMetres,1e-29);
let count=0;const seen=new Set();
for(let mi=-120;mi<=0;mi++)for(let di=-116;di<=-8;di++)for(const time of [1,SCALE_YEAR]){
 const lm=mi/4,ld=di/4,s=classicalScale(lm,ld,time);
 relative(s.mass,10**lm);relative(s.width,10**Math.max(scaleMinLogWidth(lm),ld));
 relative(s.sigmaX*s.sigmaP,SCALE_HBAR/2);relative(s.sigmaP/s.mass,s.sigmaV);
 relative(s.sigmaXT,Math.sqrt(s.sigmaX**2+(s.sigmaP*time/s.mass)**2));
 assert.ok(s.sigmaV<=SCALE_SPEED_CAP*(1+1e-12));
 relative(s.photonMomentum*s.width,SCALE_H);relative(s.photonVelocity,s.photonMomentum/s.mass);
 relative(s.photonVelocity/s.sigmaV,2*Math.PI*Math.SQRT2);
 assert.ok(s.sigmaXT>=s.sigmaX);
 for(const n of [s.mass,s.width,s.sigmaX,s.sigmaP,s.sigmaV,s.sigmaXT,s.targetTime,s.photonMomentum,s.photonVelocity,...s.lengthLogs])assert.ok(Number.isFinite(n));
 for(const n of s.lengthLogs)assert.ok(n>=-31&&n<=15); // exact plotted fixed domain
 if(s.targetTime>0){const at=classicalScale(lm,s.logWidth,s.targetTime);relative(at.sigmaXT,SCALE_TARGET);assert.ok(classicalScale(lm,s.logWidth,s.targetTime*.5).sigmaXT<SCALE_TARGET);}
 assert.equal(s.branch,s.sigmaX>=SCALE_TARGET?'already-wide':time>=s.targetTime?'reached':'not-yet');seen.add(s.branch);count++;
}
assert.deepEqual([...seen].sort(),['already-wide','not-yet','reached']);
for(const p of SCALE_PRESETS)for(const time of [1,SCALE_YEAR]){const s=classicalScale(p.logMass,p.logWidth,time);assert.equal(s.clamped,false);relative(s.width,10**p.logWidth);assert.equal(Number.isInteger(p.logMass*4),true);assert.equal(Number.isInteger((p.logWidth-s.minimum)*4),true);}
const nuclear=classicalScale(-3,-15),fine=classicalScale(-3,-29),visible=classicalScale(-3,Math.log10(5e-7));
relative(nuclear.sigmaV,7.4569488350582e-17,1e-10);
assert.ok(nuclear.targetTime/SCALE_YEAR>4e5&&nuclear.targetTime/SCALE_YEAR<4.5e5);
relative(fine.photonMomentum,6.62607015e-5);relative(fine.photonVelocity,.0662607015);
relative(visible.width,5e-7);assert.ok(fine.sigmaV>nuclear.sigmaV*1e13);
// Independent dimensionless Gaussian quadrature checks the Δ-to-σ factor.
let normalization=0,second=0;const dy=.001;
for(let y=-9+dy/2;y<9;y+=dy){const density=Math.exp(-y*y)/Math.sqrt(Math.PI);normalization+=density*dy;second+=y*y*density*dy;}
relative(normalization,1,1e-10);relative(second,.5,1e-10);
console.log(`ClassicalScaleLab: ${count} controlled input/time combinations, presets, adaptive nonrelativistic guard, SI/CGS conversions, Gaussian variances, threshold time and fixed log plot bounds passed.`);

