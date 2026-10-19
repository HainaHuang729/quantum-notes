// Dimensionless units: length l0, momentum hbar/l0, time m0*l0²/hbar, mass m0.
export const FREE_WINDOW = [-12,12];
export const FREE_PRESETS = [
  {label:"原地展宽",delta:1,p:0,mass:1,time:3},
  {label:"向右移动",delta:1,p:2,mass:1,time:3},
  {label:"更窄准备",delta:.5,p:0,mass:1,time:3},
  {label:"更重粒子",delta:1,p:0,mass:4,time:3},
];
export function integrate(f,a,b,n=800) {
  const h=(b-a)/n;let sum=f(a)+f(b);
  for(let i=1;i<n;i++)sum+=(i%2?4:2)*f(a+i*h);
  return sum*h/3;
}
export function freePacket(p) {
  const mean=p.p*p.time/p.mass, width=Math.hypot(p.delta,p.time/(p.mass*p.delta));
  const sigmaX=width/Math.SQRT2,sigmaP=1/(Math.SQRT2*p.delta);
  const density=x=>Math.exp(-(((x-mean)/width)**2))/(Math.sqrt(Math.PI)*width);
  const initial=x=>Math.exp(-((x/p.delta)**2))/(Math.sqrt(Math.PI)*p.delta);
  const momentum=q=>p.delta/Math.sqrt(Math.PI)*Math.exp(-(p.delta**2*(q-p.p)**2));
  const windowMass=integrate(density,...FREE_WINDOW),momentumMass=integrate(momentum,-7,7);
  return {mean,width,sigmaX,sigmaP,density,initial,momentum,windowMass,tail:Math.max(0,1-windowMass),momentumTail:Math.max(0,1-momentumMass),
    energy:(p.p**2+sigmaP**2)/(2*p.mass),product:sigmaX*sigmaP,
    branch:p.time===0?"initial":p.p===0?"spreading":"moving"};
}
export const boxEnergy=(n,L,mass=1)=>Math.PI**2*n*n/(2*mass*L*L);
export function boxEnergyReference(n,L){
  const reference=boxEnergy(n,1);
  return {reference,ratio:boxEnergy(n,L)/reference};
}
export function boxEigen(n,L,x) {
  if(Math.abs(x)>=L/2)return 0;
  return Math.sqrt(2/L)*(n%2?Math.cos(n*Math.PI*x/L):Math.sin(n*Math.PI*x/L));
}
export function boxCrossX(n,L) {
  const even=n%2?n+1:n,odd=n%2?n:n+1;
  const J=k=>2*Math.sin(k*Math.PI/2)/(Math.PI*k)**2;
  return L*(J(even+odd)+J(even-odd));
}
export const BOX_PRESETS=[
  {label:"基态",L:2,n:1,weight:1,time:0,phasePi:0},
  {label:"等权叠加",L:2,n:1,weight:.5,time:0,phasePi:0},
  {label:"四分之一拍",L:2,n:1,weight:.5,time:4/(3*Math.PI),phasePi:0},
];
export function boxState(p) {
  const m=p.n+1,En=boxEnergy(p.n,p.L),Em=boxEnergy(m,p.L),theta=(Em-En)*p.time+p.phasePi*Math.PI;
  const a=Math.sqrt(p.weight),b=Math.sqrt(1-p.weight);
  const density=x=>{const u=boxEigen(p.n,p.L,x),v=boxEigen(m,p.L,x);return p.weight*u*u+(1-p.weight)*v*v+2*a*b*u*v*Math.cos(theta);};
  const mean=2*a*b*Math.cos(theta)*boxCrossX(p.n,p.L);
  const second=p.L*p.L*(1/12-(p.weight/(p.n*p.n)+(1-p.weight)/(m*m))/(2*Math.PI**2));
  return {m,En,Em,theta,density,mean,sigmaX:Math.sqrt(Math.max(0,second-mean*mean)),
    energy:p.weight*En+(1-p.weight)*Em,period:2*Math.PI/(Em-En),
    branch:p.weight===0||p.weight===1?"stationary":"beating"};
}
