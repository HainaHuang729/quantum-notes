export type ForceParameters={mu:number;sigma:number;g:number};
export const FORCE_PRESETS:(ForceParameters&{label:string})[];
export function forceAveraging(p:ForceParameters):{variance:number;second:number;third:number;force:(x:number)=>number;potential:(x:number)=>number;density:(x:number)=>number;average:number;center:number;difference:number;domain:[number,number];forceXDomain:[number,number];forceDomain:[number,number];densityMax:number;tail:number;branch:"linear"|"symmetric"|"nonlinear"};
