// Exact finite-N free-particle Gaussian elimination. Units m=ℏ=1, endpoints 0→1.
// No finite-window oscillatory quadrature; every internal real coordinate is integrated analytically.
export const SLICE_PRESETS=[
 {id:'two',label:'2 段',N:2,T:1,k:1,d:0},
 {id:'six',label:'6 段',N:6,T:1,k:3,d:0},
 {id:'twelve',label:'12 段',N:12,T:1,k:6,d:0},
 {id:'offset',label:'单点偏移',N:6,T:1,k:3,d:.5},
];
export const SLICE_PATH_Y=[-1.1,2.1];
export const SLICE_PATH_T=[0,2];
export const phaseModulo=phase=>Math.atan2(Math.sin(phase),Math.cos(phase));
export function discreteAction(positions,epsilon){
 let sum=0;for(let j=0;j<positions.length-1;j++)sum+=(positions[j+1]-positions[j])**2/(2*epsilon);
 return sum;
}
export function slicingState(N,T,selected=1,offset=0){
 const k=Math.min(N-1,Math.max(1,Math.round(selected))),epsilon=T/N,M=N-1;
 const positions=Array.from({length:N+1},(_,j)=>j/N+(j===k?offset:0));
 const times=Array.from({length:N+1},(_,j)=>j*epsilon);
 const action=discreteAction(positions,epsilon),classicalAction=1/(2*T),deltaAction=offset*offset/epsilon;
 const hessian=Array.from({length:M},(_,j)=>Array.from({length:M},(_,l)=>(j===l?2:Math.abs(j-l)===1?-1:0)/epsilon));
 const pivots=[];let logDet=0;
 for(let j=0;j<M;j++){
  const pivot=j===0?2/epsilon:2/epsilon-1/(epsilon*epsilon*pivots[j-1]);
  pivots.push(pivot);logDet+=Math.log(pivot);
 }
 const measureLog=-N/2*Math.log(2*Math.PI*epsilon);
 const fluctuationLog=M/2*Math.log(2*Math.PI)-logDet/2;
 const logMagnitude=measureLog+fluctuationLog,magnitude=Math.exp(logMagnitude);
 const kernelPhase=classicalAction-Math.PI/4;
 return {N,T,M,k,offset,epsilon,positions,times,hessian,pivots,logDet,determinant:Math.exp(logDet),measureLog,fluctuationLog,logMagnitude,magnitude,
 action,classicalAction,deltaAction,pathPhase:phaseModulo(action),relativePhase:phaseModulo(deltaAction),
 localPhases:[(positions[k]-positions[k-1])**2/(2*epsilon),(positions[k+1]-positions[k])**2/(2*epsilon)],
 measurePhase:-N*Math.PI/4,fluctuationPhase:M*Math.PI/4,kernelPhase:phaseModulo(kernelPhase),
 kernel:[magnitude*Math.cos(kernelPhase),magnitude*Math.sin(kernelPhase)],branch:offset===0?'classical':'offset'};
}
