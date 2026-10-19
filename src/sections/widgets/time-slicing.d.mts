export const SLICE_PRESETS:{id:string;label:string;N:number;T:number;k:number;d:number}[];
export const SLICE_PATH_Y:[number,number],SLICE_PATH_T:[number,number];
export function phaseModulo(phase:number):number;
export function discreteAction(positions:number[],epsilon:number):number;
export function slicingState(N:number,T:number,selected?:number,offset?:number):{N:number;T:number;M:number;k:number;offset:number;epsilon:number;positions:number[];times:number[];hessian:number[][];pivots:number[];logDet:number;determinant:number;measureLog:number;fluctuationLog:number;logMagnitude:number;magnitude:number;action:number;classicalAction:number;deltaAction:number;pathPhase:number;relativePhase:number;localPhases:number[];measurePhase:number;fluctuationPhase:number;kernelPhase:number;kernel:number[];branch:'classical'|'offset'};
