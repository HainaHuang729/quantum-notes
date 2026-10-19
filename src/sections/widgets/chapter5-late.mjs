// Equal-strength coherent three-dimensional point-source teaching model;
// lengths are dimensionless, and the plotted Born weight is not a density.
export function twoPathGeometry(y,wavelength,separation,distance){
 const upper=Math.hypot(distance,y-separation/2),lower=Math.hypot(distance,y+separation/2);
 const pathDifference=2*separation*y/(upper+lower);
 const phase=2*Math.PI*pathDifference/wavelength,approxPhase=2*Math.PI*separation*y/(wavelength*distance);
 const a=distance/upper,b=distance/lower;
 const intensity=(a*a+b*b+2*a*b*Math.cos(phase))/4;
 const approximate=(1+Math.cos(approxPhase))/2;
 return {upper,lower,pathDifference,phase,approxPhase,intensity,approximate,error:Math.abs(phase-approxPhase)};
}
export function geometryWindow(wavelength,separation,distance){
 const density=y=>twoPathGeometry(y,wavelength,separation,distance).intensity;
 const integrate=(f,l,r)=>{let s=0;const n=2048,h=(r-l)/n;for(let j=0;j<n;j++)s+=f(l+(j+.5)*h);return s*h;};
 const normalizer=integrate(density,-4,4),centerProbability=integrate(density,-.25,.25)/normalizer;
 const edgeError=twoPathGeometry(4,wavelength,separation,distance).error;
 return {normalizer,centerProbability,edgeError,branch:edgeError<.1?'accurate':'noticeable'};
}
export function realEigenstate(weight,globalDegrees){
 const chi=globalDegrees*Math.PI/180,c=Math.sqrt(1-weight),s=Math.sqrt(weight);
 const phi1=x=>Math.sqrt(2)*Math.cos(Math.PI*x),phi2=x=>Math.sqrt(2)*Math.sin(2*Math.PI*x);
 const real=x=>c*phi1(x)*Math.cos(chi)-s*phi2(x)*Math.sin(chi);
 const imaginary=x=>c*phi1(x)*Math.sin(chi)+s*phi2(x)*Math.cos(chi);
 const energy=(1+3*weight)*Math.PI**2;
 return {real,imaginary,energy,energyVariance:9*Math.PI**4*weight*(1-weight),minimumImaginaryNorm:Math.min(weight,1-weight),currentImaginaryNorm:(1-weight)*Math.sin(chi)**2+weight*Math.cos(chi)**2,
 branch:weight===0||weight===1?'eigenstate':'superposition'};
}
