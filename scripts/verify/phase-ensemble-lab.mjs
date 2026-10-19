import assert from 'node:assert/strict';
import {phaseEnsemble} from '../../src/sections/widgets/postulate-late.mjs';
const close=(a,b,t=1e-11)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(let wi=0;wi<=20;wi++)for(let pi=-20;pi<=20;pi++)for(let theta=0;theta<=90;theta++){
 const w=wi/20,phi=pi*Math.PI/20,t=theta*Math.PI/180;
 for(const mode of ['pure','mixed']){
  const r=phaseEnsemble(w,pi/20,theta,mode);
  // Independent complex state overlap for pure preparation; average two
  // separate component-state probabilities for classical preparation.
  const a=Math.sqrt(w)*Math.cos(t),b=Math.sqrt(1-w)*Math.sin(t);
  const probability=mode==='pure'?(a+b*Math.cos(phi))**2+(b*Math.sin(phi))**2:a*a+b*b;
  close(r.plus,probability);close(r.plus+r.minus,1);
  assert.ok(r.plus>=-1e-12&&r.plus<=1+1e-12);
  close(w*(1-w)-r.re*r.re-r.im*r.im,mode==='pure'?0:w*(1-w));
  close(r.purity,mode==='pure'?1:w*w+(1-w)**2);
  assert.equal(r.branch,wi===0||wi===20?'endpoint':mode==='pure'?'coherent':'mixed');
  // Multiplying the full complex overlap by each global phase leaves |.|².
  if(mode==='pure')for(let g=0;g<4;g++){
   const re=a+b*Math.cos(phi),im=b*Math.sin(phi),chi=g*Math.PI/2;
   close((re*Math.cos(chi)-im*Math.sin(chi))**2+(re*Math.sin(chi)+im*Math.cos(chi))**2,r.plus);
  }
  assert.ok(r.plus>=-.05&&r.plus<=1.05); // actual plotted y window
 }
}
close(phaseEnsemble(.5,0,45,'pure').plus,1);
close(phaseEnsemble(.5,1,45,'pure').plus,0);
close(phaseEnsemble(.5,0,45,'mixed').plus,.5);
for(let theta=0;theta<=90;theta++)close(phaseEnsemble(.5,-1,theta,'mixed').plus,phaseEnsemble(.5,.6,theta,'mixed').plus);
// Pure imaginary coherence is invisible to every real rotated basis, although
// the state is pure. Equal readings in this restricted family do not prove mixing.
for(const w of [.1,.5,.9])for(let theta=0;theta<=90;theta++)close(phaseEnsemble(w,.5,theta,'pure').plus,phaseEnsemble(w,.5,theta,'mixed').plus);
console.log('PhaseEnsembleLab:156702 states, independent complex overlaps/classical averages, all presets/branches, four global phases and plot bounds pass');
