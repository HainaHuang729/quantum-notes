import assert from "node:assert/strict";
import {freePacket,FREE_PRESETS,FREE_WINDOW} from "../../src/sections/widgets/free-box-math.mjs";
const close=(a,b,e=2e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
// Independent midpoint quadrature: not the model's Simpson window routine.
function quad(f,a,b,n=12000){const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h);return s*h;}
let checked=0;
for(const delta of [.5,.7,1,1.6,2])for(const mass of [1,1.5,4])for(const p of [-2,0,1.3,2])for(const time of [0,.1,1,3,6]){
  const s=freePacket({delta,mass,p,time}),mu=p*time/mass,varX=delta**2/2+time**2/(2*mass**2*delta**2);
  close(s.mean,mu);close(s.sigmaX**2,varX);close(s.sigmaP**2,1/(2*delta**2));
  const a=mu-9*s.sigmaX,b=mu+9*s.sigmaX;
  close(quad(s.density,a,b),1);close(quad(x=>x*s.density(x),a,b),mu,1e-8);
  close(quad(x=>(x-mu)**2*s.density(x),a,b),varX,2e-8);
  close(s.windowMass,quad(s.density,...FREE_WINDOW),3e-8);close(s.tail,1-s.windowMass,3e-8);
  const pmLo=p-9*s.sigmaP,pmHi=p+9*s.sigmaP;
  close(quad(s.momentum,pmLo,pmHi),1);
  close(s.momentumTail,1-quad(s.momentum,-7,7),3e-8);
  close(quad(q=>q*s.momentum(q),pmLo,pmHi),p);
  close(quad(q=>(q-p)**2*s.momentum(q),pmLo,pmHi),s.sigmaP**2);
  close(s.product,s.sigmaX*s.sigmaP);assert.ok(s.windowMass>=0&&s.windowMass<=1+1e-10);checked++;
}
FREE_PRESETS.forEach((p,i)=>assert.equal(freePacket(p).branch,["spreading","moving","spreading","spreading"][i]));
assert.equal(freePacket({delta:1,mass:1,p:2,time:0}).branch,"initial");
close(freePacket({delta:1,mass:1,p:0,time:0}).product,.5);
assert.ok(freePacket({delta:.5,mass:1,p:0,time:3}).sigmaX>freePacket({delta:1,mass:1,p:0,time:3}).sigmaX);
assert.ok(freePacket({delta:1,mass:4,p:0,time:3}).sigmaX<freePacket({delta:1,mass:1,p:0,time:3}).sigmaX);
assert.ok(freePacket({delta:.5,mass:1,p:2,time:6}).tail>.4);
// Independent Fourier transform of the t=0 amplitude at a nontrivial momentum.
const d=.8,p0=1.2,q=.35,A=(Math.PI*d*d)**(-.25)/Math.sqrt(2*Math.PI);
const re=quad(x=>A*Math.exp(-x*x/(2*d*d))*Math.cos((p0-q)*x),-10*d,10*d);
const im=quad(x=>A*Math.exp(-x*x/(2*d*d))*Math.sin((p0-q)*x),-10*d,10*d);
close(re*re+im*im,freePacket({delta:d,p:p0,mass:1,time:0}).momentum(q));
// Source macroscopic order of magnitude, cgs units.
const hbar=1.054571817e-27,v=hbar/(Math.SQRT2*1*1e-13),years=.1/v/(365.25*86400);
assert.ok(v>1e-15&&v<1e-13);assert.ok(years>300000&&years<1000000);
// Independent complex propagation by convolution with the free kernel,
// validating the sign of the spreading chirp and of the carrier phase.
for(const [delta,mass,p,time,x] of [[.5,1,-1,.5,1],[1,2,1.3,1,.2],[2,1,-.7,3,-2]]){
 const tau=time/(mass*delta*delta),mu=p*time/mass;
 const modulus=(Math.PI*delta*delta)**(-.25)*(1+tau*tau)**(-.25)*Math.exp(-((x-mu)**2)/(2*delta*delta*(1+tau*tau)));
 const phase=-.5*Math.atan(tau)+(x-mu)**2*tau/(2*delta*delta*(1+tau*tau))+p*(x-p*time/(2*mass));
 const amplitude=z=>(Math.PI*delta*delta)**(-.25)*Math.exp(-z*z/(2*delta*delta))*Math.sqrt(mass/(2*Math.PI*time));
 const kernelPhase=z=>mass*(x-z)**2/(2*time)-Math.PI/4+p*z;
 const re=quad(z=>amplitude(z)*Math.cos(kernelPhase(z)),-10*delta,10*delta,50000);
 const im=quad(z=>amplitude(z)*Math.sin(kernelPhase(z)),-10*delta,10*delta,50000);
 close(re,modulus*Math.cos(phase),1e-9);close(im,modulus*Math.sin(phase),1e-9);
 close(re*re+im*im,freePacket({delta,mass,p,time}).density(x));
}
// Actual plot bounds: peak heights include the smaller initial width;
// extreme moving means reach the edge exactly, never outside it.
for(const delta of [.5,2])for(const mass of [1,4])for(const p of [-2,2])for(const time of [0,6]){
 const s=freePacket({delta,mass,p,time});
 assert.ok(s.mean>=FREE_WINDOW[0]&&s.mean<=FREE_WINDOW[1]);
 assert.ok(s.density(s.mean)<1.15/(Math.sqrt(Math.PI)*delta));
 assert.ok(s.momentum(p)<1.15*delta/Math.sqrt(Math.PI));
}
console.log(`Free Gaussian: ${checked} parameter states; independent moments/Fourier/window tails and macroscopic estimate pass.`);
