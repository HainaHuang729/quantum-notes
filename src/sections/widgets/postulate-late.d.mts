export function filterSequence(thetaDegrees:number,inserted?:boolean):{first:number[];paths:number[][];returnProbability:number;branch:'absent'|'compatible'|'maximal'|'intermediate'};
export function phaseEnsemble(weight:number,phasePi:number,thetaDegrees:number,mode?:'pure'|'mixed'):{plus:number;minus:number;re:number;im:number;purity:number;branch:'endpoint'|'mixed'|'coherent'};
export function integrateLate(f:(x:number)=>number,left:number,right:number,n?:number):number;
export function gaussianPacket(width:number,center?:number,momentum?:number):{xDensity:(x:number)=>number;pDensity:(p:number)=>number;sigmaX:number;sigmaP:number;xInterval:number;pInterval:number;xVisible:number;pVisible:number;branch:'balanced'|'localized'|'momentum-sharp'};
