import assert from 'node:assert/strict';
import {quadraticState,QUADRATIC_PRESETS} from '../../src/sections/widgets/quadratic-classical.mjs';
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function quad(f,a,b,n=20000){const h=(b-a)/n;let s=0;for(let j=0;j<n;j++)s+=f(a+(j+.5)*h);return s*h;}
let count=0;
for(const delta of [.5,.7,1,1.3,2])for(const x0 of [-2,0,2])for(const p0 of [-2,0,2])for(let step=0;step<=120;step++){
 const p={delta,x0,p0,step},s=quadraticState(p),initial=quadraticState({...p,step:0});
 close(s.energy,initial.energy);close(s.second-s.mean*s.mean,s.variance);
 close(s.variance*s.varianceP-s.covariance*s.covariance,.25);
 assert.ok(s.variance>0&&s.sigma>=.5/Math.SQRT2-1e-12&&s.sigma<=Math.SQRT2+1e-12);
 assert.equal(s.branch,delta===1?'fixed-width':'breathing');
 const px=150+27*s.mean,py=115-27*s.momentum,r=27*s.orbitRadius;
 assert.ok(px-7>45&&px+7<270&&py-7>25&&py+7<205);
 assert.ok(150-r>45&&150+r<270&&115-r>25&&115+r<205);
 assert.ok(s.mean>=-10&&s.mean<=10&&s.density(s.mean)<1.25);
 assert.ok(s.windowMass>1-3e-7&&s.windowMass<=1+1e-12);
 const h=1e-4,plus=quadraticState({...p,step:step+h*60/Math.PI}),minus=quadraticState({...p,step:step-h*60/Math.PI});
 close((plus.mean-minus.mean)/(2*h),s.momentum,5e-9);
 close((plus.momentum-minus.momentum)/(2*h),-s.mean,5e-9);
 close((plus.variance-minus.variance)/(2*h),2*s.covariance,3e-8);
 if(delta===1)close(s.variance,.5);
 count++;
}
for(const delta of [.5,1,2])for(const x0 of [-2,1])for(const p0 of [-2,0])for(const step of [0,15,30,75,120]){
 const s=quadraticState({delta,x0,p0,step}),a=s.mean-10*s.sigma,b=s.mean+10*s.sigma;
 close(quad(s.density,a,b),1);
 close(quad(x=>x*s.density(x),a,b),s.mean);
 close(quad(x=>(x-s.mean)**2*s.density(x),a,b),s.variance);
 close(quad(x=>x*x*s.density(x),a,b),s.second);
 close(quad(s.density,-10,10),s.windowMass,2e-10);
 const again=quadraticState({delta,x0,p0,step:step+120});
 close(again.mean,s.mean);close(again.momentum,s.momentum);close(again.variance,s.variance);
 close(s.density(s.mean+.3),s.density(s.mean-.3));
}
for(const p of QUADRATIC_PRESETS){assert.equal(quadraticState(p).branch,p.delta===1?'fixed-width':'breathing');close(quadraticState({...p,step:30}).variance,1/(2*p.delta*p.delta));}
// Independent exact harmonic propagator convolution. This tests the whole
// Gaussian density, rather than merely substituting its returned moments.
// hbar=m=omega=1; use 0<t<pi to stay away from kernel caustics.
for(const delta of [.5,1,2])for(const step of [15,30,45]){
 const x0=.7,p0=-.4,t=step*Math.PI/60,sine=Math.sin(t),cosine=Math.cos(t);
 const state=quadraticState({delta,x0,p0,step});
 for(const x of [-.8,.15,1.1]){
  const envelope=y=>(Math.PI*delta*delta)**(-.25)*Math.exp(-((y-x0)**2)/(2*delta*delta));
  const angle=y=>((x*x+y*y)*cosine-2*x*y)/(2*sine)+p0*y;
  const re=quad(y=>envelope(y)*Math.cos(angle(y)),x0-10*delta,x0+10*delta,40000);
  const im=quad(y=>envelope(y)*Math.sin(angle(y)),x0-10*delta,x0+10*delta,40000);
  close((re*re+im*im)/(2*Math.PI*sine),state.density(x),2e-9);
 }
 // The position-dependent phase of the exact pure Gaussian supplies its
 // momentum variance and kinetic energy, independently of the trace formula.
 const v=state.variance,C=state.covariance,mu=state.mean,p=state.momentum;
 const a=mu-10*state.sigma,b=mu+10*state.sigma;
 const kinetic=quad(x=>state.density(x)*((x-mu)**2/(4*v*v)+(p+C*(x-mu)/v)**2)/2,a,b);
 const potential=quad(x=>x*x*state.density(x)/2,a,b);
 close(kinetic+potential,state.energy,2e-9);
 close(quad(x=>(x-mu)*(C*(x-mu)/v)*state.density(x),a,b),C,2e-9);
}
console.log(`QuadraticClassicalLab: ${count} controlled states, independent normalization/moments, Ehrenfest derivatives, conserved energy, periods, all presets and actual plot/SVG bounds pass`);
