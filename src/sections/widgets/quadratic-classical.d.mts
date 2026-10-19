export type QuadraticParameters={delta:number;x0:number;p0:number;step:number};
export const QUADRATIC_PRESETS:(QuadraticParameters&{label:string})[];
export const QUADRATIC_WINDOW:[number,number];
export function quadraticState(p:QuadraticParameters):{time:number;mean:number;momentum:number;variance:number;varianceP:number;covariance:number;sigma:number;second:number;density:(x:number)=>number;windowMass:number;energy:number;orbitRadius:number;branch:'fixed-width'|'breathing'};
