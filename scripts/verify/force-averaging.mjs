import assert from "node:assert/strict";
import {forceAveraging,FORCE_PRESETS} from "../../src/sections/widgets/force-averaging.mjs";
const close=(a,b,e=2e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
function quad(f,a,b,n=3000){const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h);return s*h;}
let count=0;
for(let mi=-20;mi<=20;mi++)for(let si=1;si<=15;si++)for(let gi=0;gi<=20;gi++){
 const p={mu:mi/10,sigma:si/10,g:gi/10},r=forceAveraging(p),a=p.mu-9*p.sigma,b=p.mu+9*p.sigma;
 close(quad(r.density,a,b),1);close(quad(x=>x*r.density(x),a,b),p.mu);
 close(quad(x=>x*x*r.density(x),a,b),r.second);close(quad(x=>x**3*r.density(x),a,b),r.third,2e-8);
 close(quad(x=>r.force(x)*r.density(x),a,b),r.average,4e-8);
 close(r.average-r.center,r.difference);close(r.second-p.mu**2,r.variance);
 close(1-quad(r.density,...r.domain),r.tail,2e-9);
 assert.equal(r.branch,p.g===0?"linear":p.mu===0?"symmetric":"nonlinear");
 const h=1e-4;close(-(r.potential(p.mu+h)-r.potential(p.mu-h))/(2*h),r.center,1e-7);
 for(let j=0;j<=100;j++){
  const x=r.domain[0]+(r.domain[1]-r.domain[0])*j/100;
  assert.ok(r.density(x)>=0&&r.density(x)<=r.densityMax);
  const q=r.forceXDomain[0]+(r.forceXDomain[1]-r.forceXDomain[0])*j/100,v=r.force(q);
  assert.ok(Number.isFinite(v)&&v>=r.forceDomain[0]&&v<=r.forceDomain[1]);
 }
 for(const v of [r.average,r.center])assert.ok(v>=r.forceDomain[0]&&v<=r.forceDomain[1]);
 count++;
}
FORCE_PRESETS.forEach((p,i)=>assert.equal(forceAveraging(p).branch,["linear","nonlinear","nonlinear","symmetric"][i]));
close(forceAveraging(FORCE_PRESETS[1]).average,-5);close(forceAveraging(FORCE_PRESETS[1]).center,-2);
close(forceAveraging(FORCE_PRESETS[2]).difference,-.12);
assert.ok(forceAveraging(FORCE_PRESETS[3]).variance>0);
// Neighboring controlled values remain nonlinear; no tolerance is used to
// turn small nonzero corrections into exact equalities.
assert.equal(forceAveraging({mu:.1,sigma:.1,g:.1}).branch,'nonlinear');
assert.equal(forceAveraging({mu:-.1,sigma:.1,g:.1}).branch,'nonlinear');
close(forceAveraging({mu:.1,sigma:.1,g:.1}).difference,-.0003);
// The stated Taylor term is exact for this cubic force, and its units are
// force after F'' is multiplied by a position variance.
for(const mu of [-2,-.1,0,.1,2])for(const sigma of [.1,.8,1.5])for(const g of [0,.1,2]){
 const r=forceAveraging({mu,sigma,g}),secondDerivative=-6*g*mu;
 close(r.difference,.5*secondDerivative*sigma*sigma);
 const reflected=forceAveraging({mu:-mu,sigma,g});
 close(reflected.average,-r.average);close(reflected.difference,-r.difference);
}
console.log(`Force averaging: ${count} Gaussian preparations; independent quadrature, exact branch controls, potential derivative, finite windows/plot bounds and presets pass.`);
