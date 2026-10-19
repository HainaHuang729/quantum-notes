import assert from 'node:assert/strict';
import {initialGaussian,shortTimePoint,shortTimeNorm,SHORT_TIME_PRESETS} from '../../src/sections/widgets/short-time.mjs';
const near=(a,b,t=2e-9)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);
const simpson=(f,a,b,n)=>{const h=(b-a)/n;let s=f(a)+f(b);for(let j=1;j<n;j++)s+=(j%2?4:2)*f(a+j*h);return s*h/3;};
let count=0;
for(let si=7;si<=15;si++)for(let ti=1;ti<=20;ti++)for(let vi=-4;vi<=4;vi++)for(let xi=-30;xi<=30;xi++){
 const sigma=si/10,t=ti/100,V=vi/4,x=xi/10,p=shortTimePoint(x,sigma,t,V);
 for(const value of Object.values(p))assert.ok(Number.isFinite(value));
 near(p.im,p.kinetic+p.potential);near(p.re,p.initial);
 near(shortTimePoint(x,sigma,t,V,0).im,0);near(shortTimePoint(x,sigma,t,V,1).im,0);
 near(shortTimePoint(x,sigma,t,V,2).im,p.kinetic);
 assert.ok(p.initial<=1&&Math.abs(p.im)<.4);count++;
}
for(let si=7;si<=15;si++){
 const sigma=si/10,A=1/Math.sqrt(sigma*Math.sqrt(Math.PI)),g=x=>A*Math.exp(-x*x/(2*sigma*sigma));
 for(const x of [-2*sigma,-sigma,0,sigma,2*sigma]){
  const h=2e-4,p=shortTimePoint(x,sigma,.1,.5);
  const dd=(-g(x+2*h)+16*g(x+h)-30*g(x)+16*g(x-h)-g(x-2*h))/(12*h*h);
  near(p.curvature,dd,4e-8);near(p.slope,(g(x+h)-g(x-h))/(2*h),3e-8);
 }
 near(shortTimePoint(sigma,sigma,.1,0).curvature,0);
 for(const t of [.01,.1,.2])for(const V of [-1,0,1]){
  const norm=simpson(x=>{const p=shortTimePoint(x,sigma,t,V);return p.re*p.re+p.im*p.im;},-12*sigma,12*sigma,6000);
  near(norm,shortTimeNorm(sigma,t,V));
  const exactNorm=simpson(x=>{const p=shortTimePoint(x,sigma,t,V);return p.exactRe**2+p.exactIm**2;},-12*sigma,12*sigma,6000);
  near(exactNorm,1);
  for(let j=0;j<=800;j++){const x=-4+j/100,p=shortTimePoint(x,sigma,t,V);assert.ok(p.initial<=1&&Math.abs(p.kinetic)<=.4&&Math.abs(p.potential)<=.4&&Math.abs(p.exactIm)<=.4);}
 }
}
// Independent inverse Fourier integral, rather than the production position-space formula.
for(const sigma of [.7,1,1.5])for(const t of [.01,.2])for(const V of [-1,1])for(const x of [0,sigma,2*sigma]){
 const component=(imag,n)=>simpson(k=>Math.sqrt(sigma)/Math.pow(Math.PI,.25)/Math.sqrt(2*Math.PI)*Math.exp(-sigma*sigma*k*k/2)*(imag?Math.sin(k*x-(k*k/2+V)*t):Math.cos(k*x-(k*k/2+V)*t)),-12/sigma,12/sigma,n);
 const p=shortTimePoint(x,sigma,t,V);
 for(const [imag,expected]of [[false,p.exactRe],[true,p.exactIm]]){near(component(imag,6000),component(imag,12000),1e-11);near(component(imag,12000),expected,1e-10);}
}
for(const sigma of [.7,1,1.5])for(const V of [-1,0,1]){
 const error=t=>simpson(x=>{const p=shortTimePoint(x,sigma,t,V);return (p.exactRe-p.re)**2+(p.exactIm-p.im)**2;},-12*sigma,12*sigma,4000);
 const ratio=error(.02)/error(.01);assert.ok(ratio>15.9&&ratio<16.1,'L2 squared error starts at fourth order');
 near((shortTimeNorm(sigma,.2,V)-1)/(shortTimeNorm(sigma,.1,V)-1),4,1e-10);
}
for(const p of SHORT_TIME_PRESETS){assert.ok(p.sigma>=.7&&p.sigma<=1.5&&p.epsilon>=.01&&p.epsilon<=.2&&Math.abs(p.V)<=1&&Math.abs(p.x)<=3);}
for(const t of [.2,.05]){const eta=Math.sqrt(2*Math.PI*t);near(eta*eta/(2*t),Math.PI);near(Math.hypot(Math.cos(eta*eta/(2*t)),Math.sin(eta*eta/(2*t))),1);}
near(Math.sqrt(2*Math.PI*.05)/Math.sqrt(2*Math.PI*.2),.5);
near(initialGaussian(0,1),1/Math.pow(Math.PI,.25));
console.log(`Short-time lab: ${count} control states, independent derivatives/norm integrals, 36 doubled-resolution Fourier integrals, first-order error scaling, presets, phase scales and plot bounds pass.`);
