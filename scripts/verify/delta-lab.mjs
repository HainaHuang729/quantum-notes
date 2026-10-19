import assert from 'node:assert/strict';
import {gaussian,gaussianMean,integrate,testFunction} from '../../src/sections/widgets/continuum-math.mjs';
let cases=0;
for(let iw=0;iw<=44;iw++)for(let ic=0;ic<=40;ic++){
 const w=.12+iw*.02,c=-1+ic*.05;
 assert.ok(Math.abs(integrate(x=>gaussian(x,c,w),-10,10)-1)<1e-10);
 assert.ok(Math.abs(integrate(x=>gaussian(x,c,w)*testFunction(x),-10,10)-gaussianMean(c,w))<1e-9);
 assert.ok(Math.abs(gaussianMean(c,w)-testFunction(c)-w*w/2)<1e-12);
 assert.ok(gaussian(c,c,w)<10.5);cases++;
}
assert.ok(gaussianMean(.3,.12)-testFunction(.3)<gaussianMean(.3,.5)-testFunction(.3));
console.log(`delta-lab: ${cases} control states, normalization/mean/exact error/plot height passed`);
