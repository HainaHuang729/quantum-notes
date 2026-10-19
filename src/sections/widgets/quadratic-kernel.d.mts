export type KernelParameters={model:'free'|'force'|'oscillator';T:number;force:number;omega:number;a:number};
export const KERNEL_PRESETS:(KernelParameters&{label:string})[];
export const KERNEL_PATH_WINDOW:[number,number];
export function classicalAction(p:KernelParameters,x?:number,x0?:number):number;
export function classicalPath(p:KernelParameters,t:number,x?:number,x0?:number):number;
export function classicalVelocity(p:KernelParameters,t:number,x?:number,x0?:number):number;
export function lagrangian(p:KernelParameters,x:number,v:number):number;
export function kernelState(p:KernelParameters):{S:number;amplitude:number;deltaS:number;deformedAction:number;phase:number;re:number;im:number;path:(q:number)=>number;deformed:(q:number)=>number;branch:'classical'|'deformed'};
