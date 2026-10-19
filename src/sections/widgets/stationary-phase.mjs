export const PATH_A=1.5, PATH_N=2048;
export const PHASE_PRESETS=[{label:"低 ℏ",a:.5,hbar:.1},{label:"高 ℏ",a:.5,hbar:2},{label:"经典路径",a:0,hbar:.5}];
export const deltaAction=a=>Math.PI**2*a*a/4;
export const pathAt=(t,a)=>t+a*Math.sin(Math.PI*t);
export function familyMean(hbar,n=PATH_N){
 const da=2*PATH_A/n;let re=0,im=0;const curve=[[0,0]];
 // Composite Simpson at each pair; cumulative path is an ordered a integral.
 for(let j=0;j<n;j+=2){
  const a=-PATH_A+j*da,angles=[a,a+da,a+2*da].map(q=>deltaAction(q)/hbar);
  re+=da/(6*PATH_A)*(Math.cos(angles[0])+4*Math.cos(angles[1])+Math.cos(angles[2]));
  im+=da/(6*PATH_A)*(Math.sin(angles[0])+4*Math.sin(angles[1])+Math.sin(angles[2]));
  curve.push([re,im]);
 }
 return {re,im,curve,modulus:Math.hypot(re,im)};
}
export function stationaryState({a,hbar}){
 const phase=deltaAction(a)/hbar,mean=familyMean(hbar);
 return {phase,delta:deltaAction(a),phasor:[Math.cos(phase),Math.sin(phase)],mean,
  slope:Math.PI**2*a/(2*hbar),
  branch:a===0?"stationary":phase<1?"slow":"rotating"};
}
export function shiftPath(a,sign){return Math.min(PATH_A,Math.max(-PATH_A,Math.round((a+sign*.05)*20)/20));}
