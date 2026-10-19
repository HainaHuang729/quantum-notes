import assert from 'node:assert/strict';
import {gaussianSquareMoment} from '../../src/sections/widgets/bound-classical-visual.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function integral(f,a,b,n=16000){const h=(b-a)/n;let sum=0;for(let i=0;i<n;i++)sum+=f(a+(i+.5)*h);return sum*h;}
let count=0;
for(let ai=-20;ai<=20;ai++)for(let di=4;di<=20;di++){
 const mu=ai/10,delta=di/10,s=gaussianSquareMoment(mu,delta),a=mu-8*delta,b=mu+8*delta;
 close(integral(s.density,a,b),1);close(integral(x=>x*s.density(x),a,b),mu);
 close(integral(x=>x*x*s.density(x),a,b),s.second);close(integral(s.weighted,a,b),s.variance);
 close(s.second-mu*mu,s.variance);close(s.sigma,delta/Math.sqrt(2));
 assert.equal(s.branch,mu===0?'centered':'shifted');
 for(let i=0;i<=100;i++){const x=s.domain[0]+(s.domain[1]-s.domain[0])*i/100;assert.ok(s.density(x)<=s.densityTop&&s.weighted(x)<=s.weightedTop);}
 assert.deepEqual(s.domain,[-8,8]);assert.equal(s.densityTop,1.5);assert.equal(s.weightedTop,.45);
 const shown=integral(s.density,...s.domain),shownVar=integral(s.weighted,...s.domain);
 assert.ok(shown<=1+1e-10&&shown>.99998&&shownVar<=s.variance+1e-10&&shownVar>0);
 count++;
}
for(const [mu,delta] of [[0,1.4],[1.5,1.4],[1.5,.4],[1,1]]) assert.ok(gaussianSquareMoment(mu,delta).variance>0);
console.log(`Gaussian-square visual: ${count} states, independent full-line normalization/moments, fixed-window mass/plot bounds and all presets pass.`);
