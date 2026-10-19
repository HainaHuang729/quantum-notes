// Dimensionless teaching models: ħ = 1, energies and times in reciprocal units.
export const C=(r,i=0)=>[r,i];
export const add=(a,b)=>C(a[0]+b[0],a[1]+b[1]);
export const mul=(a,b)=>C(a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]);
export const abs2=a=>a[0]**2+a[1]**2;
export function energyEvolution(gap,weight,phaseDegrees,timeStep){
 const t=timeStep*Math.PI/30,phase=phaseDegrees*Math.PI/180-gap*t;
 const state=[C(Math.sqrt(1-weight)),C(Math.sqrt(weight)*Math.cos(phase),Math.sqrt(weight)*Math.sin(phase))];
 const plus=.5+Math.sqrt(weight*(1-weight))*Math.cos(phase);
 return {t,phase,state,energy:[1-weight,weight],other:[plus,1-plus],norm:state.reduce((s,a)=>s+abs2(a),0)};
}
export function pulse(state,axis,angle){
 const c=C(Math.cos(angle)),s=C(0,-Math.sin(angle));
 const transformed=axis==='A'?[state[1],state[0]]:[state[0],C(-state[1][0],-state[1][1])];
 return state.map((a,i)=>add(mul(c,a),mul(s,transformed[i])));
}
export function pulseEvolution(aStep,bStep,order='AB',stage=2){
 const a=aStep*Math.PI/8,b=bStep*Math.PI/8;
 let state=[C(Math.SQRT1_2),C(Math.SQRT1_2)];
 for(const axis of order.slice(0,stage))state=pulse(state,axis,axis==='A'?a:b);
 const probabilities=state.map(abs2);
 // Exact controlled-grid classification of this initial state's P(0) readout.
 // This is not a claim that the propagators or Hamiltonians commute.
 const sameReadout=aStep%4===0||bStep%4===0;
 return {state,probabilities,norm:probabilities[0]+probabilities[1],a,b,total:a+b,sameReadout};
}
