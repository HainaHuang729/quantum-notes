/** Smooth Gaussian on the real line, m=ℏ=1, V(x)=V0. */
export function initialGaussian(x,sigma){return Math.exp(-x*x/(2*sigma*sigma))/Math.pow(Math.PI*sigma*sigma,.25);}
export function shortTimePoint(x,sigma,epsilon,V,stage=3){
 const initial=initialGaussian(x,sigma),slope=-x*initial/(sigma*sigma),curvature=(x*x/sigma**4-1/(sigma*sigma))*initial;
 const kinetic=epsilon*curvature/2,potential=-epsilon*V*initial,w=epsilon/(sigma*sigma),den=1+w*w;
 const amplitude=Math.exp(-x*x/(2*sigma*sigma*den))/Math.pow(Math.PI*sigma*sigma*den,.25);
 const phase=w*x*x/(2*sigma*sigma*den)-Math.atan(w)/2-V*epsilon;
 return {initial,slope,curvature,kinetic,potential,re:initial,im:(stage>=2?kinetic:0)+(stage>=3?potential:0),exactRe:amplitude*Math.cos(phase),exactIm:amplitude*Math.sin(phase)};
}
export function shortTimeNorm(sigma,epsilon,V){
 return 1+epsilon*epsilon*(V*V+V/(2*sigma*sigma)+3/(16*sigma**4));
}
export const SHORT_TIME_PRESETS=[
 {label:'峰顶',sigma:1,epsilon:.1,V:0,x:0},
 {label:'拐点',sigma:1,epsilon:.1,V:0,x:1},
 {label:'外侧',sigma:1,epsilon:.1,V:0,x:2},
 {label:'拐点加势能',sigma:1,epsilon:.1,V:1,x:1},
];
