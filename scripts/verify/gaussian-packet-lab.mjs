import assert from 'node:assert/strict';
import {gaussianPacket} from '../../src/sections/widgets/postulate-late.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
// Independent midpoint quadrature, deliberately not the model Simpson routine.
function midpoint(f,a,b,n=20000){let sum=0;const dx=(b-a)/n;for(let j=0;j<n;j++)sum+=f(a+(j+.5)*dx);return sum*dx;}
for(let di=7;di<=40;di++)for(let ai=-20;ai<=20;ai++)for(let pi=-20;pi<=20;pi++){
 const d=di/20,a=ai/10,p0=pi/10,r=gaussianPacket(d,a,p0);
 close(r.sigmaX*r.sigmaP,.5,1e-12);
 assert.equal(r.branch,di===20?'balanced':di<20?'localized':'momentum-sharp');
 for(const q of [r.xInterval,r.pInterval,r.xVisible,r.pVisible])assert.ok(q>=0&&q<=1+1e-9);
 assert.ok(r.xDensity(a)<1.8&&r.pDensity(p0)<1.3);
 // Peaks, interval boundaries and means are within actual SVG domains.
 assert.ok(a>=-8&&a<=8&&p0>=-10&&p0<=10);
}
for(const d of [.35,.5,1,2])for(const a of [-2,0,2])for(const p0 of [-2,0,2]){
 const r=gaussianPacket(d,a,p0),left=a-12*d,right=a+12*d;
 close(midpoint(r.xDensity,left,right),1);
 close(midpoint(x=>x*r.xDensity(x),left,right),a);
 close(midpoint(x=>(x-a)**2*r.xDensity(x),left,right),d*d/2);
 close(midpoint(r.pDensity,p0-12/d,p0+12/d),1);
 close(midpoint(p=>p*r.pDensity(p),p0-12/d,p0+12/d),p0);
 close(midpoint(p=>(p-p0)**2*r.pDensity(p),p0-12/d,p0+12/d),1/(2*d*d));
 close(r.xInterval,midpoint(r.xDensity,-1,1));close(r.pInterval,midpoint(r.pDensity,-1,1));
 close(r.xVisible,midpoint(r.xDensity,-8,8));close(r.pVisible,midpoint(r.pDensity,-10,10));
 // Independent complex Fourier integral of the wavefunction, including
 // translated center and mean momentum, instead of squared-density formula.
 for(const p of [p0,p0+.4/d]){
  const amp=x=>(Math.PI*d*d)**(-.25)*Math.exp(-((x-a)**2)/(2*d*d))/Math.sqrt(2*Math.PI);
  const re=midpoint(x=>amp(x)*Math.cos((p0-p)*x),left,right);
  const im=midpoint(x=>amp(x)*Math.sin((p0-p)*x),left,right);
  close(re*re+im*im,r.pDensity(p));
 }
}
for(const d of [.5,1,2])assert.equal(gaussianPacket(d).branch,d===1?'balanced':d<1?'localized':'momentum-sharp');
close(gaussianPacket(.5).sigmaX,gaussianPacket(1).sigmaX/2);
close(gaussianPacket(.5).sigmaP,gaussianPacket(1).sigmaP*2);
console.log('GaussianPacketLab:57154 controlled states, all presets, independent normalization/moments/intervals/complex Fourier transform and plot bounds pass');
