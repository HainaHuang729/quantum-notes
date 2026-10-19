export const stringValue = (x,t,coefficients) => Math.SQRT2*coefficients.reduce((sum,a,j)=>sum+a*Math.sin((j+1)*Math.PI*x)*Math.cos((j+1)*Math.PI*t),0);
export const stringEnergyNorm = (t,a) => a.reduce((sum,c,j)=>sum+(c*Math.cos((j+1)*Math.PI*t))**2,0);
export const gaussian = (x,center,width) => Math.exp(-(((x-center)/width)**2))/(Math.sqrt(Math.PI)*width);
export const stringStateClass = a => a.every(x=>x===0) ? 'zero' : a.every(x=>Math.abs(x)<=.05) ? 'near' : 'regular';
export const testFunction = x => 1+x*x;
// The infinite-line Gaussian-weighted mean of 1+x² is exact: variance=width²/2.
export const gaussianMean = (center,width) => 1+center*center+width*width/2;
export function integrate(f,lo,hi,n=2400) { const h=(hi-lo)/n; let s=(f(lo)+f(hi))/2;for(let j=1;j<n;j++)s+=f(lo+j*h);return s*h; }
export function projectPoint([x,y,z],P) { const a=P.azimuth*Math.PI/180,e=P.elevation*Math.PI/180,k=P.scale*Math.sqrt(1.6);return [P.origin[0]+(x*Math.sin(a)-y*Math.cos(a))*k,P.origin[1]+((x*Math.cos(a)+y*Math.sin(a))*Math.sin(e)-z*Math.cos(e))*k]; }
