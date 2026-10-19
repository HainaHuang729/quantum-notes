import assert from 'node:assert/strict';
import {pulseEvolution,pulse} from '../../src/sections/widgets/quantum-evolution.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<3e-12,`${a} != ${b}`);
// Independent matrix exponential by its convergent power series, not the UI formula.
function evolve(v,axis,angle){
 let sum=v.map(z=>[...z]),term=v.map(z=>[...z]);
 for(let k=1;k<60;k++){
  const hv=axis==='A'?[term[1],term[0]]:[term[0],term[1].map(x=>-x)];
  term=hv.map(([r,i])=>[angle*i/k,-angle*r/k]);
  sum=sum.map(([r,i],j)=>[r+term[j][0],i+term[j][1]]);
 }
 return sum;
}
let count=0;
for(let a=0;a<=8;a++)for(let b=0;b<=8;b++)for(const order of ['AB','BA'])for(let stage=0;stage<=2;stage++){
 const s=pulseEvolution(a,b,order,stage);
 let independent=[[Math.SQRT1_2,0],[Math.SQRT1_2,0]];
 for(const axis of order.slice(0,stage))independent=evolve(independent,axis,(axis==='A'?a:b)*Math.PI/8);
 for(let j=0;j<2;j++){near(s.state[j][0],independent[j][0]);near(s.state[j][1],independent[j][1]);assert.ok(s.probabilities[j]>=0&&s.probabilities[j]<=1+1e-12)}
 near(s.norm,1);near(s.total,(a+b)*Math.PI/8);
 assert.equal(s.sameReadout,a%4===0||b%4===0);
 if(stage===2)near(s.probabilities[0],order==='AB'?.5:.5+.5*Math.sin(a*Math.PI/4)*Math.sin(b*Math.PI/4));
 for(const axis of ['A','B']){const v=pulse(pulse(s.state,axis,.73),axis,-.73);for(let j=0;j<2;j++)for(let k=0;k<2;k++)near(v[j][k],s.state[j][k]);}
 count++;
}
near(pulseEvolution(2,2,'AB').probabilities[0],.5);near(pulseEvolution(2,2,'BA').probabilities[0],1);
for(let a=0;a<=8;a++)for(let b=0;b<=8;b++){
 const ab=pulseEvolution(a,b,'AB'),ba=pulseEvolution(a,b,'BA');
 if(ab.sameReadout)near(ab.probabilities[0],ba.probabilities[0]);
 else assert.ok(Math.abs(ab.probabilities[0]-ba.probabilities[0])>=.249999999999);
}
assert.equal(pulseEvolution(2,2).sameReadout,false);
assert.equal(pulseEvolution(0,2).sameReadout,true);
assert.equal(pulseEvolution(4,2).sameReadout,true);
// Plot samples continuous angle even though controls are discrete.
for(let b=0;b<=8;b++)for(let j=0;j<=400;j++)for(const order of ['AB','BA']){
 const s=pulseEvolution(j/50,b,order);
 assert.ok(s.a>=0&&s.a<=Math.PI);
 assert.ok(s.probabilities[0]>=-1e-12&&s.probabilities[0]<=1+1e-12);
}
console.log(`pulse-order-lab: ${count} reachable states passed; independent matrix series, order formula, inverse, boundaries and presets.`);
