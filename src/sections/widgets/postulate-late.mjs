// Pure deterministic models for the three late-postulate laboratories.
export function filterSequence(thetaDegrees, inserted = true) {
 const t=thetaDegrees*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
 const first=inserted?[c*c,s*s]:[1,0];
 const paths=inserted?[[c**4,c*c*s*s],[s**4,s*s*c*c]]:[[1,0],[0,0]];
 return {first,paths,returnProbability:paths[0][0]+paths[1][0],branch:!inserted?'absent':thetaDegrees===0||thetaDegrees===90?'compatible':thetaDegrees===45?'maximal':'intermediate'};
}
export function phaseEnsemble(weight,phasePi,thetaDegrees,mode='pure') {
 const t=thetaDegrees*Math.PI/180,c=Math.cos(t),s=Math.sin(t),phi=phasePi*Math.PI;
 const coherence=mode==='pure'?Math.sqrt(weight*(1-weight)):0;
 const re=coherence*Math.cos(phi),im=-coherence*Math.sin(phi);
 const plus=weight*c*c+(1-weight)*s*s+2*c*s*re;
 return {plus,minus:1-plus,re,im,purity:weight*weight+(1-weight)**2+2*coherence*coherence,
 branch:mode==='mixed'?(weight===0||weight===1?'endpoint':'mixed'):weight===0||weight===1?'endpoint':'coherent'};
}
export function integrateLate(f,left,right,n=512){
 const h=(right-left)/n;let sum=f(left)+f(right);
 for(let j=1;j<n;j++)sum+=(j%2?4:2)*f(left+j*h);
 return sum*h/3;
}
export function gaussianPacket(width,center=0,momentum=0){
 const xDensity=x=>Math.exp(-(((x-center)/width)**2))/(Math.sqrt(Math.PI)*width);
 const pDensity=p=>width/Math.sqrt(Math.PI)*Math.exp(-((width*(p-momentum))**2));
 return {xDensity,pDensity,sigmaX:width/Math.sqrt(2),sigmaP:1/(Math.sqrt(2)*width),
 xInterval:integrateLate(xDensity,-1,1),pInterval:integrateLate(pDensity,-1,1),
 xVisible:integrateLate(xDensity,-8,8),pVisible:integrateLate(pDensity,-10,10),
 branch:width===1?'balanced':width<1?'localized':'momentum-sharp'};
}
