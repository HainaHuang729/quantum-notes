// Gaussian electromagnetic units are used in the prose. These two models
// concern neutral two-body coordinates and a one-dimensional oscillator.
export function reducedMassState(m1,m2,r){
 const total=m1+m2,mu=m1*m2/total;
 const x1=m2*r/total,x2=-m1*r/total;
 const v1=m2/total,v2=-m1/total; // center-of-mass frame, relative speed = 1
 return {total,mu,x1,x2,v1,v2,kinetic:.5*m1*v1*v1+.5*m2*v2*v2,relativeKinetic:.5*mu};
}
export function oscillatorPhaseState(m,k,amplitude,degrees){
 const phase=degrees*Math.PI/180,omega=Math.sqrt(k/m);
 const q=amplitude*Math.cos(phase),p=-amplitude*Math.sqrt(m*k)*Math.sin(phase);
 const qdot=p/m,pdot=-k*q,energy=p*p/(2*m)+.5*k*q*q;
 return {phase,omega,q,p,qdot,pdot,energy,time:phase/omega,
  branch:amplitude===0?'zero':amplitude<=.1?'near':'regular'};
}
