// Exact harmonic Gaussian moments in units hbar=m=omega=1.
export const QUADRATIC_PRESETS=[
 {label:'窄准备',delta:.5,x0:1,p0:0,step:0},
 {label:'基准宽度',delta:1,x0:1,p0:0,step:0},
 {label:'宽准备',delta:2,x0:1,p0:0,step:0},
];
export const QUADRATIC_WINDOW=[-10,10];
export function quadraticState({delta,x0,p0,step}){
 const time=step*Math.PI/60,c=Math.cos(time),s=Math.sin(time);
 const mean=x0*c+p0*s,momentum=p0*c-x0*s;
 const vx0=delta*delta/2,vp0=1/(2*delta*delta);
 const variance=vx0*c*c+vp0*s*s,varianceP=vp0*c*c+vx0*s*s,covariance=(vp0-vx0)*s*c;
 const sigma=Math.sqrt(variance),second=mean*mean+variance;
 const density=x=>Math.exp(-((x-mean)**2)/(2*variance))/Math.sqrt(2*Math.PI*variance);
 let total=0;const h=20/1200;
 for(let j=0;j<1200;j++)total+=density(-10+(j+.5)*h)*h;
 return {time,mean,momentum,variance,varianceP,covariance,sigma,second,density,windowMass:total,
 energy:(mean*mean+momentum*momentum+variance+varianceP)/2,
 orbitRadius:Math.hypot(x0,p0),branch:delta===1?'fixed-width':'breathing'};
}
