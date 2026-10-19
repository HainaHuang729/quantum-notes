// Dimensionless teaching model, not an optical apparatus calibration.
// Probability is conditioned on detection inside [-4.05,4.05]. Each finite
// detector bin integrates the continuous intensity; nodal points are not
// confused with zero-probability intervals.
export const PHOTON_BINS=81;
export const PHOTON_DX=.1;
export const PHOTON_LEFT=-4.05;
export const PHOTON_RIGHT=4.05;
export function photonWeight(x,mode){
 const envelope=Math.exp(-x*x/4);
 return mode==='coherent'?envelope*(1+Math.cos(Math.PI*x)):envelope;
}
function simpson(f,a,b,n=16){let s=f(a)+f(b);const h=(b-a)/n;for(let j=1;j<n;j++)s+=(j%2?4:2)*f(a+j*h);return s*h/3;}
function makeDistribution(mode){
 const masses=Array.from({length:PHOTON_BINS},(_,i)=>simpson(x=>photonWeight(x,mode),PHOTON_LEFT+i*PHOTON_DX,PHOTON_LEFT+(i+1)*PHOTON_DX));
 const normalization=masses.reduce((a,b)=>a+b,0),probabilities=masses.map(p=>p/normalization);
 let cumulative=0;const cdf=probabilities.map(p=>(cumulative+=p));cdf[cdf.length-1]=1;
 return {mode,normalization,probabilities,cdf,centers:probabilities.map((_,i)=>PHOTON_LEFT+(i+.5)*PHOTON_DX)};
}
const distributions={coherent:makeDistribution('coherent'),incoherent:makeDistribution('incoherent')};
export const photonDistribution=mode=>distributions[mode];
export function seededPhotonRandom(seed){let state=seed>>>0;return()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};}
export function photonSampleBin(u,distribution){let lo=0,hi=distribution.cdf.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(u<distribution.cdf[mid])hi=mid;else lo=mid+1;}return lo;}
export function photonCounts(mode,n,seed){
 const distribution=photonDistribution(mode),random=seededPhotonRandom(seed),counts=Array(PHOTON_BINS).fill(0),events=[];
 for(let j=0;j<n;j++){const bin=photonSampleBin(random(),distribution);counts[bin]++;events.push(bin);}
 return {counts,events,distribution,branch:n===0?'empty':n<100?'few':'many'};
}
