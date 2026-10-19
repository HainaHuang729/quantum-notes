// Exact teaching models, ℏ=m=1. Free packet initial width Δ=1.
export function currentPacket(momentum,time,center=-2){
 const width2=1+time*time,mean=center+momentum*time;
 const density=x=>Math.exp(-((x-mean)**2)/width2)/Math.sqrt(Math.PI*width2);
 const phaseGradient=x=>momentum+time*(x-mean)/width2;
 const current=x=>density(x)*phaseGradient(x);
 const interval=(left=-1,right=1)=>{
  const n=256,h=(right-left)/n;let total=density(left)+density(right);
  for(let i=1;i<n;i++)total+=(i%2?4:2)*density(left+i*h);
  return total*h/3;
 };
 const left=current(-1),right=current(1);
 return {density,current,phaseGradient,mean,width:Math.sqrt(width2),probability:interval(),left,right,derivative:left-right,
 branch:momentum===0&&time===0?'no-current':left>right?'gaining':left<right?'losing':'balanced'};
}
const norm=z=>z[0]*z[0]+z[1]*z[1];
const plus=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const times=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
export function stepScattering(energyIndex,potentialIndex){
 const energy=energyIndex/10,potential=potentialIndex/10,k=Math.sqrt(2*energy);
 const branch=energyIndex>potentialIndex?'propagating':energyIndex===potentialIndex?'threshold':'evanescent';
 const q=branch==='propagating'?Math.sqrt(2*(energy-potential)):0;
 const kappa=branch==='evanescent'?Math.sqrt(2*(potential-energy)):0;
 const r=branch==='evanescent'?[(k*k-kappa*kappa)/(k*k+kappa*kappa),-2*k*kappa/(k*k+kappa*kappa)]:[(k-q)/(k+q),0];
 const t=plus([1,0],r),R=norm(r),T=branch==='propagating'?q/k*norm(t):0;
 const wave=x=>x<0?plus([Math.cos(k*x),Math.sin(k*x)],times(r,[Math.cos(k*x),-Math.sin(k*x)])):branch==='propagating'?times(t,[Math.cos(q*x),Math.sin(q*x)]):t.map(z=>z*Math.exp(-kappa*x));
 const gradient=x=>x<0?plus([-k*Math.sin(k*x),k*Math.cos(k*x)],times(r,[-k*Math.sin(k*x),-k*Math.cos(k*x)])):branch==='propagating'?times(times(t,[Math.cos(q*x),Math.sin(q*x)]),[0,q]):wave(x).map(z=>-kappa*z);
 const density=x=>norm(wave(x));
 const current=x=>{const z=wave(x),d=gradient(x);return z[0]*d[1]-z[1]*d[0]};
 return {energy,potential,k,q,kappa,r,t,R,T,wave,gradient,density,current,branch,incidentCurrent:k,reflectedCurrent:-k*R,transmittedCurrent:k*T};
}
