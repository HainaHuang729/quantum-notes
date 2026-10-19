/** Analytic quadratic kernels; checked by scripts/verify/quadratic-kernel.mjs. */
export const KERNEL_PRESETS=[
 {label:'自由',model:'free',T:1,force:0,omega:1,a:0},
 {label:'正恒力',model:'force',T:1,force:1,omega:1,a:0},
 {label:'负恒力',model:'force',T:1,force:-1,omega:1,a:0},
 {label:'振子',model:'oscillator',T:1,force:0,omega:1,a:0},
];
export const KERNEL_PATH_WINDOW=[-.85,1.85];
export function classicalAction(p,x=1,x0=0){
 const {T,force:f,omega:w,model}=p;
 if(model==='oscillator')return w*((x*x+x0*x0)*Math.cos(w*T)-2*x*x0)/(2*Math.sin(w*T));
 return (x-x0)**2/(2*T)+(model==='force'?f*T*(x+x0)/2-f*f*T**3/24:0);
}
export function classicalPath(p,t,x=1,x0=0){
 const {T,force:f,omega:w,model}=p;
 return model==='oscillator'?(x0*Math.sin(w*(T-t))+x*Math.sin(w*t))/Math.sin(w*T):x0+(x-x0)*t/T+(model==='force'?f*t*(t-T)/2:0);
}
export function classicalVelocity(p,t,x=1,x0=0){
 const {T,force:f,omega:w,model}=p;
 return model==='oscillator'?w*(-x0*Math.cos(w*(T-t))+x*Math.cos(w*t))/Math.sin(w*T):(x-x0)/T+(model==='force'?f*(t-T/2):0);
}
export function lagrangian(p,x,v){return v*v/2+(p.model==='force'?p.force*x:p.model==='oscillator'?-(p.omega**2)*x*x/2:0);}
export function kernelState(p){
 const {T,omega:w,a,model}=p,S=classicalAction(p);
 const amplitude=Math.sqrt(model==='oscillator'?w/(2*Math.PI*Math.sin(w*T)):1/(2*Math.PI*T));
 const deltaS=a*a*(Math.PI**2-(model==='oscillator'?(w*T)**2:0))/(4*T),phase=S-Math.PI/4;
 return {S,amplitude,deltaS,deformedAction:S+deltaS,phase,re:amplitude*Math.cos(phase),im:amplitude*Math.sin(phase),path:q=>classicalPath(p,q*T),deformed:q=>classicalPath(p,q*T)+a*Math.sin(Math.PI*q),branch:a===0?'classical':'deformed'};
}

