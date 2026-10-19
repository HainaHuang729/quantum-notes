import assert from 'node:assert/strict';
import {realEigenstate} from '../../src/sections/widgets/chapter5-late.mjs';
const close=(a,b,t=2e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function integrate(f,n=4000){let s=0;for(let j=0;j<n;j++)s+=f(-.5+(j+.5)/n);return s/n;}
let count=0;
for(let wi=0;wi<=20;wi++)for(let chi=0;chi<=360;chi+=15){
 const w=wi/20,r=realEigenstate(w,chi),t=chi*Math.PI/180;
 const baseline=realEigenstate(w,0);
 for(let j=0;j<=400;j++){
  const x=-.5+j/400,c=Math.sqrt(2*(1-w))*Math.cos(Math.PI*x),s=Math.sqrt(2*w)*Math.sin(2*Math.PI*x);
  close(r.real(x),c*Math.cos(t)-s*Math.sin(t));
  close(r.imaginary(x),c*Math.sin(t)+s*Math.cos(t));
  close(r.real(x)**2+r.imaginary(x)**2,baseline.real(x)**2+baseline.imaginary(x)**2);
  assert.ok(Math.abs(r.real(x))<=2.1&&Math.abs(r.imaginary(x))<=2.1);
 }
 close(integrate(x=>r.real(x)**2+r.imaginary(x)**2),1);
 close(r.real(-.5),0);close(r.real(.5),0);close(r.imaginary(-.5),0);close(r.imaginary(.5),0);
 assert.equal(r.branch,wi===0||wi===20?'eigenstate':'superposition');
 close(r.energy,(1-w)*Math.PI**2+w*4*Math.PI**2);
 const variance=(1-w)*(Math.PI**2-r.energy)**2+w*(4*Math.PI**2-r.energy)**2;
 close(r.energyVariance,variance);
 // Orthogonality gives ||Im(e^{iχ}ψ)||²=(1−w)sin²χ+w cos²χ.
 const currentImaginaryNorm=integrate(x=>r.imaginary(x)**2);
 close(r.currentImaginaryNorm,currentImaginaryNorm);
 close(currentImaginaryNorm,(1-w)*Math.sin(t)**2+w*Math.cos(t)**2);
 assert.ok(currentImaginaryNorm>=r.minimumImaginaryNorm-1e-12);
 count++;
}
for(let wi=0;wi<=20;wi++){
 const w=wi/20,minimum=Math.min(...Array.from({length:25},(_,j)=>integrate(x=>realEigenstate(w,j*15).imaginary(x)**2)));
 close(minimum,realEigenstate(w,0).minimumImaginaryNorm);
 // The UI button must attain the lower bound, including w>1/2.
 const best=realEigenstate(w,w>.5?270:0);
 close(integrate(x=>best.imaginary(x)**2),best.minimumImaginaryNorm);
}
// Independent finite-difference Hamiltonian action on both basis functions:
for(const [phi,energy] of [[x=>Math.sqrt(2)*Math.cos(Math.PI*x),Math.PI**2],[x=>Math.sqrt(2)*Math.sin(2*Math.PI*x),4*Math.PI**2]]){
 for(const x of [-.4,-.1,0,.25,.4]){const h=1e-4,minusSecond=-(phi(x+h)-2*phi(x)+phi(x-h))/(h*h);close(minusSecond,energy*phi(x),3e-6);}
}
assert.equal(realEigenstate(0,45).branch,'eigenstate');
assert.equal(realEigenstate(.5,45).branch,'superposition');
close(realEigenstate(0,0).imaginary(.2),0);close(realEigenstate(1,270).imaginary(.2),0);
assert.ok(realEigenstate(.5,0).minimumImaginaryNorm>0);
// The two opposite scattering waves have nonzero Wronskian -2ik.
const k=1.7;
for(const x of [-2,-.1,0,.7,3]){
 const a=[Math.cos(k*x),Math.sin(k*x)],b=[Math.cos(k*x),-Math.sin(k*x)];
 const da=[-k*Math.sin(k*x),k*Math.cos(k*x)],db=[-k*Math.sin(k*x),-k*Math.cos(k*x)];
 const mul=(u,v)=>[u[0]*v[0]-u[1]*v[1],u[0]*v[1]+u[1]*v[0]];
 const adb=mul(a,db),bda=mul(b,da);
 close(adb[0]-bda[0],0);close(adb[1]-bda[1],-2*k);
}
console.log(`RealEigenstateLab: ${count} controlled states, normalization, global-phase invariance, minimum imaginary norm, energy variance and eigen-equation checks pass`);
