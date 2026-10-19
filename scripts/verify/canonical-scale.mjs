import assert from 'node:assert/strict';
import {scalingState} from '../../src/sections/widgets/canonical-symmetry-math.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12);
for(let ia=10;ia<=40;ia++)for(let ib=10;ib<=40;ib++)for(const constrained of[true,false]){
 const a=ia/20,b=ib/20,s=scalingState(a,b,constrained);
 close(s.area,s.a*s.b);close(s.bracket,s.a*s.b);assert.ok(s.area>0);
 if(constrained){close(s.bracket,1);assert.equal(s.branch,'canonical')}
 else if(b===1/a)assert.equal(s.branch,'canonical');
 else if(Math.abs(a*b-1)<.06)assert.equal(s.branch,'near');else assert.equal(s.branch,'noncanonical');
 // Hamilton vector field in new variables has the canonical coefficients only at ab=1.
 const q=.7,p=-.4,Q=a*q,P=s.b*p;
 close(a*p,s.bracket*(P/(s.b*s.b)));
 close(-s.b*q,-s.bracket*(Q/(a*a)));
}
assert.equal(scalingState(2,1,true).branch,'canonical');
assert.equal(scalingState(1,1.05,false).branch,'near');
assert.equal(scalingState(2,2,false).branch,'noncanonical');
console.log('canonical-scale: all controls, presets, bracket, area and Hamilton coefficient checks pass');
