export const PATH_A:number,PATH_N:number;
export type PhaseParameters={a:number;hbar:number};
export const PHASE_PRESETS:(PhaseParameters&{label:string})[];
export function deltaAction(a:number):number;
export function pathAt(t:number,a:number):number;
export function familyMean(hbar:number,n?:number):{re:number;im:number;curve:[number,number][];modulus:number};
export function stationaryState(p:PhaseParameters):{phase:number;delta:number;phasor:[number,number];mean:ReturnType<typeof familyMean>;slope:number;branch:"stationary"|"slow"|"rotating"};
export function shiftPath(a:number,sign:number):number;
