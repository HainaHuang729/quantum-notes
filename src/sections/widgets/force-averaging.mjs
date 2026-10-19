// Instantaneous Gaussian position density, not a nonlinear evolution solver.
// Units: length ell, force F0, energy F0*ell; a=1 in F0/ell units.
export const FORCE_PRESETS=[
 {label:"二次势",mu:1,sigma:1,g:0},
 {label:"非线性宽态",mu:1,sigma:1,g:1},
 {label:"较窄准备",mu:1,sigma:.2,g:1},
 {label:"对称抵消",mu:0,sigma:1,g:1},
];
export function forceAveraging(p){
 const variance=p.sigma**2,second=p.mu**2+variance,third=p.mu**3+3*p.mu*variance;
 const force=x=>-x-p.g*x**3,potential=x=>x*x/2+p.g*x**4/4;
 const density=x=>Math.exp(-((x-p.mu)**2)/(2*variance))/(Math.sqrt(2*Math.PI)*p.sigma);
 const average=-p.mu-p.g*third,center=force(p.mu),difference=-3*p.g*p.mu*variance;
 const domain=[p.mu-4*p.sigma,p.mu+4*p.sigma];
 const forceXDomain=[p.mu-2*p.sigma,p.mu+2*p.sigma];
 const y0=force(forceXDomain[1]),y1=force(forceXDomain[0]),pad=.08*(y1-y0);
 return {variance,second,third,force,potential,density,average,center,difference,domain,forceXDomain,forceDomain:[y0-pad,y1+pad],densityMax:1.12/(Math.sqrt(2*Math.PI)*p.sigma),tail:0.00006334248366624,
  branch:p.g===0?"linear":p.mu===0?"symmetric":"nonlinear"};
}
