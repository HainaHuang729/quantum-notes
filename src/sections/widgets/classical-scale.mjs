// SI teaching model. h is the exact SI defining value; ℏ is derived from it.
export const SCALE_H=6.62607015e-34;
export const SCALE_HBAR=SCALE_H/(2*Math.PI);
export const SCALE_C=299792458;
export const SCALE_YEAR=365.25*24*60*60;
export const SCALE_TARGET=1e-3;
// An interface guard, not a fundamental threshold for the classical limit.
export const SCALE_SPEED_CAP=.01*SCALE_C;
export const SCALE_PRESETS=[
 {id:'gram-nuclear',label:'1 g · 核尺度',logMass:-3,logWidth:-15},
 {id:'gram-visible',label:'1 g · 可见光尺度',logMass:-3,logWidth:-6.25},
 {id:'gram-fine',label:'1 g · 极精细',logMass:-3,logWidth:-29},
 {id:'light',label:'轻粒子',logMass:-30,logWidth:-9},
];
export function scaleMinLogWidth(logMass){
 return Math.max(-29,Math.ceil(4*Math.log10(SCALE_HBAR/(Math.SQRT2*10**logMass*SCALE_SPEED_CAP)))/4);
}
export function classicalScale(logMass,requestedLogWidth,time=1){
 const minimum=scaleMinLogWidth(logMass),logWidth=Math.max(minimum,requestedLogWidth);
 const mass=10**logMass,width=10**logWidth;
 const sigmaX=width/Math.SQRT2,sigmaP=SCALE_HBAR/(Math.SQRT2*width),sigmaV=sigmaP/mass;
 const sigmaXT=Math.hypot(width,SCALE_HBAR*time/(mass*width))/Math.SQRT2;
 const targetTime=sigmaX>=SCALE_TARGET?0:Math.sqrt((SCALE_TARGET-sigmaX)*(SCALE_TARGET+sigmaX))/sigmaV;
 const photonMomentum=SCALE_H/width,photonVelocity=photonMomentum/mass;
 return {mass,width,logWidth,minimum,clamped:logWidth!==requestedLogWidth,time,sigmaX,sigmaP,sigmaV,sigmaXT,targetTime,photonMomentum,photonVelocity,
 branch:sigmaX>=SCALE_TARGET?'already-wide':time>=targetTime?'reached':'not-yet',
 lengthLogs:[Math.log10(sigmaX),Math.log10(sigmaXT),Math.log10(SCALE_TARGET)]};
}
