import assert from 'node:assert/strict';
import {modeState,modePresets} from '../../src/sections/widgets/eigen-math.mjs';
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(let p=0;p<3;p++){
  const initial=modeState(p,0);close(initial.x1,modePresets[p][0]);close(initial.x2,modePresets[p][1]);
  const h0=1e-4,left=modeState(p,-h0),right=modeState(p,h0);
  close((right.x1-left.x1)/(2*h0),0);close((right.x2-left.x2)/(2*h0),0);
  for(let tick=0;tick<=750;tick++){
    const q=modeState(p,tick*.02),c1=150+25*q.x1,c2=330+25*q.x2;
    assert.ok(c1-25>25&&c2+25<455&&c1+25<c2-25,'masses stay between walls without overlap');
  }
  for(const t of [0,.5,1,4,15]){
    const s=modeState(p,t), h=1e-3, a=modeState(p,t-h),b=modeState(p,t+h);
    close((a.x1-2*s.x1+b.x1)/(h*h),-2*s.x1+s.x2,2e-6);
    close((a.x2-2*s.x2+b.x2)/(h*h),s.x1-2*s.x2,2e-6);
    close(s.qI*s.qI+s.qII*s.qII,s.x1*s.x1+s.x2*s.x2);
    if(p===0){close(s.x1,s.x2);close(s.qII,0)}
    if(p===1){close(s.x1,-s.x2);close(s.qI,0)}
    if(p===2){close(s.initialI,1/Math.SQRT2);close(s.initialII,1/Math.SQRT2)}
  }
}
console.log('coupled-modes: all initial states, modal invariants and Newton equations pass');
