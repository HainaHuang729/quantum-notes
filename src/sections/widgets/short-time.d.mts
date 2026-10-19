export function initialGaussian(x:number,sigma:number):number;
export function shortTimePoint(x:number,sigma:number,epsilon:number,V:number,stage?:number):{initial:number;slope:number;curvature:number;kinetic:number;potential:number;re:number;im:number;exactRe:number;exactIm:number};
export function shortTimeNorm(sigma:number,epsilon:number,V:number):number;
export const SHORT_TIME_PRESETS:{label:string;sigma:number;epsilon:number;V:number;x:number}[];
